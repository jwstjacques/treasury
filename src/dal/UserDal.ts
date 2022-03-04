import { User } from "../models/model";

interface UserDalResponse {
  status: string;
  data: User;
}

export default class UserDal {
  /**
   * Creates a user record.
   *
   * @param {string} userName
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   * @returns
   */
  public async createUser(
    userName: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<UserDalResponse> {
    try {
      const newUser = await User.create({
        userName,
        firstName,
        lastName,
        email,
        password,
      });

      return {
        status: "Success",
        data: newUser,
      };
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }
}
