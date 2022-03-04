import { Request } from "express";

import { User } from "../models/User.model";

export default interface RequestWithProfile extends Request {
  user: User;
}
