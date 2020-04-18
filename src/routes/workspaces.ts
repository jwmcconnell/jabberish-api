import { NextFunction, Router, Request, Response } from 'express';
import { ResponseError } from '../interfaces/response-error';
import Workspace from '../models/Workspace';
import UserByWorkspace from '../models/UserByWorkspace';
import Channel from '../models/Channel';
import User from '../models/User';
import Message from '../models/Message';
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/', ensureAuth, async (req, res, next) => {
    const { name, user } = req.body;

    try {
      const workspace = await Workspace.create({ name, owner: user._id });
      const rel = await UserByWorkspace.create({
        user: user,
        workspace: workspace._id,
      });
      await Channel.create({
        name: 'General',
        workspace: rel.workspace,
      });
      res.send(workspace);
    } catch (err) {
      next(err);
    }
  })
  .post('/users', ensureAuth, async (req, res, next) => {
    const { username, user, workspaceId } = req.body;
    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        const err: ResponseError = new Error('Workspace not found');
        err.status = 404;
        return next(err);
      } else if (workspace.owner.toString() !== user._id.toString()) {
        const err: ResponseError = new Error(
          'You are not allowed to add users to this workspace'
        );
        err.status = 403;
        return next(err);
      }

      const foundUser = await User.findOne({ username: username });

      if (!foundUser) {
        const err: ResponseError = new Error('User not found');
        err.status = 404;
        return next(err);
      }

      return UserByWorkspace.create({
        user: foundUser._id,
        workspace: workspaceId,
      })
        .then((rel) => res.send(rel))
        .catch(next);
    } catch (err) {
      next(err);
    }
  })
  .get('/owner', ensureAuth, (req, res, next) => {
    const { user } = req.body;
    Workspace.find({ owner: user._id })
      .then((workspaces) => res.send(workspaces))
      .catch(next);
  })
  .get('/member', ensureAuth, (req, res, next) => {
    const { user } = req.body;
    UserByWorkspace.find({ user: user._id })
      .populate('workspace')
      .then((workspaces) => res.send(workspaces))
      .catch(next);
  })
  .delete('/:id', ensureAuth, async (req, res, next) => {
    const { user } = req.body;
    const workspace = await Workspace.findOneAndDelete({
      owner: user._id,
      _id: req.params.id,
    });
    if (workspace) {
      try {
        await UserByWorkspace.deleteMany({ workspace: workspace._id });
        await Channel.deleteMany({ workspace: workspace._id });
        await Message.deleteMany({ workspace: workspace._id });
      } catch (err) {
        next(err);
      }
    }
    res.send(workspace);
  });
