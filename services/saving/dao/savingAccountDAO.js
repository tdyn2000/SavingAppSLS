import AWS from 'aws-sdk';
import { v4 as uuid } from "uuid";
import createError from "http-errors";
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const getSavingAccounts = async () => {
    let params = { TableName: process.env.SAVING_TABLE };
    let data;
    const itemsAll = [];
    do {
        data = await dynamoDB.scan(params).promise();
        itemsAll.push(...data.Items);
        params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (typeof data.LastEvaluatedKey != "undefined");
    return itemsAll;
};

export const getSavingAccount = async (userId) => {
    const params = {
        TableName: process.env.SAVING_TABLE,
        IndexName: 'userId',
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ExpressionAttributeNames: {
            '#userId': 'userId',
        },
    };
    const result = await dynamoDB.query(params).promise();
    if (result.Items.length < 1) {
        return null;
    }
    return result.Items[0];
};

export const createSavingAccount = async (userId, amount = 0) => {
    const now = new Date();
    const savingAccount = {
        id: uuid(),
        userId: userId,
        createdAt: now.toISOString(),
        updateAt: now.toISOString(),
        amount: amount
    };

    try {
        await dynamoDB.put({
            TableName: process.env.SAVING_TABLE,
            Item: savingAccount,
        }).promise();
        return savingAccount;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};

export const updateSavingAccount = async (id, amount = 0) => {
    const params = {
        TableName: process.env.SAVING_TABLE,
        Key: { id },
        UpdateExpression: 'set amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
    };

    let updateAccount;

    try {
        const result = await dynamoDB.update(params).promise();
        updateAccount = result.Attributes;
        return updateAccount;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};