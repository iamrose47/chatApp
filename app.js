const express = require('express')
const app =express()
const cors = require('cors')
const path = require('path');
const sequelize=require('./utils/database');



app.use(cors());
require('dotenv').config()

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')));

const userRoutes=require('./routes/user');
const msgRoutes=require('./routes/msg');
const groupRoutes=require('./routes/group');
const passwordRoutes=require('./routes/password');


//Model
const User = require("./models/user");
const Message = require("./models/msg");
const Group = require("./models/group");
const GroupUser=require('./models/group-user');
const ForgotPasswordRequest=require('./models/forgotPassword');


//Routes
app.use('/user',userRoutes);
app.use('/msg',msgRoutes);
app.use("/group", groupRoutes);
app.use('/password',passwordRoutes);





app.use('/',(req,res)=>{
    const url = req.url;
    res.header('Content-Security-Policy', "img-src  'self'");
    res.sendFile(path.join(__dirname,`views/${url}.html`))

});


//Associations

Group.hasMany(Message);
Message.belongsTo(Group);
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);
Group.belongsToMany(User, { through: GroupUser });
User.belongsToMany(Group, { through: GroupUser });


sequelize.sync().then((result)=>{
    console.log(result);
    app.listen(PORT)
}).catch((error)=>{
    console.log(error);
})
