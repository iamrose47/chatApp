const express=require('express');

const passwordControllers=require('../controllers/password');

const router=express.Router();

router.post('/forgotpassword',passwordControllers.postForgotPassword);
router.get('/resetpassword/:uuid',passwordControllers.getResetPassword);
router.post('/new-password',passwordControllers.createNewPassword);

module.exports=router;