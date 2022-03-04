import { Request, Response } from "express";

import UserDal from "../dal/UserDal";
import { TransactionStatusEnum } from "../enum/TransactionStatusEnum";

export default class UserController {
  private _dal: UserDal;

  constructor(dal: UserDal) {
    this._dal = dal;
  }

  /**
   * Create a user.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      if (
        !body.hasOwnProperty("userName") ||
        !body.hasOwnProperty("firstName") ||
        !body.hasOwnProperty("lastName") ||
        !body.hasOwnProperty("password") ||
        !body.hasOwnProperty("email")
      ) {
        const message = "Body is missing required field.";
        res.status(400).send(message);

        return;
      }

      const { userName, firstName, lastName, password, email } = body;

      // Check if username and/or email already exists

      const user = await this._dal.createUser(userName, firstName, lastName, email, password);

      /* istanbul ignore next */
      if (user.status !== TransactionStatusEnum.Success) {
        res.status(400).send(user.status);

        return;
      }

      res.status(201).send(user.data);
    } catch (error) /* istanbul ignore next */ {
      res.status(500).send(error);
    }
  }
}
