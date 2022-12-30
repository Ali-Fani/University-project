const express = require('express');
const cors = require('cors');

const app = express();

const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const hbs = require('express-handlebars');
const morgan = require('./config/morgan');
const config = require('./config/config');
const { errorConverter, errorHandler } = require('./middlewares/error');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const ApiError = require('./utils/ApiError');
const webRoutes = require('./routes/web');

app.engine('hbs', hbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(webRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
app.use(errorConverter);
app.use(errorHandler);
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
// handle error
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use('/v1', routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});
module.exports = app;
