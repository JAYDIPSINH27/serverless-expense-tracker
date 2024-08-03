const AWS = require('aws-sdk');
const axios = require('axios');

const textract = new AWS.Textract();

exports.handler = async (event, context, callback) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {
    const { imageUrl } = JSON.parse(event.body);

    if (!imageUrl) {
      // Return an error response if imageUrl is missing
      callback(null, {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ message: 'Missing imageUrl' }),
      });
      return;
    }

    // Fetch the image from the provided URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBytes = response.data;

    const textractParams = {
      Document: {
        Bytes: imageBytes
      },
      FeatureTypes: ["FORMS"]
    };

    // Analyze the document using AWS Textract
    const textractResponse = await textract.analyzeDocument(textractParams).promise();

    let totalAmount = null;

    if (textractResponse && textractResponse.Blocks) {
      const keyMap = {};
      const valueMap = {};
      const blockMap = {};

      // Build maps for key-value pairs and block IDs
      textractResponse.Blocks.forEach(block => {
        const blockId = block.Id;
        blockMap[blockId] = block;

        if (block.BlockType === 'KEY_VALUE_SET') {
          if (block.EntityTypes.includes('KEY')) {
            keyMap[blockId] = block;
          } else if (block.EntityTypes.includes('VALUE')) {
            valueMap[blockId] = block;
          }
        }
      });

      // Find the total amount by searching for the key "total"
      for (const keyBlockId in keyMap) {
        const keyBlock = keyMap[keyBlockId];
        const keyText = getText(keyBlock, blockMap);

        if (/total/i.test(keyText)) {
          const valueBlock = findValueBlock(keyBlock, valueMap);
          if (valueBlock) {
            totalAmount = getText(valueBlock, blockMap);
            break;
          }
        }
      }
    }

    if (!totalAmount) {
      // Return an error response if totalAmount is not found
      callback(null, {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ message: 'Total amount not found in receipt' }),
      });
      return;
    }

    // Return a success response with the total amount
    callback(null, {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: `Total amount found: ${totalAmount}` }),
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    // Return an error response for any other errors
    callback(null, {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  }
};

// Helper function to get the text from a block
function getText(block, blockMap) {
  let text = '';
  if (block.Relationships) {
    block.Relationships.forEach(relationship => {
      if (relationship.Type === 'CHILD') {
        relationship.Ids.forEach(childId => {
          const word = blockMap[childId];
          if (word && word.BlockType === 'WORD') {
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
      if (relationship.Type === 'VALUE') {
        for (const valueId of relationship.Ids) {
          return valueMap[valueId];
        }
      }
    }
  }
  return null;
}
