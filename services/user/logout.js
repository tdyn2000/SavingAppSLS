import AWS from 'aws-sdk';
import commonMiddleware from '../../utils/commonMiddleware';
import { sendResponse, validateToken } from '../../utils';
const cognito = new AWS.CognitoIdentityServiceProvider();

const logout = async (event) => {
    try {
        const isValid = validateToken(event.body);
        if (!isValid)
            return sendResponse(400, { message: 'Invalid token' });

        const { AccessToken } = event.body;
        const params = {
            AccessToken
        };
        await cognito.globalSignOut(params).promise();
        return sendResponse(200, { message: 'User logout successful' });
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error';
        return sendResponse(500, { message });
    }
};

export const handler = commonMiddleware(logout);