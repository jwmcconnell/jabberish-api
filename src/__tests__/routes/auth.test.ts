require('dotenv').config();

import request = require('supertest');
import { app } from '../../app';
import { connect } from '../../utils/connect';
import mongoose = require('mongoose');
import { setupTest } from '../helpers/setup-test';

describe('app routes', () => {
  beforeAll(() => {
    if (process.env.NODE_ENV !== 'ci') setupTest();
    connect();
  });

  beforeEach(() => {
    return mongoose.connection!.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection!.close();
  });

  it('Creates a user', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({ username: 'jack', password: 'password' })
      .then((res: any) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          username: 'jack',
          profileImage: expect.any(String),
        });
        return request(app)
          .post('/api/v1/auth/signin')
          .send({ username: 'jack', password: 'password' });
      })
      .then((res) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          username: 'jack',
          profileImage: expect.any(String),
        });
        return request(app)
          .post('/api/v1/auth/signin')
          .send({ username: 'jack', password: 'wrong-password' });
      })
      .then((res) => {
        expect(res.body).toEqual({
          status: 401,
          message: 'Invalid username/password',
        });
        return request(app)
          .post('/api/v1/auth/signin')
          .send({ username: 'wrong-username', password: 'password' });
      })
      .then((res) => {
        expect(res.body).toEqual({
          status: 401,
          message: 'Invalid username/password',
        });
      });
  });

  it('Verifies a logged in user', async () => {
    let agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'agent', password: 'password' })
      .then(() => {
        return agent.get('/api/v1/auth/verify');
      })
      .then((res) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          username: 'agent',
          profileImage: expect.any(String),
        });
      });
  });
});
