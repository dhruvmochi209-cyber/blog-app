import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model.js';

/**
 * Configures Passport.js with Google and GitHub OAuth strategies.
 * Both strategies follow the same pattern:
 *  1. Try to find an existing user by their OAuth provider ID.
 *  2. If not found, try to match by email (account linking).
 *  3. If still not found, create a brand-new user.
 *
 * Note: We do NOT use passport sessions — authentication is stateless via JWT.
 * serializeUser / deserializeUser are minimal no-ops required by passport internals.
 */

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

// ─── GitHub Strategy ─────────────────────────────────────────────────────────

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'], // Request email access explicitly
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // GitHub may return multiple emails; pick the primary one
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          null;
        const avatar = profile.photos?.[0]?.value || null;

        // 1. Find by GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (!user && email) {
          // 2. Try account linking via email
          user = await User.findOne({ email });
          if (user) {
            user.githubId = profile.id;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
          }
        }

        if (!user) {
          // 3. Create new user
          user = await User.create({
            name: profile.displayName || profile.username || 'User',
            email,
            githubId: profile.id,
            avatar,
            passwordHash: null,
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
