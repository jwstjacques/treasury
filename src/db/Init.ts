import { Account } from "../models/Account.model";
import { Transaction } from "../models/Transaction.model";
import { User } from "../models/User.model";

const isDev = process.env.NODE_ENV === "development";

const DBInit = () => {
  User.sync({ alter: isDev });
  Transaction.sync({ alter: isDev });
  Account.sync({ alter: isDev });

  // Associations
  Transaction.belongsTo(Account, { foreignKey: "accountId", targetKey: "id" });
  Transaction.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
  Account.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
  Account.hasMany(Transaction);
  User.hasMany(Account);
  User.hasMany(Transaction);
};

export default DBInit;
