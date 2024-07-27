const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    content:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"Private"
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
});

const userArticleSchema = new mongoose.Schema({
    authorId:{
        type: String,
        unique: true,
        required: true
    },
    article:[articleSchema]
})

module.exports = mongoose.model('userArticles',userArticleSchema);