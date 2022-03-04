/* istanbul ignore file -- being lazy */
import { TransactionStatusEnum } from "../enum/TransactionStatusEnum";
import { TransactionTypeEnum } from "../enum/TransactionTypeEnum";
import { Transaction } from "../models/model";

export default class TransactionDal {
  /**
   * Creates a new transaction for a given account, user, type and amount.
   *
   * @param {number} accountId
   * @param {number} amount
   * @param {string} idempotencyKey
   * @param {TransactionTypeEnum} transactionType
   * @param {number} userId
   *
   * @returns {Transaction}
   */
  public async createTransaction(
    accountId: number,
    amount: number,
    idempotencyKey: string,
    transactionType: TransactionTypeEnum,
    userId: number
  ): Promise<TransactionStatusEnum | Transaction> {
    try {
      const existingTransaction = await Transaction.findOne({
        where: {
          idempotencyKey,
        },
      });

      if (existingTransaction) {
        return TransactionStatusEnum.AlreadyExists;
      }

      const transaction = await Transaction.create({
        amount,
        accountId,
        idempotencyKey,
        transactionType,
        userId,
      });

      return transaction;
    } catch (error) {
      throw new Error(error);
    }
  }
}
