const express=require('express');

const groupController=require('../controllers/group');
const middlewareController=require('../middlewares/auth');

const router=express.Router();

router.post('/create',middlewareController.authenticate,groupController.postGroup);
router.post('/add-user/:groupId',middlewareController.authenticate,groupController.addUser);
router.get('/get/:groupId',middlewareController.authenticate,groupController.getGroup);
router.get('/get',middlewareController.authenticate,groupController.getAllGroup);
router.delete('/delete/:groupId',middlewareController.authenticate,groupController.deleteGroup);


module.exports=router;