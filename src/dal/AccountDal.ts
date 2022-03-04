import { Transaction as SequelizeTransaction } from "sequelize";

import { LockTokenStatusEnum } from "../enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../enum/TransactionStatusEnum";
import { TransactionTypeEnum } from "../enum/TransactionTypeEnum";
import { Account, sequelize, Transaction } from "../models/model";
import LockDal from "./LockDal";

interface AccountAdjustmentResponse {
  status: LockTokenStatusEnum | TransactionStatusEnum;
  balance: number | null;
}

// import sequelizeConnection from "../config/DB.config";
export default class AccountDal {
  /**
   * Creates a new account with a 0 balance for a given user.
   *
   * @param {number} userId
   * @param {string} accountName
   *
   * @returns {Account}
   */
  public async createAccount(userId: number, accountName: string): Promise<Account> {
    try {
      const account = await Account.create({
        accountName,
        userId,
        balance: 0,
      });

      return account;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Marks an account as closed, by setting the closedAt date.
   *
   * @param {number} accountId
   * @param {number} userId
   * @returns {string}
   */
  public async closeAccount(
    accountId: number,
    userId: number,
    lockToken: string
  ): Promise<TransactionStatusEnum | LockTokenStatusEnum> {
    const transaction = await sequelize.transaction();
    const lockDal = new LockDal();

    try {
      const lockTokenValidation = await lockDal.validateLockToken(accountId, userId, lockToken);

      /* istanbul ignore next */
      if (lockTokenValidation !== LockTokenStatusEnum.IsValid) {
        return lockTokenValidation;
      }

      const account = await Account.findOne({
        where: {
          id: accountId,
          userId,
        },
      });

      /* istanbul ignore next -- hard to reproduce/unlikely */
      if (!account) {
        return TransactionStatusEnum.AccountDoesNotExist;
      }

      if (account.getDataValue("closedAt")) {
        return TransactionStatusEnum.AccountIsClosed;
      }

      const result = await Account.update(
        { closedAt: new Date() },
        { where: { id: accountId }, transaction }
      );

      /* istanbul ignore next -- hard to reproduce */
      if (!result[0]) {
        await transaction.rollback();

        return TransactionStatusEnum.Failed;
      }

      await transaction.commit();

      return TransactionStatusEnum.Success;
    } catch (error) /* istanbul ignore next -- hard to reproduce */ {
      await transaction.rollback();
      throw new Error(error);
    }
  }

  /**
   * Debits or credits the account given a valid lock token.
   *
   * @param {number} accountId
   * @param {number} amount
   * @param {string} idempotencyKey
   * @param {string} lockToken
   * @param {number} transactionType
   * @param {number} userId
   * @returns
   */
  public async adjustAccountBalance(
    accountId: number,
    amount: number,
    lockToken: string,
    transactionType: TransactionTypeEnum,
    userId: number
  ): Promise<AccountAdjustmentResponse> {
    const transaction: SequelizeTransaction = await sequelize.transaction();
    const lockDal = new LockDal();

    try {
      const lockTokenValidation = await lockDal.validateLockToken(accountId, userId, lockToken);

      if (lockTokenValidation !== LockTokenStatusEnum.IsValid) {
        return {
          status: lockTokenValidation,
          balance: null,
        };
      }

      const account = await Account.findOne({
        where: {
          id: accountId,
        },
      });

      /* istanbul ignore next -- hard to reproduce/unlikely */
      if (!account) {
        return {
          status: TransactionStatusEnum.AccountDoesNotExist,
          balance: null,
        };
      }

      if (account.getDataValue("closedAt")) {
        return {
          status: TransactionStatusEnum.AccountIsClosed,
          balance: null,
        };
      }

      const currentBalance = account.getDataValue("balance");

      let multiplier = 1;

      if (transactionType === TransactionTypeEnum.Debit) {
        multiplier = -1;

        if (currentBalance < amount) {
          return {
            status: TransactionStatusEnum.InsufficientFunds,
            balance: currentBalance,
          };
        }
      }

      const adjustedBalance = currentBalance + amount * multiplier;

      const result = await Account.update(
        { balance: adjustedBalance },
        { where: { id: accountId }, transaction }
      );

      /* istanbul ignore next -- hard to reproduce */
      if (!result[0]) {
        await transaction.rollback();

        return {
          status: TransactionStatusEnum.Failed,
          balance: null,
        };
      }

      await transaction.commit();

      // Returning is not supported in SQLite
      const updatedAccount = await Account.findOne({
        where: {
          id: accountId,
        },
      });

      return {
        status: TransactionStatusEnum.Success,
        balance: updatedAccount.getDataValue("balance"),
      };
    } catch (error) /* istanbul ignore next -- hard to reproduce */ {
      await transaction.rollback();
      throw new Error(error);
    }
  }

  /**
   * Get a list of acounts for a given userId.
   *
   * @param userId
   * @returns
   */
  public async listAccountsByUserId(userId: number): Promise<any> {
    try {
      const accounts = await Account.findAll({
        where: {
          userId,
        },
      });

      return accounts;
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }

  /**
   * Get account details and transactions for a given accountId, userId pairing.
   *
   * @param accountId
   * @param userId
   * @returns
   */
  public async getAccountAndTransactions(accountId: number, userId: number): Promise<any> {
    try {
      const account = await Account.findOne({
        where: {
          id: accountId,
          userId,
        },
        include: [
          {
            model: Transaction,
            required: true,
            attributes: { exclude: ["accountId", "idempotencyKey", "userId"] },
          },
        ],
      });

      return account;
    } catch (error) /* istanbul ignore next -- hard to reproduce */ {
      throw new Error(error);
    }
  }
}
