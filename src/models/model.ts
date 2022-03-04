/* istanbul ignore file */

export const Sequelize = require("sequelize");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
  logging: false,
});

export class User extends Sequelize.Model {}

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

export class Account extends Sequelize.Model {}

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

export class Transaction extends Sequelize.Model {}

Transaction.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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

export class Lock extends Sequelize.Model {}

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

User.hasMany(Account, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Transaction, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Lock, { foreignKey: "userId", targetKey: "id" });

Account.hasMany(Transaction, { foreignKey: "accountId", targetKey: "id" });
Account.hasMany(Lock, { foreignKey: "accountId", targetKey: "id" });
