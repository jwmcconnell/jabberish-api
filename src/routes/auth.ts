import { NextFunction, Router, Request, Response } from 'express';
import { ResponseError } from '../interfaces/response-error';
import User from '../models/User';
import { VerifyRequest } from '../interfaces/verify-request';
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/signup', (req: Request, res: Response, next: NextFunction) => {
    const { username, password, profileImage } = req.body;

    User.create({ username, password, profileImage })
      .then((user) => {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.send(user);
      })
      .catch(next);
  })
  .post('/signin', (req, res, next) => {
    const { username, password } = req.body;
    User.findOne({ username }).then((user) => {
      if (!user) {
        const err: ResponseError = new Error('Invalid username/password');
        err.status = 401;
        return next(err);
      }

      if (user.compare(password)) {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.send(user);
      } else {
        const err: ResponseError = new Error('Invalid username/password');
        err.status = 401;
        return next(err);
      }
    });
  })
  .get('/verify', ensureAuth, (req: Request, res: Response) => {
    // we need middleware to ensure auth!
    const { user } = req.body;
    res.send(user);
  });
