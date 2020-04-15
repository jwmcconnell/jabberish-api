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

  it('Creates a workspace', () => {
    let agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'agent', password: 'password' })
      .then(() => {
        return agent.post('/api/v1/workspaces').send({ name: 'test' });
      })
      .then((res) => {
        console.log(console.log(res.body));
        expect(res.body).toEqual({
          _id: expect.any(String),
          owner: expect.any(String),
          name: expect.any(String),
        });
      });
  });
});
