import bodyParser from "body-parser";
import express from "express";
import { exit } from "process";

import AccountController from "./controller/AccountController";
import UserController from "./controller/UserController";
import AccountDal from "./dal/AccountDal";
import LockDal from "./dal/LockDal";
import TransactionDal from "./dal/TransactionDal";
import UserDal from "./dal/UserDal";
import { sequelize } from "./models/model";

// import sequelizeConnection from "./config/DB.config";
// import DBInit from "./db/Init";

const app: express.Express = express();

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);
// DBInit();

// Confirm Databasae Connection
try {
  sequelize.authenticate().then(() => {
    console.log("Connection to DB has been established successfully.");
  });
} catch (error) {
  console.error("Unable to connect to the database:", error);
  exit(-1);
}

const accountDal = new AccountDal();
const userDal = new UserDal();
const lockDal = new LockDal();
const transactionDal = new TransactionDal();

const accountController = new AccountController(accountDal, lockDal, transactionDal);
const userController = new UserController(userDal);

// User
app.post("/user/create", userController.createUser.bind(userController));

// Account
app.post("/account", accountController.createAccount.bind(accountController));
app.get("/account/:id", accountController.getAccountAndTransactions.bind(accountController));
app.lock("/account/:id", accountController.lockAccount.bind(accountController));
app.unlock("/account/:id", accountController.unlockAccount.bind(accountController));
app.put("/account/:id/close", accountController.closeAccount.bind(accountController));
app.post("/account/:id", accountController.createTransaction.bind(accountController));

module.exports = app;
