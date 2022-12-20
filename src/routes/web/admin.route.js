const express = require('express');
const userController = require('../../controllers/user.controller');
const router = express.Router();

// router.get('/',(req,res)=>{
//   res.render('admin/home',{title:'Home'})
// })
// router.get('/user', userController.getUsersWeb);
// router.get('/user/:id/verify', userController.verifyUserWeb);

// router.get('/user/:id/edit',userController.viewUserWeb);
// router.post('/user/:id/edit',userController.updateUserWeb);

// router.get('/user/create',userController.formUserWeb);
// router.post('/user/create',userController.createUserWeb);

// router.get('/user/delete/:id',userController.deleteUserWeb);

// router.delete('/user/:id', userController.deleteUserWeb)

module.exports=router;
