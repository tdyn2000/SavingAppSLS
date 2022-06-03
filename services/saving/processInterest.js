import { getSavingAccounts, updateSavingAccount } from './dao/savingAccountDAO';

const processInterest = async (event) => {
    const interestRate = 0.07 / 360;
    const interest = 1 + interestRate;
    let savingAccounts;
    try {
        savingAccounts = await getSavingAccounts();
    } catch (error) {
        console.log(error);
    };
    savingAccounts.forEach(async (savingAccount) => {
        const newAmount = savingAccount.amount * interest;
        await updateSavingAccount(savingAccount.id, newAmount);
    });
    console.log("processInterest success at "+new Date());
};

export const handler = processInterest;
