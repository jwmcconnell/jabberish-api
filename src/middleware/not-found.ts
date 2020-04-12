import { ResponseError } from '../interfaces/response-error';
import { NextFunction } from 'express';

module.exports = (req: Request, res: Response, next: NextFunction) => {
  const err: ResponseError = new Error('Not Found');
  err.status = 404;
  next(err);
};
