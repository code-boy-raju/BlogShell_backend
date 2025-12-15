const passport=require("passport")
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const {userModel}=require("../models/authModel")
require("dotenv").config()
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await userModel.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "author",            
            status: "active",
            provider: "google",
            permissions: {
              canViewPosts: true,
              canCreatePosts: true,
              canEditPosts: true,
              canDeletePosts: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Required for persistent login sessions (optional)
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});