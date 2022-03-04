import moment from "moment";

import { TransactionTypeEnum } from "../src/enum/TransactionTypeEnum";
import { Account, Lock, Transaction, User } from "../src/models/model";

/* istanbul ignore file */
// import { Account } from "../src/models/Account.model";
// import { Lock } from "../src/models/Lock.model";
// import { Transaction } from "../src/models/Transaction.model";
// import { User } from "../src/models/User.model";

export default class TestHelpers {
  public static async createUser(values: any = {}): Promise<any> {
    try {
      const userId: number = await User.max("id");

      const newUser = await User.create({
        id: userId + 1,
        firstName: "UnitTest",
        lastName: values.lastName || "LastName",
        password: "UnitTest",
        userName: `${values.userName}${moment().valueOf()}` || `UnitTest${moment().valueOf()}`,
        email: `${moment().valueOf()}@email.com`,
      });

      return newUser.getDataValue("id");
    } catch (error) {
      console.log(error);
    }
  }

  public static async createAccount(userId: number, values: any = {}): Promise<any> {
    try {
      const accountId: number = await Account.max("id");

      const newAccount = await Account.create({
        id: accountId + 1,
        accountName: values.accountName || "UnitTest",
        closedAt: values.closedAt || null,
        balance: values.balance || 1000,
        userId,
      });

      return newAccount.getDataValue("id");
    } catch (error) {
      console.log(error);
    }
  }

  public static async createTransaction(
    userId: number,
    accountId: number,
    transactionType: TransactionTypeEnum,
    amount: number,
    idempotencyKey: string
  ): Promise<any> {
    try {
      const transactionId: number = await Transaction.max("id");

      const newTransaction = await Transaction.create({
        id: transactionId + 1,
        userId: userId,
        accountId: accountId,
        transactionType: transactionType,
        amount: amount,
        idempotencyKey: idempotencyKey,
      });

      return newTransaction.getDataValue("id");
    } catch (error) {
      console.log(error);
    }
  }

  public static async createLock(values: any = {}): Promise<any> {
    try {
      const lockId: number = await Lock.max("id");

      const newLock = await Lock.create({
        id: lockId + 1,
        userId: values.userId,
        accountId: values.accountId,
        lockToken: values.lockToken,
        expiry: values.expiry,
        releasedAt: values.releasedAt || null,
      });

      return newLock.getDataValue("lockToken");
    } catch (error) {
      console.log(error);
    }
  }

  public static async deleteUsers(ids: number[]): Promise<void> {
    await User.destroy({
      where: {
        id: ids,
      },
    });
  }

  public static async deleteAccounts(ids: number[]): Promise<void> {
    await Account.destroy({
      where: {
        id: ids,
      },
    });
  }

  public static async deleteTransactions(ids: number[]): Promise<void> {
    await Transaction.destroy({
      where: {
        id: ids,
      },
    });
  }

  public static async deleteLocks(lockTokens: string[]): Promise<void> {
    await Lock.destroy({
      where: {
        lockToken: lockTokens,
      },
    });
  }
}
