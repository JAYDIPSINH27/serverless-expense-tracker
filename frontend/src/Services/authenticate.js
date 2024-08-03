import {AuthenticationDetails,CognitoUser} from 'amazon-cognito-identity-js';   
import {userpool} from '../Config/userpool';

export const authenticate = (email,password) => {
    return new Promise((resolve,reject) => {
        const user = new CognitoUser({
            Username: email,
            Pool: userpool
        });

        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });

        user.authenticateUser(authDetails,{
            onSuccess: data => {
                console.log('onSuccess:',data);
                resolve(data);
            },
            onFailure: err => {
                console.error('onFailure:',err);
                reject(err);
            }
        });
    });
    
}

export const logout = () => {
    const user = userpool.getCurrentUser();
    user.signOut();
    window.location.href = '/';
};