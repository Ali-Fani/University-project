const express = require('express');
const cors = require('cors');

const app = express();
const { uploadFiles, getFile } = require('./controllers/file.controller');
const morgan = require('./config/morgan');
const config = require('./config/config');
const { errorConverter, errorHandler } = require('./middlewares/error');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const ApiError = require('./utils/ApiError');
const httpStatus = require('http-status');
const { admin, adminRouter } = require('./admin/index');
// const auth = require('./middlewares/auth');

// const data = (req, res, next) => {
//   if (req.user.role == 'admin') {
//     next();
//   }else{
//     res.redirect(admin.options.loginPath)
//   }
// };
app.use(admin.options.rootPath, adminRouter);

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
// app.use(morgan('combined'));

app.use(errorConverter);
app.use(errorHandler);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// handle error
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// app.post("/upload_files", upload.single("file"), uploadFiles);

// app.get("/upload_files/:id", getFile)

app.use('/v1', routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});
module.exports = app;
