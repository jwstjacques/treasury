/* istanbul ignore file */
/* eslint-disable brace-style */
import Sequelize from "sequelize";

import { LockAttributes, LockInput } from "./interface/Lock";
import { sequelize } from "./model";

export class Lock extends Sequelize.Model<LockAttributes, LockInput> implements LockAttributes {
  public id!: number;
  public accountId!: number;
  public userId!: number;
  public lockToken!: string;
  public expiry!: number;
  public releasedAt!: Date;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lock.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lockToken: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    expiry: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    accountId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    releasedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        name: "lockToken_index",
        unique: true,
        fields: ["lockToken"],
      },
    ],
    sequelize,
    modelName: "Lock",
    timestamps: true,
  }
);
