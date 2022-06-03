import AWS from 'aws-sdk';
import commonMiddleware from '../../utils/commonMiddleware';
import { sendResponse, validateInput } from '../../utils';
const cognito = new AWS.CognitoIdentityServiceProvider();

const login = async (event) => {
    try {
        const isValid = validateInput(event.body);
        if (!isValid)
            return sendResponse(400, { message: 'Invalid input' });

        const { email, password } = event.body;
        const { USER_POOL_ID, CLIENT_ID } = process.env;
        const params = {
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        const response = await cognito.adminInitiateAuth(params).promise();
        const { IdToken, AccessToken } = response.AuthenticationResult;
        return sendResponse(200, { message: 'Success', data: { AccessToken, IdToken } });
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error';
        return sendResponse(500, { message });
    };
};

export const handler = commonMiddleware(login);