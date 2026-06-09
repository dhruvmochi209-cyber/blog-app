import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';

/**
 * Configures Passport.js with Google OAuth strategy.
 * The strategy follows this pattern:
 *  1. Try to find an existing user by their OAuth provider ID.
 *  2. If not found, try to match by email (account linking).
 *  3. If still not found, create a brand-new user.
 *
 * Note: We do NOT use passport sessions — authentication is stateless via JWT.
 * serializeUser / deserializeUser are minimal no-ops required by passport internals.
 */

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// ─── Google Strategy ────────────────────────────────────────────────────────

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        // 1. Find by Google ID (returning user via Google)
        let user = await User.findOne({ googleId: profile.id });

        if (!user && email) {
          // 2. Try account linking via email (user registered with email first)
          user = await User.findOne({ email });
          if (user) {
            // Link the Google account to the existing user
            user.googleId = profile.id;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
          }
        }

        if (!user) {
          // 3. Create a completely new user
          user = await User.create({
            name: profile.displayName || email?.split('@')[0] || 'User',
            email,
            googleId: profile.id,
            avatar,
            passwordHash: null, // OAuth user — no password
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// ─── Minimal Session Stubs (we use JWT, not sessions) ────────────────────────

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
