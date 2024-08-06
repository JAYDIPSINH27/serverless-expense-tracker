import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Create an instance of DynamoDB DocumentClient
const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

// Specify the name of the DynamoDB table
const tableName = 'expense-tracker-data';

// Define the Lambda function handler
export const handler = async (event) => {
    // Set the CORS headers to allow cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };

    let body;
    let statusCode = 200;

    // Set the parameters for the DynamoDB scan operation
    const params = {
        TableName: tableName,
    };

    try {
        // Perform the DynamoDB scan operation to fetch all items from the table
        const data = await dynamoDb.send(new ScanCommand(params));

        // Convert the fetched items to JSON and assign it to the response body
        body = JSON.stringify({ expense: data.Items });

    } catch (error) {
        console.error("Error fetching expenses:", error);

        statusCode = 500;
        body = JSON.stringify({ message: 'An error occurred while fetching the expenses', error: error.message });
    }

    // Return the response with the appropriate status code, body, and headers
    return {
        statusCode,
        body,
        headers 
    };
};
