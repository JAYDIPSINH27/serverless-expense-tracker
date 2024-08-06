import AWS from 'aws-sdk';

// Create an instance of DynamoDB DocumentClient
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Specify the name of the DynamoDB table
const tableName = 'expense-tracker-data';

// Define the Lambda function handler
export const handler = async (event) => {
    // Set the CORS headers to allow cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin' : '*',
    };

    let body;
    let statusCode = 200;

    // Set the parameters for the DynamoDB scan operation
    const params = {
        TableName: tableName,
    };

    try {
        // Perform the DynamoDB scan operation to fetch all items from the table
        const data = await dynamoDb.scan(params).promise();

        // Convert the fetched items to JSON and assign it to the response body
        body = JSON.stringify({ expense: data.Items });

    } catch (error) {
        console.error("Error fetching Expenses:", error);

        statusCode = 500;
        body = JSON.stringify({ message: 'An error occurred while fetching the expenses' });
    }

    // Return the response with the appropriate status code, body, and headers
    return {
        statusCode,
        body,
        headers 
    };
};
