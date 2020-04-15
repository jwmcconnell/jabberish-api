import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  workspace: mongoose.Schema.Types.ObjectId;
}

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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

export default mongoose.model<IChannel>('Channel', channelSchema);
