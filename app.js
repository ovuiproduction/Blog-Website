const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const authRouter = require('./authRoutes/authRouter');
const articleRouter = require('./articleRoute/routes');
const publishRouter = require('./articleRoute/publishRouter');

const RequestColl = require("./models/request");
const Article = require('./models/article');
const userArticles = require('./models/userArticles');

const database_url = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

const app = express();

app.use(session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

mongoose.connect(database_url, {
    ssl: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.set('view engine','ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.get('/',async (req,res)=>{
    try{
        res.render("index");
    }catch(err){
        console.log(err);
    }
});

app.get('/home',async (req,res)=>{
    try{
        const user = req.session.user;
        const articles = await Article.find().sort({createdAt:1}).lean();
        res.render('home',{articles:articles});
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

app.get('/my-account',async(req,res)=>{
    try{
        const user = req.session.user;
        let articles = await userArticles.find({authorId:user.username}).sort({createdAt:1}).lean();
        let requests = await RequestColl.find({authorId:user.username});
        if(requests.length != 0){
            requests = requests[0].requestData;
        }
        if(articles.length != 0){
            articles = articles[0].article;
        }
        res.render("myAccount",{articles:articles,user:user,requests:requests});
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
});


app.use('/article',articleRouter);
app.use('/auth',authRouter);
app.use('/publish',publishRouter);


app.get('/admin-portal',async(req,res)=>{
    try{
        const requests = await RequestColl.find({});
        res.status(200).render('adminPortal',{requests:requests});
    }catch(err){
        res.status(400).send(err);
    }
});

app.listen(port,(req,res)=>{
    console.log(`server live on port ${port}`);
});