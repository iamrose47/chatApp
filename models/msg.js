const Sequelize = require('sequelize')
const sequelize = require('../utils/database')
const Message = sequelize.define('messages',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
    },
    message:{
        type:Sequelize.TEXT,
        allowNull:true,
    },
    sender:{
        type:Sequelize.STRING,
        allowNull:false,
    }

})

module.exports = Message;