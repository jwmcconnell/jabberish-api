require('dotenv').config();

import request = require('supertest');
import { app } from '../../app';
import { connect } from '../../utils/connect';
import mongoose = require('mongoose');
import { setupTest } from '../helpers/setup-test';
import { IUser } from '../../models/User';

describe('app routes', () => {
  let agent = request.agent(app);
  let agentUser: IUser;
  beforeAll(() => {
    if (process.env.NODE_ENV !== 'ci') setupTest();
    connect();
  });

  beforeEach(async () => {
    mongoose.connection!.dropDatabase();
    return await agent
      .post('/api/v1/auth/signup')
      .send({ username: 'agent', password: 'password' })
      .then((res) => {
        agentUser = res.body;
      });
  });

  afterAll(() => {
    return mongoose.connection!.close();
  });

  it('Creates a workspace', () => {
    return agent
      .post('/api/v1/workspaces')
      .send({ name: 'test' })
      .then((res) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          owner: agentUser._id,
          name: 'test',
        });
      });
  });

  it('Creates a workspace', () => {
    return agent
      .post('/api/v1/workspaces')
      .send({})
      .then((res) => {
        expect(res.body).toEqual({
          message:
            'Workspace validation failed: name: Path `name` is required.',
          status: 400,
        });
      });
  });
});
