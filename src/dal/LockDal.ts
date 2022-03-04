import moment from "moment";
import { uuid } from "uuidv4";

import { LockTokenStatusEnum } from "../enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../enum/TransactionStatusEnum";
import { Account, Lock } from "../models/model";

export default class LockDal {
  /**
   * Validates if locktoken exists, is not expired, owned by user, and for the account.
   *
   * @param {number} accountId
   * @param {number} userId
   * @param {string} lockToken
   * @returns {LockTokenStatusEnum}
   */
  public async validateLockToken(
    accountId: number,
    userId: number,
    lockToken: string
  ): Promise<LockTokenStatusEnum> {
    try {
      const lockTokenInDB = await Lock.findOne({ where: { lockToken } });

      if (!lockTokenInDB) {
        return LockTokenStatusEnum.LockTokenDoesNotExist;
      } else if (
        lockTokenInDB.getDataValue("accountId") !== accountId ||
        lockTokenInDB.getDataValue("userId") !== userId
      ) {
        return LockTokenStatusEnum.Invalid;
      } else if (lockTokenInDB.getDataValue("releasedAt")) {
        return LockTokenStatusEnum.LockReleased;
      }

      const expiry = lockTokenInDB.getDataValue("expiry");

      if (moment(expiry).isBefore(moment())) {
        return LockTokenStatusEnum.LockTokenExpired;
      }

      return LockTokenStatusEnum.IsValid;
    } catch (error) /* istanbul ignore next */ {
      throw new Error("Failed to validate lock token. Error: " + error);
    }
  }

  /**
   * Creates a lock token for an account.
   *
   * @param {string} accountId
   * @param {string} userId
   *
   * @returns {string} Valid UUID lock token or error message.
   */
  public async lockAccount(accountId: number, userId: number): Promise<string> {
    try {
      const account = await Account.findOne({
        where: {
          id: accountId,
          userId,
        },
      });

      if (!account) {
        return TransactionStatusEnum.AccountDoesNotExist;
      }

      if (account.getDataValue("closedAt")) {
        return TransactionStatusEnum.AccountIsClosed;
      }

      const lockToken = uuid();

      const lockTokenResult = await Lock.create({
        accountId,
        userId,
        lockToken: lockToken,
        expiry: moment().add(5, "minutes").toDate(),
      });

      /* istanbul ignore next -- hard to recreate */
      if (!lockTokenResult) {
        return TransactionStatusEnum.Failed;
      }

      return lockToken;
    } catch (error) /* istanbul ignore next */ {
      throw new Error("Failed to create lock token. Error: " + error);
    }
  }

  /**
   * Unlocks token.
   *
   * @param {string} accountId
   * @param {string} userId
   *
   * @returns {string} Valid UUID lock token or error message.
   */
  public async unlockAccount(
    accountId: number,
    userId: number,
    lockToken: string
  ): Promise<string> {
    try {
      const account = await Account.findOne({
        where: {
          id: accountId,
          userId,
        },
      });

      if (!account) {
        return TransactionStatusEnum.AccountDoesNotExist;
      }

      const lock = await Lock.findOne({ where: { lockToken } });

      if (!lock) {
        return LockTokenStatusEnum.LockTokenDoesNotExist;
      }

      /* istanbul ignore next */
      if (lock.getDataValue("userId") !== userId || lock.getDataValue("accountId") !== accountId) {
        return LockTokenStatusEnum.Invalid;
      }

      if (lock.getDataValue("releasedAt")) {
        return LockTokenStatusEnum.Success;
      }

      const lockTokenResult = await Lock.update(
        { releasedAt: moment().toDate() },
        { where: { lockToken } }
      );

      /* istanbul ignore next -- hard to reproduce */
      if (!lockTokenResult[0]) {
        return TransactionStatusEnum.Failed;
      }
      return LockTokenStatusEnum.Success;
    } catch (error) /* istanbul ignore next */ {
      throw new Error("Failed to unlock. Error: " + error);
    }
  }
}
