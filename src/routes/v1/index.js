const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const config = require('../../config/config');
const fileRoute = require('./file.route');

const router = express.Router();

const defaultRoutes =[
    {
        path:'/auth',
        route: authRoute
    },
    {
        path:'/users',
        route: userRoute
    },
    {
        path:'/files',
        route: fileRoute
    }
]

defaultRoutes.forEach((route)=>{
    router.use(route.path, route.route);
})


module.exports = router;
