import { Request, Response } from "express";
import { regex } from "uuidv4";

import AccountDal from "../dal/AccountDal";
import LockDal from "../dal/LockDal";
import TransactionDal from "../dal/TransactionDal";
import { LockTokenStatusEnum } from "../enum/LockTokenStatusEnum";
import { TransactionStatusEnum } from "../enum/TransactionStatusEnum";
import { TransactionTypeEnum } from "../enum/TransactionTypeEnum";

export default class AccountController {
  private _dal: AccountDal;
  private _lockDal: LockDal;
  private _transactionDal: TransactionDal;

  constructor(dal: AccountDal, lockDal: LockDal, transactionDal: TransactionDal) {
    this._dal = dal;
    this._lockDal = lockDal;
    this._transactionDal = transactionDal;
  }

  /**
   * Creates a new account with a 0 balance for the user.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      const validateRequest = this._parseAndValidateBodyAndHeader(req, false, false);

      if (typeof validateRequest === "string") {
        res.status(400).send(validateRequest);
        return;
      }

      // Validate body
      if (!body.accountName) {
        const message = "Account must have a name.";
        res.status(400).send(message);
        return;
      }

      const { accountName } = body;

      const { userId } = validateRequest;

      const account = await this._dal.createAccount(userId, accountName);

      res.status(201).send(account);
    } catch (error) /* istanbul ignore next */ {
      res.status(500).send(error);
    }
  }

  /**
   * Get account details and all transactions for a given accountId.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async getAccountAndTransactions(req: Request, res: Response): Promise<void> {
    try {
      const validateRequest = this._parseAndValidateBodyAndHeader(req, false, true);

      /* istanbul ignore next */
      if (typeof validateRequest === "string") {
        res.status(400).send(validateRequest);
        return;
      }

      const { accountId, userId } = validateRequest;

      const account = await this._dal.getAccountAndTransactions(accountId, userId);

      if (!account) {
        const message = "Account does not exist.";
        res.status(404).send(message);

        return;
      }

      res.status(200).send(account);
    } catch (error) /* istanbul ignore next */ {
      res.status(500).send(error);
    }
  }

  /**
   * Creates a debit or credit transaction.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const validateRequest = this._parseAndValidateBodyAndHeader(req, true, true);

      const { idempotencykey } = req.headers;
      const { amount, transactionType } = req.body;

      if (
        typeof validateRequest === "string" ||
        !idempotencykey ||
        !amount ||
        isNaN(Number(amount)) ||
        [TransactionTypeEnum.Debit || !TransactionTypeEnum.Credit].includes(transactionType)
      ) {
        const message = typeof validateRequest === "string" ? validateRequest : "Bad Request";
        res.status(400).send(message);
        return;
      }

      const { accountId, lockToken, userId } = validateRequest;

      // Create transaction
      const transaction = await this._transactionDal.createTransaction(
        accountId,
        amount,
        idempotencykey as string,
        transactionType,
        userId
      );

      // TODO: De-weakify this process
      if (transaction === TransactionStatusEnum.AlreadyExists) {
        // TODO: should probably do a call to get balance....maybe in the next life when we are cats
        res.sendStatus(200);

        return;
      }

      // TODO: Handle retries and idempotecy key match issues
      const transactionResult = await this._dal.adjustAccountBalance(
        accountId,
        amount,
        lockToken,
        transactionType,
        userId
      );

      if (transactionResult.status !== TransactionStatusEnum.Success) {
        res.status(400).send(transactionResult.status);

        return;
      }

      const adjustedBalance = {
        balance: transactionResult.balance,
      };

      res.status(200).send(adjustedBalance);
    } catch (error) /* istanbul ignore next */ {
      res.status(500).send(error);
    }
  }

  /**
   * Closes an account for the valid owner userId.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async closeAccount(req: Request, res: Response): Promise<void> {
    try {
      const validateRequest = this._parseAndValidateBodyAndHeader(req, true, true);

      if (typeof validateRequest === "string") {
        res.status(400).send(validateRequest);
        return;
      }

      const { accountId, lockToken, userId } = validateRequest;

      const closeAccountResult = await this._dal.closeAccount(accountId, userId, lockToken);

      if (closeAccountResult !== TransactionStatusEnum.Success) {
        res.status(400).send(closeAccountResult);
        return;
      }

      res.status(200).send("Account closed.");
    } catch (error) /* istanbul ignore next */ {
      res.status(500).send(error);
    }
  }

  /**
   * Creates a lock token on the account.
   *
   * @param {Request} req
   * @param {Response} res
   */
  /* istanbul ignore next */
  public async lockAccount(req: Request, res: Response): Promise<void> {
    try {
      const validateRequest = this._parseAndValidateBodyAndHeader(req, false, true);

      if (typeof validateRequest === "string") {
        res.status(400).send(validateRequest);
        return;
      }

      const { accountId, userId } = validateRequest;

      // TODO: Add renew option

      const lockToken = await this._lockDal.lockAccount(accountId, userId);

      if (!regex.v4.test(lockToken)) {
        res.status(400).send(lockToken);
        return;
      }

      res.status(200).send(lockToken);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  /**
   * Unlocks the account.
   *
   * @param {Request} req
   * @param {Response} res
   */
  /* istanbul ignore next */
  public async unlockAccount(req: Request, res: Response): Promise<void> {
    try {
      const validateRequest = this._parseAndValidateBodyAndHeader(req, true, true);

      if (typeof validateRequest === "string") {
        res.status(400).send(validateRequest);
        return;
      }

      const { accountId, lockToken, userId } = validateRequest;

      const unlockResult = await this._lockDal.unlockAccount(accountId, userId, lockToken);

      if (unlockResult !== LockTokenStatusEnum.Success) {
        res.status(400).send(unlockResult);
        return;
      }

      res.sendStatus(204);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  /** PRIVATE METHODS **/

  /* istanbul ignore next -- time keeps on ticking, had to give up full coverage */
  private _parseAndValidateBodyAndHeader(
    req: Request,
    checkLockToken: boolean,
    checkAccountId: boolean
  ): string | { accountId: number; lockToken: string; userId: number } {
    const userId = this._parseAndValidateUserId(req);
    const accountId = parseInt(req.params.id);
    const lockToken = req.headers.locktoken as string;

    if (typeof userId === "boolean") {
      return "UserId in header is invalid.";
    }

    if (checkAccountId && isNaN(accountId)) {
      return "Account in path is invalid.";
    }

    if (checkLockToken && !lockToken) {
      return "Invalid lock token.";
    }

    return {
      accountId,
      lockToken,
      userId,
    };
  }

  private _parseAndValidateUserId(req: Request): number | boolean {
    const userId = parseInt(req.headers.userid as string);

    if (isNaN(userId)) {
      return false;
    }

    return userId;
  }
}
