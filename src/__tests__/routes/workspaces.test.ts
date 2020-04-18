require('dotenv').config();

import request = require('supertest');
import { app } from '../../app';
import { connect } from '../../utils/connect';
import mongoose = require('mongoose');
import { setupTest } from '../helpers/setup-test';
import User, { IUser } from '../../models/User';
import Workspace, { IWorkspace } from '../../models/Workspace';

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

  it('Fails to create a workspace a workspace', () => {
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

  it('Returns all workspaces the user is an owner of', () => {
    return agent
      .get('/api/v1/workspaces/owner')
      .then((res) => {
        expect(res.body).toEqual([]);
        return agent.post('/api/v1/workspaces').send({ name: 'test1' });
      })
      .then(() => {
        return agent.get('/api/v1/workspaces/owner');
      })
      .then((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toEqual({
          _id: expect.any(String),
          owner: agentUser._id,
          name: 'test1',
        });
        return agent.post('/api/v1/workspaces').send({ name: 'test2' });
      })
      .then(() => {
        return agent.get('/api/v1/workspaces/owner');
      })
      .then((res) => {
        expect(res.body).toHaveLength(2);
        expect(res.body).toEqual([
          {
            _id: expect.any(String),
            owner: agentUser._id,
            name: 'test1',
          },
          {
            _id: expect.any(String),
            owner: agentUser._id,
            name: 'test2',
          },
        ]);
      });
  });

  it('Adds a user as a member to a workspace', async () => {
    const user = await User.create({ username: 'test', password: 'test' });
    const workspace = await Workspace.create({
      name: 'test-workspace',
      owner: agentUser._id,
    });

    return agent
      .post('/api/v1/workspaces/users')
      .send({ username: user.username, workspaceId: workspace._id })
      .then((res) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          user: user._id.toString(),
          workspace: workspace._id.toString(),
        });
      });
  });

  it('Fails to add a user to a nonexistant workspace', async () => {
    const user = await User.create({ username: 'test', password: 'test' });

    return agent
      .post('/api/v1/workspaces/users')
      .send({ username: user.username, workspaceId: user._id })
      .then((res) => {
        expect(res.body).toEqual({
          message: 'Workspace not found',
          status: 404,
        });
      });
  });

  it('Fails to add a nonexistant user to a workspace', async () => {
    const workspace = await Workspace.create({
      name: 'test-workspace',
      owner: agentUser._id,
    });

    return agent
      .post('/api/v1/workspaces/users')
      .send({ username: 'wrong-name', workspaceId: workspace._id })
      .then((res) => {
        expect(res.body).toEqual({
          message: 'User not found',
          status: 404,
        });
      });
  });

  it('Fails to add a user to a workpsace they arent the owner of', async () => {
    const user1 = await User.create({ username: 'test1', password: 'test' });
    const user2 = await User.create({ username: 'test2', password: 'test' });
    const workspace = await Workspace.create({
      name: 'test-workspace',
      owner: user2._id,
    });

    return agent
      .post('/api/v1/workspaces/users')
      .send({ username: user1.username, workspaceId: workspace._id })
      .then((res) => {
        expect(res.body).toEqual({
          message: 'You are not allowed to add users to this workspace',
          status: 403,
        });
      });
  });
});
