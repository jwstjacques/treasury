/* istanbul ignore file */
import { Optional } from "sequelize";

import { TransactionTypeEnum } from "../../enum/TransactionTypeEnum";

export interface TransactionAttributes {
  id: number;
  userId: number;
  accountId: number;
  transactionType: TransactionTypeEnum;
  amount: number;
  idempotencyKey: string;
}

export interface TransactionInput extends Optional<TransactionAttributes, "id"> {}
export interface TransactionOutput extends Required<TransactionAttributes> {}
