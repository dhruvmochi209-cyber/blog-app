import mongoose from 'mongoose';

/**
 * OTP (One-Time Password) Model
 *
 * Stores pending email verifications during the 2-step registration flow.
 * Each document holds the user's pre-validated registration data alongside
 * a hashed OTP so we can create the account instantly on successful verify.
 *
 * TTL Index:
 *   MongoDB automatically deletes documents where `expiresAt` is in the past.
 *   This handles OTP expiry without any cron job.
 *
 * Lifecycle:
 *   POST /register/init  → upsert OTP document
 *   POST /register/verify → verify OTP → create User → delete OTP document
 */

const otpSchema = new mongoose.Schema({
  // One OTP document per email — upserted on each init/resend request
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  // Pre-computed during /init so we don't re-hash on /verify
  name: {
    type: String,
    required: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  // Hashed 6-digit OTP (bcrypt) — never store plain OTPs
  otpHash: {
    type: String,
    required: true,
  },

  // Brute-force protection: increment on each failed attempt
  attempts: {
    type: Number,
    default: 0,
  },

  // Timestamp of when the OTP was last sent — used for resend throttle
  sentAt: {
    type: Date,
    default: Date.now,
  },

  // MongoDB TTL index: document auto-deleted when expiresAt is reached
  expiresAt: {
    type: Date,
    required: true,
    // TTL index — MongoDB checks every 60 seconds and deletes expired docs
    index: { expires: 0 }, // '0' means: delete exactly at expiresAt, not after a duration
  },
});

const OTPRecord = mongoose.model('OTPRecord', otpSchema);

export default OTPRecord;
