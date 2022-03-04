/* istanbul ignore file */
/* eslint-disable brace-style */
import Sequelize from "sequelize";

import { AccountAttributes, AccountInput } from "./interface/Account";
import { sequelize } from "./model";

// import sequelizeConnection from "../config/DB.config";
export class Account
  extends Sequelize.Model<AccountAttributes, AccountInput>
  implements AccountAttributes
{
  public id!: number;
  public accountName!: string;
  public userId!: number;
  public closedAt!: Date;
  public balance!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    accountName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    closedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
  },
  {
    sequelize,
    modelName: "Account",
    timestamps: true,
  }
);
