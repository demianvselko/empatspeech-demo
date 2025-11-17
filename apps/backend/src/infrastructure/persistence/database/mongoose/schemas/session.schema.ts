import { Schema } from 'mongoose';

const TrialSchema = new Schema(
  {
    correct: { type: Boolean, required: true },
    tsEpochMs: { type: Number, required: true, min: 0, index: true },
  },
  { _id: false },
);

export const SessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    slpId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    seed: { type: Number, required: true, min: 0, index: true },
    notes: { type: [String], default: [], maxlength: 2000 },
    createdAt: { type: Date, required: true, index: true },
    finishedAt: { type: Date, index: true },
    trials: { type: [TrialSchema], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { versionKey: false, timestamps: false },
);

SessionSchema.index({ studentId: 1, createdAt: -1 });
SessionSchema.index({ slpId: 1, createdAt: -1 });
SessionSchema.index({ slpId: 1, studentId: 1, createdAt: -1 });
