import commonMiddleware from '../../utils/commonMiddleware';
import createError from "http-errors";
import { getSavingAccount, updateSavingAccount } from './dao/savingAccountDAO';
import { sendResponse } from "../../utils";
import validator from '@middy/validator';
import inputSchema from './schemas/inputSchema';

const withdraw = async (event) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const { amount } = event.body;
    if (amount <= 0) {
        throw new createError.Forbidden('Withdraw amount must greater than 0');
    }
    let savingAccount;
    try {
        savingAccount = await getSavingAccount(userId);
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    };
    if (!savingAccount) {
        throw new createError.NotFound("Saving account not found");
    };
    if (amount > savingAccount.amount) {
        throw new createError.Forbidden('Withdraw amount must smaller than balance amount');
    }
    const newAmount = savingAccount.amount - amount;
    const updateAccount = await updateSavingAccount(savingAccount.id, newAmount);
    return sendResponse(200, { message: 'Withdraw Success', data: updateAccount });
};

export const handler = commonMiddleware(withdraw).use(validator({ inputSchema: inputSchema }));