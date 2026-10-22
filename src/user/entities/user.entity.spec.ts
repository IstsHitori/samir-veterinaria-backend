import mongoose from 'mongoose';
import { UserSchema } from './user.entity';

const userModel =
  mongoose.models.LegacyUserSerialization ??
  mongoose.model('LegacyUserSerialization', UserSchema);

describe('User schema serialization', () => {
  it('preserves legacy verification data in storage but omits it from API JSON', () => {
    const user = userModel.hydrate({
      firstName: 'Ana',
      emailValidated: true,
    }) as {
      toObject: () => Record<string, unknown>;
      toJSON: () => Record<string, unknown>;
    };

    expect(user.toObject().emailValidated).toBe(true);
    expect(user.toJSON()).not.toHaveProperty('emailValidated');
  });
});
