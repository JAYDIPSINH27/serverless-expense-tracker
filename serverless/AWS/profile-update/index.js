const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
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
      callback(null, {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ message: 'Missing userId or userDetails' }),
      });
      return;
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
    await dynamoDB.put(params).promise();

    // Return a success response
    callback(null, {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: `User profile for ${userId} added successfully` }),
    });
  } catch (error) {
    console.error('Error adding user profile:', error);
    // Return an error response
    callback(null, {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  }
};
