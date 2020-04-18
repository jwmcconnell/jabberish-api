import { ResponseError } from '../interfaces/response-error';
import { VerifyRequest } from '../interfaces/verify-request';
import { NextFunction, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const secret: string = process.env.APP_SECRET!;

module.exports = (req: VerifyRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.session;
  if (!token) {
    const err: ResponseError = new Error('No session cookie');
    err.status = 401;
    return next(err);
  }

  try {
    const userPayload: any = jwt.verify(token, secret);
    User.findById(userPayload._id).then((user) => {
      if (!user) {
        const err: ResponseError = new Error('Invalid token');
        err.status = 401;
        return next(err);
      }
      req.body.user = user;
      next();
    });
  } catch (err) {
    throw new Error('invalid token');
  }
};
