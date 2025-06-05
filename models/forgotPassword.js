const Sequelize=require('sequelize');
const sequelize=require('../utils/database');

const ForgotPasswordRequest=sequelize.define('forgotpasswordrequests',
{
  id:{
    type:Sequelize.STRING,
    allowNull:false,
    primaryKey:true,


  }
  ,
  isActive:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
  }
}
)

module.exports=ForgotPasswordRequest;