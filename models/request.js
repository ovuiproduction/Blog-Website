const mongoose = require('mongoose');

const requestBlogSchema = new mongoose.Schema({
    blogId:{
        type:String,
        required:true
    },
    blogName:{
        type:String,
        required:true
    },
    dateOfRequest:{
        type:String,
        required:true
    },
    dateOfApprove:{
        type:String,
        default:"-"
    },
    status:{
        type:String,
        default:"pending"
    },
    remark:{
        type:String,
        default:"-"
    }
})

const requestSchema = new mongoose.Schema({
    authorId:{
        type:String,
        unique:true,
        required:true
    },
    requestData:[requestBlogSchema]
});

module.exports = mongoose.model('RequestColl',requestSchema)