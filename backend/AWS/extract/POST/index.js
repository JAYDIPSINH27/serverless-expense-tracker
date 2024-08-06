import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import axios from "axios";

const textractClient = new TextractClient({ region: "your-region" });

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  try {
    const { imageUrl } = JSON.parse(event.body);

    if (!imageUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing imageUrl" }),
      };
    }

    // Fetch the image from the provided URL
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBytes = response.data;

    const textractParams = {
      Document: { Bytes: imageBytes },
      FeatureTypes: ["FORMS"],
    };

    // Analyze the document using AWS Textract
    const textractResponse = await textractClient.send(new AnalyzeDocumentCommand(textractParams));

    const totalAmount = extractTotalAmount(textractResponse.Blocks);

    if (!totalAmount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Total amount not found in receipt" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: `Total amount found: ${totalAmount}` }),
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

// Helper function to extract the total amount from the Textract response blocks
function extractTotalAmount(blocks) {
  if (!blocks) return null;

  const keyMap = {};
  const valueMap = {};
  const blockMap = {};

  blocks.forEach((block) => {
    const blockId = block.Id;
    blockMap[blockId] = block;

    if (block.BlockType === "KEY_VALUE_SET") {
      if (block.EntityTypes.includes("KEY")) {
        keyMap[blockId] = block;
      } else if (block.EntityTypes.includes("VALUE")) {
        valueMap[blockId] = block;
      }
    }
  });

  for (const keyBlockId in keyMap) {
    const keyBlock = keyMap[keyBlockId];
    const keyText = getText(keyBlock, blockMap);

    if (/total/i.test(keyText)) {
      const valueBlock = findValueBlock(keyBlock, valueMap);
      if (valueBlock) {
        return getText(valueBlock, blockMap);
      }
    }
  }

  return null;
}

// Helper function to get the text from a block
function getText(block, blockMap) {
  let text = "";
  if (block.Relationships) {
    block.Relationships.forEach((relationship) => {
      if (relationship.Type === "CHILD") {
        relationship.Ids.forEach((childId) => {
          const word = blockMap[childId];
          if (word && word.BlockType === "WORD") {
            text += `${word.Text} `;
          }
        });
      }
    });
  }
  return text.trim();
}

// Helper function to find the value block corresponding to a key block
function findValueBlock(keyBlock, valueMap) {
  if (keyBlock.Relationships) {
    for (const relationship of keyBlock.Relationships) {
      if (relationship.Type === "VALUE") {
        for (const valueId of relationship.Ids) {
          return valueMap[valueId];
        }
      }
    }
  }
  return null;
}
