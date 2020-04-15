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
  //   .post('/add-user/:id', ensureAuth, (req, res, next) => {
  //     const { username, user } = req.body;

  //     Workspace.findById(req.params.id)
  //       .then((workspace) => {
  //         if (!workspace) {
  //           const err: ResponseError = new Error('Workspace not found');
  //           err.status = 404;
  //           return next(err);
  //         } else if (workspace.owner.toString() !== user._id.toString()) {
  //           const err: ResponseError = new Error(
  //             'You are not allowed to add users to this workspace'
  //           );
  //           err.status = 403;
  //           return next(err);
  //         }
  //         return User.findOne({ username: username });
  //       })
  //       .then((user) => {
  //         return UserByWorkspace.create({
  //           user: user._id,
  //           workspace: req.params.id,
  //         });
  //       })
  //       .then((rel) => {
  //         res.send(rel);
  //       })
  //       .catch(next);
  //   })
  .get('/owner', ensureAuth, (req, res, next) => {
    const { user } = req.body;
    Workspace.find({ owner: user._id })
      .then((workspaces) => res.send(workspaces))
      .catch(next);
  });
//   .get('/member', ensureAuth, (req, res, next) => {
//     UserByWorkspace.find({ user: req.user._id })
//       .populate('workspace')
//       .then((workspaces) => res.send(workspaces))
//       .catch(next);
//   });
//   .delete('/:id', ensureAuth, (req, res, next) => {
//     Workspace.findOneAndDelete({ owner: req.user._id, _id: req.params.id })
//       .then((workspace) => {
//         return UserByWorkspace.deleteMany({ workspace: workspace._id });
//       })
//       .then(() => {
//         return Channel.deleteMany({ workspace: req.params.id });
//       })
//       .then(() => {
//         return Message.deleteMany({ workspace: req.params.id });
//       })
//       .then((deleted) => res.send(deleted))
//       .catch(next);
//   });
