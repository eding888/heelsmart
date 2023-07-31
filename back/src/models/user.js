import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const UNCEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*unc\.edu[a-zA-Z0-9.-]*$/;

const checkEmail = email => {
  return UNCEmailRegex.test(email);
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minLength: [3, 'Username must be at least 3 characters'],
    unique: [true, 'Username is already taken']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [checkEmail, 'Invalid email. Ensure you are using a valid UNC email.'],
    unique: [true, 'Email is already registered']
  },
  passwordHash: {
    type: String,
    minLength: 3,
    required: true
  }
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  }
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

export default User;
