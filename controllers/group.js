const Group=require('../models/group');

const User=require('../models/user');
const GroupUser=require('../models/group-user');

function isNotValid(str){
    if(str.length==0 || str==undefined){
        return true;
    }
    return false;
}

exports.postGroup=async(req,res,next)=>{
const groupName=req.body.group;
if(isNotValid(groupName)){
  return res.status(400).send({type:'error',message:'Invalid form data!'});
}
try {
    const group=await Group.create({name:groupName});
  const result= await req.user.addGroup(group,{through:{admin:true}});
  res.status(200).send({
    type:'success',
    message:`Group ${groupName} is created.`,
    groupId:result[0].groupId,
  })
} catch (error) {
    console.log(err);
      res.status(500).send(err);
}


}

exports.getGroup= async(req,res,next)=>{
    let allUsers, group;
    try {
      const groupId=req.params.groupId;
      group=await  Group.findByPk(groupId);
      if(!group){
        return res.status(404).send({type:'error',message:"Group was deleted please refresh page"})
      }
      else{
        allUsers= await group.getUsers();
        let  msgs= await group.getMessages();
        res.status(200).send({msgs:msgs,users:allUsers,user:req.user.name})
      }
     
    } catch (error) {
      if (error.type === "error") {
        res.status(404).send(error);
      } else {
        console.log(error);
        res.status(500).send(error);
      }
    }
  

}

exports.getAllGroup= async(req,res,next)=>{
    try {
      const groups= await req.user.getGroups();
      // console.log(groups);
      res.status(200).send(groups);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
}

exports.addUser= async(req,res,next)=>{
  const groupId=req.params.groupId;
  const userEmail=req.body.userEmail;
  let userExist;
  try {
  const user=await  User.findOne({where:{email:userEmail}})
  if(!user){
    throw { type: "error", message: "User Not Found!" };
  }
  else{
    userExist=user;
    const group= await Group.findByPk(groupId);
    await group.addUser(userExist);
    const updatedGroups = await userExist.getGroups();
    console.log(updatedGroups);
    res.status(200).send({
      type:'success',
      message:`User ${userExist.name} is added`,
      user:userExist.name,
      
    });
  }
  } catch (error) { 
    if (error.type === "error") {
      res.status(404).send(error);
    } else {
      console.log(error);
      res.status(500).send(error);
    }
  }
}


async function checkAdmin(userId,groupId){
      const userGroup=await GroupUser.findOne({
        where: {
          userId,
          groupId,
          admin: true,
        },
      }) 

      if(userGroup){
        return true;
      }
      else{
        return false;
      }
}
exports.deleteGroup=async (req,res,next)=>{
  const groupId=req.params.groupId;
  const userId=req.user.id;
  // console.log(groupId);
  try {
    const Admin = await checkAdmin(userId, groupId);
    if(!Admin){
      return res.status(403).send({type:'error',message:'You are not Authorized to delete this Group'});
    }
    else{
      const group=await Group.findByPk(groupId);
      const groupName=group.name;
      await group.destroy();
      res.status(200).send({type:'success',message:`${groupName} group deleted successfully`});
    }
  } catch (error) {
    if (error.type === "error") {
      res.status(404).send(error);
    } else {
      console.log(error);
      res.status(500).send(error);
    }
  }


}