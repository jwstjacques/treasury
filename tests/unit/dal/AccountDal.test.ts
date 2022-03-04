import moment from "moment";

import AccountDal from "../../../src/dal/AccountDal";
import { LockTokenStatusEnum } from "../../../src/enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../../../src/enum/TransactionStatusEnum";
import { TransactionTypeEnum } from "../../../src/enum/TransactionTypeEnum";
import { Account, User } from "../../../src/models/model";
import TestHelpers from "../../TestHelper";

// import { Account } from "../../../src/models/Account.model";
jest.setTimeout(10000);

describe("AccountDal", () => {
  describe("createAccount", () => {
    let userId: number;
    const accountIds: number[] = [];

    beforeAll(async () => {
      // Create User
      userId = await TestHelpers.createUser({
        userName: "createAccountDalTest",
      });
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers([userId]);
    });

    describe("success", () => {
      it("should create new account for valid userId", async () => {
        const dal = new AccountDal();

        const accountName = "New Created Account" + moment().valueOf();

        const result = await dal.createAccount(userId, accountName);

        const accountId = result.getDataValue("id");
        accountIds.push(accountId);

        const newAccountName = result.getDataValue("accountName");

        expect(result).not.toBeNull();
        expect(newAccountName).toBe(accountName);
      });
    });

    describe("failure", () => {
      it("should not create new account for invalid userId", async () => {
        const dal = new AccountDal();

        const accountName = "New Created Account";
        const userId = (await User.max("id")) + 100;

        let result: Account = null;
        try {
          result = await dal.createAccount(userId, accountName);
        } catch (error) {
          expect(error.message).toMatch(/FOREIGN KEY constraint failed/);
        }

        expect(result).toBeNull();
      });
    });
  });

  describe("closeAccount", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const lockTokens: string[] = [];

    beforeAll(async () => {
      // Create User
      const userId = await TestHelpers.createUser({
        userName: "firstCloseAccountDalTest",
      });

      const userId2 = await TestHelpers.createUser({
        userName: "secondCloseAccountDalTest",
      });

      userIds.push(userId);
      userIds.push(userId2);

      const accountId = await TestHelpers.createAccount(userId);
      const accountId2 = await TestHelpers.createAccount(userId2, {
        accountName: "closed",
        balance: 0,
        closedAt: new Date(),
      });

      accountIds.push(accountId);
      accountIds.push(accountId2);

      const lockToken = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: "VALID-LOCK-TOKEN-CLOSE-ACCOUNT" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken2 = await TestHelpers.createLock({
        userId: userId2,
        accountId: accountId2,
        lockToken: "ALREADY-CLOSED-LOCK-TOKEN-CLOSE-ACCOUNT" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      lockTokens.push(lockToken);
      lockTokens.push(lockToken2);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteLocks(lockTokens);
    });

    describe("success -- account is closed", () => {
      it("should close account.", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[0];

        const accountBeforeUpdate = await Account.findOne({ where: { id: accountId } });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.closeAccount(accountId, userId, lockToken);

        expect(result).toMatch(TransactionStatusEnum.Success);

        const account = await Account.findOne({ where: { id: accountId } });

        expect(accountBeforeUpdate?.getDataValue("closedAt")).toBeNull();
        expect(account?.getDataValue("closedAt")).not.toBeNull();
      });
    });

    describe("failure", () => {
      it("account is already closed.", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[1];
        const userId = userIds[1];
        const lockToken = lockTokens[1];

        const accountBeforeUpdate = await Account.findOne({ where: { id: accountId } });
        expect(accountBeforeUpdate?.getDataValue("closedAt")).not.toBeNull();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.closeAccount(accountId, userId, lockToken);

        expect(result).toMatch(TransactionStatusEnum.AccountIsClosed);
      });
    });
  });

  describe("adjustAccountBalance", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const lockTokens: string[] = [];

    beforeAll(async () => {
      // Create User
      const userId = await TestHelpers.createUser({
        userName: "adjustBalanceTest",
      });

      userIds.push(userId);

      const accountId = await TestHelpers.createAccount(userId, {
        accountName: "Account 1 -- Adjust Balance",
        balance: 2000,
      });
      const accountId2 = await TestHelpers.createAccount(userId, {
        accountName: "Account 2 -- Adjust Balance",
        balance: 2000,
      });
      const accountId3 = await TestHelpers.createAccount(userId, {
        accountName: "Account 3 -- Closed Account",
        closedAt: moment().toDate(),
      });
      const accountId4 = await TestHelpers.createAccount(userId, {
        accountName: "Account 4 -- Expired Lock Token",
      });

      accountIds.push(accountId);
      accountIds.push(accountId2);
      accountIds.push(accountId3);
      accountIds.push(accountId4);

      const lockToken = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: "ADJUST-BALANCE-TOKEN-1" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken2 = await TestHelpers.createLock({
        userId,
        accountId: accountId2,
        lockToken: "ADJUST-BALANCE-TOKEN-2" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken3 = await TestHelpers.createLock({
        userId,
        accountId: accountId3,
        lockToken: "ADJUST-BALANCE-CLOSED-ACCOUNT-TOKEN" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken4 = await TestHelpers.createLock({
        userId,
        accountId: accountId4,
        lockToken: "ADJUST-BALANCE-EXPIRED-LOCK-TOKEN" + moment().valueOf(),
        expiry: moment().subtract(50, "minutes").toDate(),
      });

      lockTokens.push(lockToken);
      lockTokens.push(lockToken2);
      lockTokens.push(lockToken3);
      lockTokens.push(lockToken4);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteLocks(lockTokens);
    });

    describe("success", () => {
      it("should credit account balance", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[0];

        const amount = 1000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.adjustAccountBalance(
          accountId,
          amount,

          lockToken,
          TransactionTypeEnum.Credit,
          userId
        );

        expect(result).toMatchObject({
          status: TransactionStatusEnum.Success,
          balance: 3000,
        });

        const account = await Account.findOne({ where: { id: accountId } });

        expect(account?.getDataValue("balance")).toBe(3000);
      });

      it("should debit account balance", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[1];
        const userId = userIds[0];
        const lockToken = lockTokens[1];

        const amount = 1000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.adjustAccountBalance(
          accountId,
          amount,

          lockToken,
          TransactionTypeEnum.Debit,
          userId
        );

        expect(result).toMatchObject({
          status: TransactionStatusEnum.Success,
          balance: 1000,
        });

        const account = await Account.findOne({ where: { id: accountId } });

        expect(account?.getDataValue("balance")).toBe(1000);
      });
    });

    describe("failure", () => {
      it("insufficient", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[0];
        const amount = 10000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.adjustAccountBalance(
          accountId,
          amount,
          lockToken,
          TransactionTypeEnum.Debit,
          userId
        );

        const accountBeforeCall = await Account.findOne({ where: { id: accountId } });
        const previousBalance = accountBeforeCall.getDataValue("balance");

        expect(result).toMatchObject({
          status: TransactionStatusEnum.InsufficientFunds,
          balance: previousBalance,
        });
      });

      it("account is already closed.", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[2];
        const userId = userIds[0];
        const lockToken = lockTokens[2];

        const amount = 1000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.adjustAccountBalance(
          accountId,
          amount,

          lockToken,
          TransactionTypeEnum.Debit,
          userId
        );

        expect(result).toMatchObject({
          status: TransactionStatusEnum.AccountIsClosed,
          balance: null,
        });
      });

      it("lock token has expired.", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[3];
        const userId = userIds[0];
        const lockToken = lockTokens[3];

        const amount = 1000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.adjustAccountBalance(
          accountId,
          amount,

          lockToken,
          TransactionTypeEnum.Debit,
          userId
        );

        expect(result).toMatchObject({
          status: LockTokenStatusEnum.LockTokenExpired,
          balance: null,
        });
      });
    });
  });

  describe("getAccountAndTransactions", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const transactionIds: number[] = [];

    beforeAll(async () => {
      const userId = await TestHelpers.createUser({
        userName: "getAccountTest",
      });

      userIds.push(userId);

      const accountId = await TestHelpers.createAccount(userId, {
        accountName: "Account 1 -- Get Me",
        balance: 2000,
      });

      accountIds.push(accountId);

      const idempotencyKey1 = "FIRST-KEY" + moment().valueOf();
      const idempotencyKey2 = "SECOND-KEY" + moment().valueOf();

      const transactionId = await TestHelpers.createTransaction(
        userId,
        accountId,
        TransactionTypeEnum.Credit,
        1000,
        idempotencyKey1
      );
      const transactionId2 = await TestHelpers.createTransaction(
        userId,
        accountId,
        TransactionTypeEnum.Debit,
        1000,
        idempotencyKey2
      );

      transactionIds.push(transactionId);
      transactionIds.push(transactionId2);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteTransactions(transactionIds);
    });

    describe("success", () => {
      it("should retrieve account info for account", async () => {
        const dal = new AccountDal();

        const accountId = accountIds[0];
        const userId = userIds[0];

        const result = await dal.getAccountAndTransactions(accountId, userId);

        const accountTransactions = result.getDataValue("Transactions");
        const accountName = result.getDataValue("accountName");

        expect(accountTransactions.length).toBe(2);
        expect(accountName).toBe("Account 1 -- Get Me");
        expect(accountTransactions[0].hasOwnProperty("idempotencyKey")).toBeFalsy();
      });
    });
  });

  describe("listAccountsByUserId", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];

    beforeAll(async () => {
      const userId = await TestHelpers.createUser({
        userName: "createAccountDalTest",
      });

      const userId2 = await TestHelpers.createUser({
        userName: "createAccountDalTest",
      });

      userIds.push(userId);
      userIds.push(userId2);

      const accountId = await TestHelpers.createAccount(userId);
      const accountId2 = await TestHelpers.createAccount(userId);

      accountIds.push(accountId);
      accountIds.push(accountId2);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
    });

    describe("success", () => {
      it("should retrieve array of 2 accounts for userId", async () => {
        const dal = new AccountDal();

        const userId = userIds[0];

        const result = await dal.listAccountsByUserId(userId);

        expect(result.length).toBe(2);
      });

      it("should retrieve empty array for user with no accounts", async () => {
        const dal = new AccountDal();

        const userId = userIds[1];

        const result = await dal.listAccountsByUserId(userId);

        expect(result.length).toBe(0);
      });
    });
  });
});
