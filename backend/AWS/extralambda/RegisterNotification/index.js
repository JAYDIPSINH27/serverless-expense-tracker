const AWS = require("aws-sdk");

const sns = new AWS.SNS({ region: "us-east-1" });

exports.handler = async (event, context, callback) => {
  try {
    // Extract user attributes from the event
    const userAttributes = event.request.userAttributes;
    const email = userAttributes.email;
    const userId = userAttributes.sub;

    // Check if email and userId are present
    if (!email || !userId) {
      throw new Error("Email and UserId are required");
    }

    // Generate topic name based on userId
    const topicName = `AuthTopic-${userId}`;

    // Function to get the ARN of a topic by name
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

    // Function to check if an email is already subscribed to a topic
    const isEmailSubscribed = async (topicArn, email) => {
      let nextToken = null;
      do {
        const listSubscriptionsParams = {
          TopicArn: topicArn,
          NextToken: nextToken,
        };
        const subscriptionsResponse = await sns
          .listSubscriptionsByTopic(listSubscriptionsParams)
          .promise();
        for (const subscription of subscriptionsResponse.Subscriptions) {
          if (subscription.Endpoint === email) {
            return true;
          }
        }
        nextToken = subscriptionsResponse.NextToken;
      } while (nextToken);
      return false;
    };

    // Get the ARN of the topic by name
    let topicArn = await getTopicArnByName(topicName);

    // If the topic doesn't exist, create it
    if (!topicArn) {
      const createTopicParams = {
        Name: topicName,
      };
      const createTopicResponse = await sns.createTopic(createTopicParams).promise();
      topicArn = createTopicResponse.TopicArn;
      console.log(`Created SNS topic ${topicArn}`);
    } else {
      console.log(`SNS topic ${topicArn} already exists`);
    }

    // Check if the email is already subscribed to the topic
    const subscribed = await isEmailSubscribed(topicArn, email);

    // If not subscribed, subscribe the email to the topic
    if (!subscribed) {
      const subscribeParams = {
        Protocol: "email",
        TopicArn: topicArn,
        Endpoint: email,
        ReturnSubscriptionArn: true,
      };
      const subscribeResponse = await sns.subscribe(subscribeParams).promise();
      console.log(`Subscribed email ${email} to topic ${topicArn}:`, subscribeResponse);

      // Function to confirm the subscription
      const confirmSubscription = async (subscriptionArn) => {
        let isConfirmed = false;
        const maxAttempts = 10;
        let attempts = 0;
        while (!isConfirmed && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const listSubscriptionsParams = {
            TopicArn: topicArn,
          };
          const subscriptionsResponse = await sns
            .listSubscriptionsByTopic(listSubscriptionsParams)
            .promise();
          for (const subscription of subscriptionsResponse.Subscriptions) {
            if (subscription.Endpoint === email && subscription.SubscriptionArn !== 'PendingConfirmation') {
              isConfirmed = true;
              break;
            }
          }
          attempts++;
        }
        if (!isConfirmed) {
          throw new Error(`Subscription for email ${email} not confirmed within the allowed time.`);
        }
      };

      // Confirm the subscription
      await confirmSubscription(subscribeResponse.SubscriptionArn);
      console.log(`Confirmed subscription for ${email}`);
    } else {
      console.log(`Email ${email} is already subscribed to topic ${topicArn}`);
    }

    // Publish a message to the topic
    const publishParams = {
      Message: `User ${email} has successfully registered.`,
      Subject: "Registration Successful",
      TopicArn: topicArn,
    };
    const publishResponse = await sns.publish(publishParams).promise();
    console.log(`Published message to topic ${topicArn}:`, publishResponse);

    // Callback with the event
    callback(null, event);
  } catch (err) {
    console.error("Error processing notification:", err);
    callback(new Error("Error processing notification"));
  }
};
