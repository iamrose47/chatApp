const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgotPassword');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Sib = require('sib-api-v3-sdk');

const { v4: uuidv4 } = require('uuid');
const sequelize = require('../utils/database');
const path=require('path');
const fs=require('fs');
require('dotenv').config();

function isNotValid(str) {
    if (str == undefined || str.length === 0) return true;
    else return false;
  }

exports.postForgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (isNotValid(email)) {
        return res
          .status(400)
          .send({ type: "error", message: "Invalid Form Data!" });
      }
  try {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SIB_API_KEY;
  

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const uuid = uuidv4();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw { type: "error", message: "User Not Found!" };
    }

    const createuser = await ForgotPasswordRequest.create({
      id: uuid,
      userId: user.id,
    });

    const sender = {
      email: 'rosesinghlalotra@gmail.com',
      name: 'ChatHolic',
    };

    const receivers = [
      {
        email: email,
      },
    ];

    const sendMail = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Reset Your Password',
      // text: "Please click below to reset your password for ExpenseBuzz",
      htmlContent: `<!DOCTYPE html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type" /><style type="text/css">a:hover {text-decoration: underline !important;}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8" leftmargin="0" ><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style=" @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: "Open Sans", sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height: 80px">&nbsp;</td></tr><tr><td style="text-align: center"><h1 style="color: #1e1e2d">ChatHolic</h1></td></tr><tr><td style="height: 20px">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style=" max-width: 670px;background:rgb(223, 240, 254)" border-radius: 3px;text-align: center;-webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);-moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);"><tr><td style="height: 40px">&nbsp;</td></tr><tr><td style="padding: 0 35px"><h1 style=" color: #1e1e2d;font-weight: 500;margin: 0; font-size: 32px;font-family: "Rubik", sans-serif;">You have requested to reset your password</h1><span style="display: inline-block;vertical-align: middle;margin: 29px 0 26px;border-bottom: 1px solid #cecece width: 100px;"></span><p style="color: #455056; font-size: 15px;line-height: 24px;margin: 0;">We cannot simply send you your old password. A unique link to reset your password has been generated for you.To reset your password, click the following link or reset button and follow the instructions. </br> <a href="http://localhost:3000/password/resetpassword/{{params.uuid}}">http://localhost:3000/password/resetpassword/{{params.uuid}}</a>
      </p><a href="http://localhost:3000/password/resetpassword/{{params.uuid}}"style="background: #0dd3e9;text-decoration: none !important;font-weight: 500;margin-top: 35px;color:black;text-transform: uppercase;font-size: 14px;padding: 10px 24px;display: inline-block;border-radius: 50px;">Reset Password</a></td></tr><tr><td style="height: 40px">&nbsp;</td></tr></table></td></tr><tr><td style="height: 80px">&nbsp;</td></tr></table></td></tr></table></body></html>`,
      params: {
        uuid: uuid,
      },
      
    });
   

    await Promise.all([createuser, sendMail]);

    res.status(200).send({ type: 'success', message: 'An email has been sent on your mail id' });
  } catch (error) {
   
    if (error.type === "error") {
      res.status(404).send(error);
    } else {
      console.log(error);
      res.status(500).send(error);
    }
   
  }
};


exports.getResetPassword=async(req,res,next)=>{
    const uuid=req.params.uuid;


    try {
      const request= await ForgotPasswordRequest.findAll({where:{id:uuid}});

      if(request.length==0){
        return res.status(404).send("<h1>Link Does Not Exists!</h1>")
        
      }
      else if(request[0].isActive){
         
          // await request[0].update({ isActive:false});
          const resetUrl = `${req.protocol}://${req.get('host')}/password/resetpassword/${uuid}`;
      const fileContent = fs.readFileSync(path.join(__dirname, '../views/password/newpassword.html'), 'utf-8');
      const modifiedContent = fileContent.replace('{{resetUrl}}', resetUrl);

      res.status(200).send(modifiedContent);
      }
      else{
        return res.status(200).send("<h1>Link has been Expired!</h1>");
      }
    } catch (error) {
      if (error.type === "error") {
        res.status(403).send(error);
      } else {
        console.log(error);
        res.status(500).send(error);
      }
    }
  
}

exports.createNewPassword= async(req,res,next)=>{
  let existingUser;
  const {email,newPassword,uuid}=req.body;
   console.log(uuid);
  if(isNotValid(email) || isNotValid(newPassword)){
    return res.status(400).send({type:"error",message:"Invalid Form Data!"});

  }
  try {
   const users=await User.findAll({where:{email:email}})
   if(users.length===0){
    return res.status(404).send({type:"error",message:`${email} Not Found`})
   }
   const user=users[0];
   existingUser=user;
   const hash=await bcrypt.hash(newPassword,saltRounds);
   const forgotPasswordRequest = await ForgotPasswordRequest.findOne({ where : { id : uuid}})
   await forgotPasswordRequest.update({
       isActive : false
   })
   const result= await existingUser.update({password:hash});

 
   res.status(200).send();
   
  } catch (error) {
    if (error.type === "error") {
      res.status(403).send(error);
    } else {
      console.log(error);
      res.status(500).send(error);
    }
  }
}