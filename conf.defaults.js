module.exports = {

  sessionStoreURL: 'mongodb://localhost:27017/webgo',
  sessionStoreOptions: {
    stringify: false,
    maxAge: 60 * 60 * 1000,
    autoRemoveExpiredSession: true
  },
  cookieSecret: 'dontknow',
  googleOAuth:{
    "clientID":"myId",
    "clientSecret":"mySecret",
    "callbackURL":"http://mywebgoban.com:9000/auth/google/callback"
  }

};
