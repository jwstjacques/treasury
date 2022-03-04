import moment from "moment";

import UserDal from "../../../src/dal/UserDal";
import TestHelpers from "../../TestHelper";

describe("UserDal", () => {
  const userIds: number[] = [];

  beforeAll(async () => {
    await TestHelpers.createUser({
      userName: "AlreadyExists",
      email: "already@exists.com",
    });
  });

  afterAll(async () => {
    await TestHelpers.deleteUsers(userIds);
  });

  describe("createUser", () => {
    describe("success", () => {
      it("should create a new user", async () => {
        const dal = new UserDal();

        const userName = "newUser" + moment().valueOf();
        const firstName = "first";
        const lastName = "last";
        const password = "1234";
        const email = moment().valueOf() + "@gmail.com";

        const result = await dal.createUser(userName, firstName, lastName, email, password);

        expect(result.status).toBe("Success");

        const newUser = result.data;
        const userId = newUser.getDataValue("id");
        userIds.push(userId);

        console.log(newUser);

        expect(userId).not.toBeFalsy();
      });
    });

    describe("failure", () => {
      it("should fail if user name already exists", async () => {
        const dal = new UserDal();

        const userName = "AlreadyExists";
        const firstName = "first";
        const lastName = "last";
        const password = "1234";
        const email = moment().valueOf() + "@gmail.com";

        try {
          await dal.createUser(userName, firstName, lastName, email, password);
        } catch (error) {
          expect(error.message).toMatch(/SequelizeUniqueConstraintError: Validation error/);
        }
      });

      it("should fail if user name already exists", async () => {
        const dal = new UserDal();

        const userName = "brandnewname";
        const firstName = "first";
        const lastName = "last";
        const password = "1234";
        const email = "already@exists.com";

        try {
          await dal.createUser(userName, firstName, lastName, email, password);
        } catch (error) {
          expect(error.message).toMatch(/SequelizeUniqueConstraintError: Validation error/);
        }
      });
    });
  });
});
