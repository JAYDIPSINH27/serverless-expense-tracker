const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {
    // Parse the request body to extract userId and userDetails
    const { userId, userDetails } = JSON.parse(event.body);

    // Check if userId or userDetails is missing
    if (!userId || !userDetails) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ message: 'Missing userId or userDetails' }),
      };
    }

    // Prepare the parameters for DynamoDB put operation
    const params = {
      TableName: 'expense-tracker-users',
      Item: {
        userid: userId,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        bio: userDetails.bio,
        address: userDetails.address,
        monthlyBudget: userDetails.monthlyBudget,
        email: userDetails.email,
        profilePicture: userDetails.profilePicture
      }
    };

    // Perform the DynamoDB put operation to add/update the user profile
    await dynamoDB.send(new PutCommand(params));

    // Return a success response
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: `User profile for ${userId} added successfully` }),
    };
  } catch (error) {
    console.error('Error adding user profile:', error);

    // Return an error response
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};
