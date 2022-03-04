/* istanbul ignore file */
import Sequelize from "sequelize";

import { UserAttributes, UserInput } from "./interface/User";
import { sequelize } from "./model";

export class User extends Sequelize.Model<UserAttributes, UserInput> implements UserAttributes {
  public id!: number;
  public userName!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      // This is an example of how to set a hashed value
      // set(value) {
      //   // Storing passwords in plaintext in the database is terrible.
      //   // Hashing the value with an appropriate cryptographic hash function is better.
      //   this.setDataValue("password", hash(value));
      // },
    },
  },
  {
    indexes: [
      {
        name: "userName_index",
        unique: true,
        fields: ["userName"],
      },
      {
        name: "email_index",
        unique: true,
        fields: ["email"],
      },
    ],
    sequelize,
    timestamps: true,
    modelName: "User",
  }
);
