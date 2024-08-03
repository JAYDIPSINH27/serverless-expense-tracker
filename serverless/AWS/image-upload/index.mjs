import AWS from 'aws-sdk';

// Create a new instance of the AWS S3 service
const S3 = new AWS.S3();

// Specify the name of the S3 bucket where the images will be uploaded
const bucketName = 'expense-tracker-images';

// Define the AWS Lambda function handler
export const handler = async (event, context) => {
    let statusCode = 200;

    // Define the CORS headers to allow cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };

    try {
        // Parse the request body as JSON
        const responseJSON = JSON.parse(event.body);

        // Extract the base64-encoded image data from the request body
        const base64Data = responseJSON.image.split(',')[1];

        // Convert the base64 data to a buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Generate a unique key for the image file
        const key = `${Date.now()}.png`;

        // Set the parameters for uploading the image to S3
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: imageBuffer,
            ContentType: 'image/png',
        };

        // Upload the image to the S3 bucket
        await S3.putObject(params).promise();

        // Construct the URL for accessing the uploaded image
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

        // Create the response body with a success message and the image URL
        const body = JSON.stringify({ message: 'Image uploaded successfully.', imageUrl });

        // Return the response with the success status code, body, and headers
        return {
            statusCode,
            body,
            headers
        };
    } catch (error) {
        // If an error occurs, set the status code to 500 and create an error message
        statusCode = 500;
        const body = JSON.stringify({ message: error.message });

        // Return the response with the error status code, body, and headers
        return {
            statusCode,
            body,
            headers
        };
    }
};
