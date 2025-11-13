import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    role: {
      type: String,
      enum: ['Teacher', 'Student'],
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, maxlength: 100 },
    lastName: { type: String, required: true, maxlength: 150 },
    email: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, required: true, index: true },
  },
  { versionKey: false, timestamps: false },
);
