/* istanbul ignore file */
import { Optional } from "sequelize";

export interface LockAttributes {
  id: number;
  userId: number;
  accountId: number;
  lockToken: string;
  expiry: number;
  releasedAt: Date;
}

export interface LockInput extends Optional<LockAttributes, "id"> {}
export interface LockOutput extends Required<LockAttributes> {}
