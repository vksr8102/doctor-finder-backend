/**
 * @description : exports authentication strategy for google using passport.js
 * @params {Object} passport : passport object for authentication
 * @return {callback} : returns callback to be used in middleware
 */
const authService = require('../services/auth');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/user'); 
const dbService = require('../utils/dbServices');
const { USER_TYPES } = require('../constants/authConstant');

const googlePassportStrategy = passport => {
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_CALLBACKURL,
  }, async function (accessToken, refreshToken, profile, done) {
    if (profile){
      console.log(profile);
      let userObj = {
        'ssoAuth': { 'googleId': profile.id },
        'name': profile.displayName && profile.displayName !== undefined && profile.displayName,
        'email': profile.emails !== undefined ? profile.emails[0].value : '',
        'password':'',
        'userType':USER_TYPES.User
      };
      let found = await dbService.findOne(User,{ 'email': userObj.email });
      if (found) {
        const id = found.id;
        await dbService.updateOne(User, { _id :id }, userObj);
      }
      else {
        let result = await dbService.create(User, userObj);
        console.log(result,'google srtaegy')
        if ( result.email) {
          await authService.sendWelcomeRegisterByEmail(result);
        }
      }
      let user = await dbService.findOne(User,{ 'ssoAuth.googleId':profile.id });
      return done(null, user);
    }
    return done(null, null);
  }
  ));

};
module.exports = { googlePassportStrategy };