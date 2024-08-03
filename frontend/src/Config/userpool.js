import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: process.env.REACT_APP_USER_POOL_ID,
    ClientId: process.env.REACT_APP_CLIENT_ID
};

const userpool = new CognitoUserPool(poolData);

// Function to get current authenticated user
const getCurrentUser = () => {
    return userpool.getCurrentUser();
};

// Function to fetch user attributes
const fetchUserAttributes = (currentUser) => {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            reject(new Error('No user signed in'));
        } else {
            currentUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                } else {
                    currentUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            reject(err);
                        } else {
                            const emailAttribute = attributes.find(attr => attr.getName() === 'email');
                            const email = emailAttribute ? emailAttribute.getValue() : null;
                            resolve({ email });
                        }
                    });
                }
            });
        }
    });
};

export { userpool, getCurrentUser, fetchUserAttributes };
