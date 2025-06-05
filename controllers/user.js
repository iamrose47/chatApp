const User = require('../models/user')
const bcrypt = require('bcrypt')
const {Op} = require('sequelize')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY;
const saltRounds = 10;

function isNotValid(str){
    if(str==undefined || str.length==0){
        return true;
    }
    else{
        return false;
    }
}


exports.signUp = async(req,res,next)=>{
    const{name,email,mobilenumber,password} = req.body;
    if(isNotValid(name) || isNotValid(email) || isNotValid(mobilenumber) || isNotValid(password)){
        return res.send(400).send({
            type:'error',
            message:'Invalid Form Data'
        
        });
    }


    try{
        const users = await User.findAll({
            where:{
                [Op.or]:[{email:email},{mobilenumber:mobilenumber}]
            }
        })


        if(users.length==1){
            throw{
                type:'error',
                message:'User already Exists, Please Login'
            }
        }

        else{
            const hash = await bcrypt.hash(password,saltRounds)
            await User.create({
                name,
                email,
                mobilenumber,
                password:hash
            })

            res.status(200).send({
                type:'success',
                message:'User Created Successfully'
            })
        }
    }

    catch(error){
        console.log(error);
        if(error.type=='error'){
             res.status(404).send(error);
            }

        else{
                res.status(500).send(error); 
            }
    }

}



exports.login = async(req,res,next)=>{
    const {email,password} = req.body;


    if(isNotValid(email) || isNotValid(password)){
        res.status(400).send({
            type:'error',
            message:'Invalid Form Data'
        })
    }

    try{
        const users = await User.findAll({where:{email}})
        if(users.length==0){
            throw{
                type:'error',
                message:'User not found'
            }
        }

        else{
            const user = users[0];
            bcrypt.compare(password,user.password,(err,result)=>{
                if(err){
                    res.status(500).send({
                        type:'error',
                        message:'Something went wrong'
                    })
                }

                if(result==true){
                    const token = jwt.sign({userId:user.id,userEmail:user.email},JWT_SECRET_KEY)
                    console.log(token)
                    res.status(200).send({
                        type:'success',
                        message:'LoggedIn Sucessfully',
                        sessionToken:token
                    })
                }
                else{
                    res.status(404).send({
                        type:'error',
                        message:'Password is incorrect'});

                }
            })
        }


        
    }
    catch(e){
      console.log(error);
      if(error.type=='error'){
      res.status(404).send(error);
      }
      else{
      res.status(500).send(error);
        }

    }

}