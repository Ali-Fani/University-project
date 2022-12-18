const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const UserResourceOptions = require('./resources/User.resource');
const { User } = require('../models');

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) return null;
  const matched = await user.isPasswordMatch(password);
  if (matched && user.role == 'admin') return Promise.resolve(user);
  return null;
};
const oneDay = 1000 * 60 * 60 * 24;

const adminOptions = {
  rootPath: '/admin',
  resources: [UserResourceOptions],
};
const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  { authenticate, cookieName: 'adminjs', cookiePassword: 'secret' },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: 'sessionsecret',
    cookie: {
      maxAge: oneDay,
    },
    name: 'adminjs',
  }
);

module.exports = {
  admin,
  adminRouter,
};
