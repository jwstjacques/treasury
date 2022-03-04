/* istanbul ignore file */
/* eslint-disable brace-style */
import Sequelize from "sequelize";

import { TransactionTypeEnum } from "../enum/TransactionTypeEnum";
import { TransactionAttributes, TransactionInput } from "./interface/Transaction";
import { sequelize } from "./model";

export class Transaction
  extends Sequelize.Model<TransactionAttributes, TransactionInput>
  implements TransactionAttributes
{
  public id!: number;
  public userId!: number;
  public accountId!: number;
  public transactionType!: TransactionTypeEnum;
  public amount!: number;
  public idempotencyKey!: string;
}

Transaction.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    accountId: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    transactionType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    idempotencyKey: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        name: "idempotencyKey_index",
        unique: true,
        fields: ["idempotencyKey"],
      },
    ],
    sequelize,
    timestamps: true,
    modelName: "Transaction",
  }
);
