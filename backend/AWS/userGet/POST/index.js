const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "expense-tracker-users";

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  };

  try {
    const requestJSON = JSON.parse(event.body);
    const { userid } = requestJSON;

    const { Item } = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          userid: userid,
        },
      })
    );

    if (Item) {
      body = Item;
    } else {
      statusCode = 404;
      body = { message: "User not found" };
    }
  } catch (err) {
    statusCode = 400;
    body = { error: err.message };
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
