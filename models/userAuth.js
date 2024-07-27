const mongoose = require('mongoose');

const userAuthSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('UserAuth',userAuthSchema)