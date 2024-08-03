const AWS = require("aws-sdk");
const sns = new AWS.SNS({ region: "us-east-1" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const expenseTable = "expense-tracker-data";
  const userTable = "expense-tracker-users";
  const currentYearMonth = new Date().toISOString().substr(0, 7); // Get current year and month

  try {
    for (const record of event.Records) {
      if (record.eventName !== "INSERT") continue;

      const newExpense = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      const userId = newExpense.userId;
      const amount = parseFloat(newExpense.amount);
      const timestamp = new Date(newExpense.timestamp);

      const yearMonth = timestamp.toISOString().substr(0, 7); // Get the year and month
      if (yearMonth !== currentYearMonth) continue;

      // Fetch the user data
      const userParams = {
        TableName: userTable,
        Key: {
          userid: userId,
        },
      };
      const userResult = await dynamoDB.get(userParams).promise();
      const userData = userResult.Item;

      if (!userData || !userData.monthlyBudget) continue;

      const monthlyBudget = parseFloat(userData.monthlyBudget);

      // Scan expenses for the current month
      const expenseParams = {
        TableName: expenseTable,
        FilterExpression: "userId = :userId AND begins_with(#ts, :yearMonth)",
        ExpressionAttributeNames: {
          "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":yearMonth": yearMonth,
        },
      };
      const expenseResult = await dynamoDB.scan(expenseParams).promise();
      const expenses = expenseResult.Items;
      const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      if (totalExpenses > monthlyBudget) {
        const topicName = `AuthTopic-${userId}`;
        const getTopicArnByName = async (topicName) => {
          let nextToken = null;
          do {
            const listTopicsParams = {
              NextToken: nextToken,
            };
            const topicsResponse = await sns.listTopics(listTopicsParams).promise();
            for (const topic of topicsResponse.Topics) {
              const topicArn = topic.TopicArn;
              const arnParts = topicArn.split(":");
              const existingTopicName = arnParts[arnParts.length - 1];
              if (existingTopicName === topicName) {
                return topicArn;
              }
            }
            nextToken = topicsResponse.NextToken;
          } while (nextToken);
          return null;
        };
        const topicArn = await getTopicArnByName(topicName);

        if (topicArn) {
          const publishParams = {
            Message: `Your total expenses for the month have exceeded your budget. Total: ${totalExpenses}, Budget: ${monthlyBudget}`,
            Subject: "Monthly Budget Exceeded",
            TopicArn: topicArn,
          };
          await sns.publish(publishParams).promise();
        }
      }
    }
  } catch (err) {
    console.error("Error processing expense:", err);
  }
};
