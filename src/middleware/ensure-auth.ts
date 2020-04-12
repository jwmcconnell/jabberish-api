import { ResponseError } from '../interfaces/response-error';
import { VerifyRequest } from '../interfaces/verify-request';
import { NextFunction, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

module.exports = (req: VerifyRequest, res: Response, next: NextFunction) => {
  // console.log({ req });
  const token = req.cookies.session;
  if (!token) {
    const err: ResponseError = new Error('No session cookie');
    err.status = 401;
    return next(err);
  }

  try {
    const userPayload = jwt.verify(token, process.env.APP_SECRET);
    const user = User.findById(userPayload._id).then((user) => {
      if (!user) {
        console.log('No user');
        const err: ResponseError = new Error('Invalid token');
        err.status = 401;
        return next(err);
      }
      req.body.user = user;
      next();
    });
  } catch (err) {
    console.log('catch', err);
    throw new Error('invalid token');
  }
};
