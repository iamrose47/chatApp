const Message = require('../models/msg')
const {Op} = require('sequelize')
const Group=require('../models/group');


exports.postMsg= async(req,res,next)=>{
    const groupId=req.params.groupId;
    try {
       const group=await Group.findByPk(groupId);
       if(!group){
        return res.status(404).send({type:'error',message:"Group was deleted please refresh page"})
      }
     const message=await group.createMessage({
        message:req.body.msg,
        sender:req.user.name,
       });

       res.status(200).send(message);
    } catch (error) {
        console.log(error);
      res.status(500).send(error);
    }
  
}


exports.getMsg=async(req,res,next)=>{
    const lastMsg=+req.query.lastMsg;
    const groupId=+req.query.groupId;
    console.log(groupId);
    try {
        const msgs= await Message.findAll({
            where:{
                id:{
                    [Op.gt]:lastMsg
                },
                groupId:groupId
            },
        });
        res.status(200).send({msgs:msgs,user:req.user.name});
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
 

}