import { NextFunction, Response } from "express";

const getProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const { Profile } = req.app.get("models");
  const profile = await Profile.findOne({ where: { id: req.get("profile_id") || 0 } });

  if (!profile) {
    res.status(401).end();
    return;
  }

  req.profile = profile;

  next();
};

export default getProfile;
