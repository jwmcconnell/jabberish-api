import { Request } from 'express';

export interface VerifyRequest extends Request {
  cookies: {
    session: string;
  };
}
