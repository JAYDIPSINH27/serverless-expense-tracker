import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client
const client = new DynamoDBClient({});

// Create a DynamoDB document client from the client
const dynamo = DynamoDBDocumentClient.from(client);

// Specify the name of the DynamoDB table
const tableName = "expense-tracker-data";

// Define the handler function for the AWS Lambda function
export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    'Access-Control-Allow-Origin' : '*',
  };

  try {
    // Parse the request body as JSON
    const requestJSON = JSON.parse(event.body);

    // Store the expense item in DynamoDB using the PutCommand
    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          expenseId: requestJSON.expenseId,
          amount: requestJSON.amount,
          category: requestJSON.category,
          description: requestJSON.description,
          imageURL: requestJSON.imageURL,
          userId: requestJSON.userId,  
          timestamp: requestJSON.timestamp  
        },
      })
    );

    // Set the response body with a success message
    body = { message: "Expense stored successfully" };
  } catch (err) {
    // If an error occurs, set the status code to 400 and include the error message in the response body
    statusCode = 400;
    body = { error: err.message };
  }

  // Return the response with the status code, body, and headers
  return {
    statusCode,
    body: JSON.stringify(body),
    headers
  };
};
