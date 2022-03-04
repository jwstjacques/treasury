import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import AccountController from "../../../src/controller/AccountController";
import AccountDal from "../../../src/dal/AccountDal";
import LockDal from "../../../src/dal/LockDal";
import TransactionDal from "../../../src/dal/TransactionDal";
import { LockTokenStatusEnum } from "../../../src/enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../../../src/enum/TransactionStatusEnum";
import { TransactionTypeEnum } from "../../../src/enum/TransactionTypeEnum";

/* eslint-disable @typescript-eslint/no-unused-vars */
let res: any;

describe("AccountController", () => {
  beforeEach(() => {
    res = new Response();
  });

  afterEach(() => {
    res.resetMocked();
  });

  describe("createAccount", () => {
    describe("success", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should create new account", async () => {
        const req: any = new Request("/account", {
          method: "POST",
          headers: {
            userid: 1,
          },
        });
        req.body = { accountName: "New account" };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.createAccount = async (userId, accountName) => {
          return {
            accountName: "New Account",
          };
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.createAccount(req, res);

        expect(res.statusCode).toBe(201);
        expect(res.body.accountName).toBe("New Account");
      });
    });

    describe("failure", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should not create account when header property is missing", async () => {
        const req: any = new Request("/account", {
          method: "POST",
          headers: {
            userid: 1,
          },
        });

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.createAccount(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Account must have a name.");
      });

      it("should not create account when required property is missing", async () => {
        const req: any = new Request("/account", {
          method: "POST",
        });
        req.body = { accountName: "New account" };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.createAccount(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("UserId in header is invalid.");
      });
    });
  });

  describe("getAccountAndTransactions", () => {
    describe("success", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should get account and transactions", async () => {
        const req: any = new Request("/account/1", {
          method: "GET",
          headers: {
            userid: 1,
          },
        });
        req.params = { id: 1 };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.getAccountAndTransactions = async (accountId, userId) => {
          return {
            accountName: "New Account",
            Transactions: [],
          };
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.getAccountAndTransactions(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.accountName).toBe("New Account");
      });
    });

    describe("failure", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should return 404 when account does not exist", async () => {
        const req: any = new Request("/account/1", {
          method: "POST",
          headers: {
            userid: 1,
          },
        });
        req.params = { id: 1234 };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.getAccountAndTransactions = async (accountId, userId) => {
          return null;
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.getAccountAndTransactions(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body).toBe("Account does not exist.");
      });
    });
  });

  describe("closeAccount", () => {
    describe("success", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should close account", async () => {
        const req: any = new Request("/account/1", {
          method: "GET",
          headers: {
            userid: 1,
            locktoken: "123e4567-e89b-12d3-a456-426614174000",
          },
        });
        req.params = { id: 1 };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.closeAccount = async (accountId, userId, lockToken) => {
          return TransactionStatusEnum.Success;
        };

        lockDal.validateLockToken = async (accountId, userId, lockToken) => {
          return LockTokenStatusEnum.IsValid;
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.closeAccount(req, res);

        expect(res.statusCode).toBe(200);
      });
    });

    describe("failure", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should return 400 when failure occurs", async () => {
        const req: any = new Request("/account/1", {
          method: "POST",
          headers: {
            userid: 1,
            locktoken: "123e4567-e89b-12d3-a456-426614174000",
          },
        });
        req.params = { id: 1 };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.closeAccount = async (accountId, userId, lockToken) => {
          return LockTokenStatusEnum.LockTokenExpired;
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.closeAccount(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toBe(LockTokenStatusEnum.LockTokenExpired);
      });
    });
  });

  describe("createTransaction", () => {
    describe("success", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should successfully apply transaction and return balance", async () => {
        const req: any = new Request("/account/1", {
          method: "GET",
          headers: {
            userid: 1,
            locktoken: "123e4567-e89b-12d3-a456-426614174000",
            idempotencyKey: "KEY",
          },
        });
        req.params = { id: 1 };
        req.body = {
          amount: 234,
          transactionType: TransactionTypeEnum.Credit,
        };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        dal.adjustAccountBalance = async (accountId, userId, lockToken) => {
          return {
            status: TransactionStatusEnum.Success,
            balance: 1234,
          };
        };

        transactionDal.createTransaction = async (
          accountId,
          amount,
          idempotencykey,
          transactionType,
          useId
        ) => {
          return {};
        };

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.createTransaction(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
          balance: 1234,
        });
      });
    });

    describe("failure", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should return 400 when idempotency key is missing", async () => {
        const req: any = new Request("/account/1", {
          method: "POST",
          headers: {
            userid: 1,
            locktoken: "123e4567-e89b-12d3-a456-426614174000",
          },
        });
        req.params = { id: 1 };
        req.body = {
          amount: 234,
          transactionType: TransactionTypeEnum.Credit,
        };

        const dal = new AccountDal();
        const lockDal = new LockDal();
        const transactionDal = new TransactionDal();

        const controller = new AccountController(dal, lockDal, transactionDal);

        await controller.createTransaction(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Bad Request");
      });
    });
  });
});
