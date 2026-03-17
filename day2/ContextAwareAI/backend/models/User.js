const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema defines the structure of our user documents in MongoDB.
 * We store email and a hashed password for security.
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Before saving a user, we hash the password if it's new or modified.
 * This ensures we never store plain-text passwords in our database.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  
  // Higher value means more secure but slower hashing
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Helper method to compare entered password with hashed password in database.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
