const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const authRouter = require('./authRoutes/authRouter');
const articleRouter = require('./articleRoute/routes');
const publishRouter = require('./articleRoute/publishRouter');
const publicArticleRouter = require('./publicArticleRoutes/publicArticleRouter');
const myAccountRouter = require('./myAccountRoute/myAccountRouter');
const adminRouter = require('./adminRoutes/adminRoute');

const RequestColl = require("./models/request");
const Article = require('./models/article');

const database_url = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

const app = express();

app.use(session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// app.use((req, res, next) => {
//     res.locals.successMessage = req.session.successMessage || null;
//     res.locals.failureMessage = req.session.failureMessage || null;
//     delete req.session.successMessage;
//     delete req.session.failureMessage;
//     next();
// });

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
        const articles = await Article.find().sort({createdAt:1}).lean();
        res.render('home',{articles:articles});
    }catch(err){
        console.log("Internal Server Error");
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
app.use('/auth',authRouter);
app.use('/publish',publishRouter);
app.use('/public-article',publicArticleRouter);
app.use('/my-account',myAccountRouter);
app.use('/admin-portal',adminRouter);


app.listen(port,(req,res)=>{
    console.log(`server live on port ${port}`);
});