const { Account, Lock, Transaction, User } = require('../dist/src/models/model');

/* WARNING THIS WILL DROP THE CURRENT DATABASE */
seed();

async function seed() {
  // create tables
  await User.sync({ force: true });
  await Account.sync({ force: true });
  await Transaction.sync({ force: true });
  await Lock.sync({ force: true });
  //insert data
  await Promise.all([
   User.create({
      id: 1,
      firstName: "Harry",
      lastName: "Potter",
      userName: "wizard",
      password: "youknowwho",
      email: "harry@hogwarts.com"
    }),
    User.create({
      id: 2,
      firstName: "Jeffrey",
      lastName: "Lebowski",
      userName: "thedude",
      password: "bummer",
      email: "dude@abides.com"
    }),
    User.create({
      id: 3,
      firstName: "Darth",
      lastName: "Vader",
      userName: "sith4lyfe",
      password: "podracer",
      email: "iam@yourfather.com"
    }),
    Account.create({
      id: 1,
      accountName: "Weird Al Acting Lessons",
      userId: 1,
      closedAt: null,
      balance: 1000
    }),
    Account.create({
      id: 2,
      accountName: "Bowling",
      userId: 2,
      closedAt: null,
      balance: 0
    }),
    Account.create({
      id: 3,
      accountName: "Higher Ground",
      userId: 3,
      closedAt: new Date(),
      balance: 0
    }),
    Transaction.create({
      id: 1,
      userId: 1,
      accountId: 1,
      transactionType: "credit",
      amount: 1000,
      idempotencyKey: "first"
    }),
    Transaction.create({
      id: 2,
      userId: 2,
      accountId: 2,
      transactionType: "credit",
      amount: 1000,
      idempotencyKey: "second"
    }),
    Transaction.create({
      id: 3,
      userId: 2,
      accountId: 2,
      transactionType: "debit",
      amount: 1000,
      idempotencyKey: "third"
    }),
  ]);
}
