/* istanbul ignore file */
import { Optional } from "sequelize";

export interface AccountAttributes {
  id: number;
  accountName: string;
  userId: number;
  closedAt: Date;
  balance: number;
}

export interface AccountInput extends Optional<AccountAttributes, "id"> {}
export interface AccountOutput extends Required<AccountAttributes> {}
