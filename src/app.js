const express = require('express');
const cors = require('cors');

const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('./config/morgan');
const config = require('./config/config');
const { errorConverter, errorHandler } = require('./middlewares/error');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const ApiError = require('./utils/ApiError');
const httpStatus = require('http-status');
const { admin, adminjsRouter } = require('./admin/index');
// const exphbs = require('express-handlebars');
const path = require('path');
app.use(admin.options.rootPath, adminjsRouter);
const adminRouter= require('./routes/web/admin.route');

app.use(express.static(path.join(__dirname, 'public')))
// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
// app.use(morgan('combined'));


// app.use(admin.options.rootPath, adminjsRouter);
app.use(errorConverter);
app.use(errorHandler);
// const hbs = exphbs.create({
//   helpers:{
//     is(value,text,options){
//       if(value==text){
//         return options.fn(this)
//       }},
//   },
//   extname: '.hbs',
// })

// Template engine
// app.engine('hbs', hbs.engine);
// app.set('view engine', 'hbs');
// console.log(path.join(__dirname, 'views'));
// app.set('views',[path.join(__dirname, 'views'), path.join(__dirname, 'views/admin')]);

// app.use('/admin',adminRouter)
app.use(cookieParser())


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
