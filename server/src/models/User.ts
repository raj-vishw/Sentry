import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const solvedChallengeSchema = new Schema(
  {
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    points: { type: Number, required: true },
    solvedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 24 },
    usernameLower: { type: String, required: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'USER' },
    avatar: { type: String, default: null },
    bio: { type: String, default: '', maxlength: 280 },
    points: { type: Number, default: 0 },
    solvedChallenges: { type: [solvedChallengeSchema], default: [] },
    unlockedHints: { type: [Schema.Types.ObjectId], ref: 'Hint', default: [] },
    lastLoginAt: { type: Date, default: null },
    // Bumped on every refresh-token rotation and on logout, which
    // immediately invalidates every refresh token issued before the bump.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

userSchema.index({ points: -1 });

userSchema.pre('validate', function () {
  if (this.username) {
    this.usernameLower = this.username.toLowerCase();
  }
});

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model('User', userSchema);
