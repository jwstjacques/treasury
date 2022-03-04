import moment from "moment";
import { regex } from "uuidv4";

import LockDal from "../../../src/dal/LockDal";
import { LockTokenStatusEnum } from "../../../src/enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../../../src/enum/TransactionStatusEnum";
import { Account } from "../../../src/models/model";
import TestHelpers from "../../TestHelper";

jest.setTimeout(20000);

const validLockToken = "VALID-LOCK-TOKEN" + moment().valueOf();
const expiredLockToken = "EXPIRED-LOCK-TOKEN" + moment().valueOf();
const unlockedLockToken = "UNLOCKED-LOCK-TOKEN" + moment().valueOf();

describe("LockDal", () => {
  describe("validateLockToken", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const lockTokens: string[] = [];

    beforeAll(async () => {
      // Create User
      const userId = await TestHelpers.createUser({
        userName: "firstLockDal",
      });

      const userId2 = await TestHelpers.createUser({
        userName: "secondLockDal",
      });

      userIds.push(userId);
      userIds.push(userId2);

      const accountId = await TestHelpers.createAccount(userId);
      const accountId2 = await TestHelpers.createAccount(userId, {
        accountName: "empty",
        balance: 0,
      });
      const accountId3 = await TestHelpers.createAccount(userId, {
        accountName: "closed",
        balance: 0,
        closedAt: new Date(),
      });

      accountIds.push(accountId);
      accountIds.push(accountId2);
      accountIds.push(accountId3);

      const lockToken = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: validLockToken,
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken2 = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: expiredLockToken,
        expiry: moment().subtract(50, "minutes").toDate(),
      });

      const lockToken3 = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: unlockedLockToken,
        expiry: moment().add(50, "minutes").toDate(),
        releasedAt: moment().toDate(),
      });

      lockTokens.push(lockToken);
      lockTokens.push(lockToken2);
      lockTokens.push(lockToken3);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteLocks(lockTokens);
    });

    describe("success", () => {
      it("lock token exists and is valid", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[0];

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.IsValid);
      });
    });

    describe("failure", () => {
      it("lock token does not exist", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = "FAKETOKEN";

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.LockTokenDoesNotExist);
      });

      it("lock token does not belong to user", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0];
        const userId = userIds[0] + 100;
        const lockToken = lockTokens[0];

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.Invalid);
      });

      it("lock token does not belong to account", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0] + 100;
        const userId = userIds[0];
        const lockToken = lockTokens[0];

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.Invalid);
      });

      it("lock token expired", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[1];

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.LockTokenExpired);
      });

      it("lock token has been released", async () => {
        const dal = new LockDal();

        const accountId = accountIds[0];
        const userId = userIds[0];
        const lockToken = lockTokens[2];

        const result = await dal.validateLockToken(accountId, userId, lockToken);

        expect(result).toMatch(LockTokenStatusEnum.LockReleased);
      });
    });
  });

  describe("lockAccount", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const lockTokens: string[] = [];

    beforeAll(async () => {
      // Create User
      const userId = await TestHelpers.createUser({
        userName: "lockAccountTest",
      });

      const userId2 = await TestHelpers.createUser({
        userName: "lockAccountTest2",
      });

      const userId3 = await TestHelpers.createUser({
        userName: "lockAccountTest2",
      });

      userIds.push(userId);
      userIds.push(userId2);
      userIds.push(userId3);

      const accountId = await TestHelpers.createAccount(userId, {
        accountName: "first" + moment().valueOf(),
      });
      const accountId2 = await TestHelpers.createAccount(userId2, {
        accountName: "second" + moment().valueOf(),
        closedAt: moment().toDate(),
      });
      const accountId3 = await TestHelpers.createAccount(userId3, {
        accountName: "second" + moment().valueOf(),
      });

      accountIds.push(accountId);
      accountIds.push(accountId2);
      accountIds.push(accountId3);

      const lockToken = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: validLockToken,
        expiry: moment().add(5, "minutes").toDate(),
      });

      lockTokens.push(lockToken);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteLocks(lockTokens);
    });

    describe("Success", () => {
      it("should create lock on account", async () => {
        const dal = new LockDal();

        const userId = userIds[0];
        const accountId = accountIds[0];

        const lock = await dal.lockAccount(accountId, userId);

        expect(regex.v4.test(lock)).toBeTruthy();
      });

      // TODO: Renew lock
      it("should renew lock on account", async () => {});
    });

    describe("Failure", () => {
      it("should return error when account does not exist", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = (await Account.max("id")) + 1;

        const lock = await dal.lockAccount(accountId, userId);

        expect(lock).toBe(TransactionStatusEnum.AccountDoesNotExist);
      });

      it("should return error when account belongs to different user", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = accountIds[2];

        const lock = await dal.lockAccount(accountId, userId);

        expect(lock).toBe(TransactionStatusEnum.AccountDoesNotExist);
      });

      it("should return error when account is closed", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = accountIds[1];

        const lock = await dal.lockAccount(accountId, userId);

        expect(lock).toBe(TransactionStatusEnum.AccountIsClosed);
      });
    });
  });

  describe("unlockAccount", () => {
    const userIds: number[] = [];
    const accountIds: number[] = [];
    const lockTokens: string[] = [];

    beforeAll(async () => {
      // Create User
      const userId = await TestHelpers.createUser({
        userName: "unlockAccountTest",
      });

      const userId2 = await TestHelpers.createUser({
        userName: "unlockAccountTest2",
      });

      const userId3 = await TestHelpers.createUser({
        userName: "unlockAccountTest2",
      });

      userIds.push(userId);
      userIds.push(userId2);
      userIds.push(userId3);

      const accountId = await TestHelpers.createAccount(userId, {
        accountName: "first" + moment().valueOf(),
      });
      const accountId2 = await TestHelpers.createAccount(userId2, {
        accountName: "second" + moment().valueOf(),
        closedAt: moment().toDate(),
      });
      const accountId3 = await TestHelpers.createAccount(userId3, {
        accountName: "third" + moment().valueOf(),
      });

      accountIds.push(accountId);
      accountIds.push(accountId2);
      accountIds.push(accountId3);

      const lockToken = await TestHelpers.createLock({
        userId,
        accountId,
        lockToken: "first" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken2 = await TestHelpers.createLock({
        userId: userId2,
        accountId: accountId2,
        lockToken: "second" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      const lockToken3 = await TestHelpers.createLock({
        userId: userId3,
        accountId: accountId3,
        lockToken: "third" + moment().valueOf(),
        expiry: moment().add(5, "minutes").toDate(),
      });

      lockTokens.push(lockToken);
      lockTokens.push(lockToken2);
      lockTokens.push(lockToken3);
    });

    afterAll(async () => {
      await TestHelpers.deleteAccounts(accountIds);
      await TestHelpers.deleteUsers(userIds);
      await TestHelpers.deleteLocks(lockTokens);
    });

    describe("Success", () => {
      it("should unlock on account", async () => {
        const dal = new LockDal();

        const userId = userIds[2];
        const accountId = accountIds[2];
        const lockToken = lockTokens[2];

        const result = await dal.unlockAccount(accountId, userId, lockToken);

        expect(result).toBe(LockTokenStatusEnum.Success);
      });

      it("should return success on a previously unlocked on account", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = accountIds[1];
        const lockToken = lockTokens[1];

        await dal.unlockAccount(accountId, userId, lockToken);
        const result = await dal.unlockAccount(accountId, userId, lockToken);

        expect(result).toBe(LockTokenStatusEnum.Success);
      });
    });

    describe("Failure", () => {
      it("should return error when account does not exist", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = (await Account.max("id")) + 1;
        const lockToken = lockTokens[1];

        await dal.unlockAccount(accountId, userId, lockToken);
        const result = await dal.unlockAccount(accountId, userId, lockToken);

        expect(result).toBe(TransactionStatusEnum.AccountDoesNotExist);
      });

      it("should return error when lock token does not exist", async () => {
        const dal = new LockDal();

        const userId = userIds[1];
        const accountId = accountIds[1];
        const lockToken = "FAKE-LOCK-TOKEN";

        await dal.unlockAccount(accountId, userId, lockToken);
        const result = await dal.unlockAccount(accountId, userId, lockToken);

        expect(result).toBe(LockTokenStatusEnum.LockTokenDoesNotExist);
      });
    });
  });
});
