const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});


const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});


// // Admin panel
// const getUsersWeb = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'role']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   let result = await userService.queryUsers(filter, options);
//   let flatUsers = result.results.map(function(user) {
//     return user.toObject();
//   })
//   result.results=flatUsers;
//   // console.log(result)
//   res.render('admin/Users/list', {users: result,title:'Users'});
// });

// const verifyUserWeb = catchAsync(async (req, res) => {
//   await userService.verifyUserById(req.params.id);
//   res.redirect('/admin/user');
// });

// const viewUserWeb = catchAsync(async (req, res) => {
//   const user = await userService.getUserById(req.params.id);
//   console.log(user)
//   res.render('admin/Users/edit', {title:'Edit User',user:user.toObject()});
// })

// const updateUserWeb = catchAsync(async (req, res) => {
//   if(req.body.password == ''){
//     delete req.body.password;
//   }
//   console.log(req)
//   try{
//     const user = await userService.updateUserById(req.params.id, req.body);
//     res.redirect('/admin/user');

//   }catch(err){
//     // res.render('admin/Users/edit', {title:'Edit User',user:user.toObject(),error:err.message});
//     res.redirect()
//     console.log(err.message)
//     if(err instanceof ApiError){
//       console.log(err.message);
//     }
//   }

// })

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  // getUsersWeb,
  // verifyUserWeb,
  // viewUserWeb,
  // updateUserWeb
};
