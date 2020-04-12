import mongoose = require('mongoose');
import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../interfaces/response-error';

// eslint-disable-next-line no-unused-vars
module.exports = (
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = err.status || 500;

  if (
    err instanceof mongoose.Error.ValidationError ||
    err instanceof mongoose.Error.CastError
  ) {
    status = 400;
  }
  res.status(status);

  if (process.env.NODE_ENV !== 'test') {
    console.log(err);
  }

  res.send({
    status,
    message: err.message,
  });
};
