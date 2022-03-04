/* istanbul ignore file */
import { Optional } from "sequelize";

export interface UserAttributes {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserInput extends Optional<UserAttributes, "id"> {}
export interface UserOutput extends Required<UserAttributes> {}
