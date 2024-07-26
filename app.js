const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const articleRouter = require('./articleRoute/routes');
const Article = require('./models/article');
require('dotenv').config();

const database_url = process.env.DATABASE_URL;
mongoose.connect(database_url);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine','ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));


app.get('/',async (req,res)=>{
    try{
        const articles = await Article.find().sort({createdAt:1}).lean();
        res.render("index",{articles : articles});
    }catch(err){
        console.log(err);
    }
});

app.get('/about',(req,res)=>{
    try{
        res.render("about");
    }catch(err){
        res.redirect('/');
    }
});

app.get('/contact',(req,res)=>{
    try{
        res.render("contact");
    }catch(err){
        res.redirect('/');
    }
});

app.use('/article',articleRouter);

app.listen(port,(req,res)=>{
    console.log(`server live on port ${port}`);
});