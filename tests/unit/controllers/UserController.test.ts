import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import UserController from "../../../src/controller/UserController";
import UserDal from "../../../src/dal/UserDal";

let res: any;

describe("UserController", () => {
  describe("createUser", () => {
    describe("success", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("should create a new account", async () => {
        const req: any = new Request("/user/create", {
          method: "POST",
        });
        req.body = {
          userName: "notbatman",
          firstName: "Bruce",
          lastName: "Wayne",
          email: "bat@man.com",
          password: "ironmansux",
        };

        const dal = new UserDal();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.createUser = async (userName, firstName, lastName, password, email) => {
          return {
            status: "Success",
            data: {
              id: 1,
              userName: "notbatman",
              firstName: "Bruce",
              lastName: "Wayne",
              password: "ironmansux",
            },
          };
        };

        const controller = new UserController(dal);

        await controller.createUser(req, res);

        expect(res.statusCode).toBe(201);
        expect(res.body).not.toBeFalsy();
        expect(res.body.userName).toBe("notbatman");
      });
    });

    describe("failure", () => {
      beforeEach(() => {
        res = new Response();
      });

      afterEach(() => {
        res.resetMocked();
      });

      it("body is missing required field (email)", async () => {
        const req: any = new Request("/user/create", {
          method: "POST",
        });
        req.body = {
          userName: "notbatman",
          firstName: "Bruce",
          lastName: "Wayne",
          password: "ironmansux",
        };

        let isDalCalled = false;
        const dal = new UserDal();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.createUser = async (userName, firstName, lastName, password, email) => {
          isDalCalled = true;
          return {
            status: "Success",
            data: {
              id: 1,
              userName: "notbatman",
              firstName: "Bruce",
              lastName: "Wayne",
              password: "ironmansux",
            },
          };
        };

        const controller = new UserController(dal);

        await controller.createUser(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Body is missing required field.");
        expect(isDalCalled).toBeFalsy();
      });
    });
  });
});
