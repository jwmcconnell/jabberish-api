import mongoose, { Document, Schema } from 'mongoose';

export interface IUserByWorkspace extends Document {
  user: mongoose.Schema.Types.ObjectId;
  workspace: mongoose.Schema.Types.ObjectId;
}
const UserByWorkspaceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model<IUserByWorkspace>(
  'UserByWorkspace',
  UserByWorkspaceSchema
);
