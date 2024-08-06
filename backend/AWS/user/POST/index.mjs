import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client
const client = new DynamoDBClient({});

// Create a DynamoDB document client from the client
const dynamo = DynamoDBDocumentClient.from(client);

// Specify the name of the DynamoDB table
const tableName = "expense-tracker-users";

// Lambda function handler
export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    'Access-Control-Allow-Origin' : '*',
  };

  try {
    // Parse the request body as JSON
    const requestJSON = JSON.parse(event.body);

    // Store the user information in DynamoDB
    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          userid: requestJSON.userid,
          email: requestJSON.email,
        },
      })
    );

    body = { message: "Email and userid stored successfully" };
  } catch (err) {
    // Handle any errors that occur during the process
    statusCode = 400;
    body = { error: err };
  }

  // Return the response with appropriate status code, body, and headers
  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
