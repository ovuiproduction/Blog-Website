const express = require("express");
const router = express.Router();

const userArticles = require('../models/userArticles');
const RequestColl = require("../models/request");
const HistoryColl = require("../models/history");

router.get('/dashboard',async(req,res)=>{
    try{
        const user = req.session.user;
        const successMessage = req.session.successMessage;
        const failureMessage = req.session.failureMessage;
        let articles = await userArticles.find({authorId:user.username}).sort({createdAt:1}).lean();
        let requests = await RequestColl.find({authorId:user.username});
        if(requests.length != 0){
            requests = requests[0].requestData;
        }
        if(articles.length != 0){
            articles = articles[0].article;
        }
        res.render("myAccount",{articles:articles,user:user,requests:requests,successMessage:successMessage,failureMessage:failureMessage,});
    }catch(err){
        res.redirect('/');
    }
});

router.get('/published-articles', async (req, res) => {
    try {
        const user = req.session.user;
        let userDoc = await userArticles.findOne({ authorId: user.username });
        if (!userDoc) {
            return res.render("myPublishedArticles", { articles: [] });
        }
        let publicArticles = userDoc.article.filter(article => article.status === "Public");
        res.render("myPublishedArticles", { articles: publicArticles });
    } catch (err) {
        console.error(err);
        res.status(400).send("Internal Server Error");
    }
});

router.get('/public-article/read/:id',async(req,res)=>{
    try {
        const articleId = req.params.id;
        const articleDoc  = await userArticles.findOne({'article._id':articleId});
        let article = articleDoc.article.id(articleId);
        if (!article) {
          return res.status(404).send("Article not found");
        }
        const paragraphs = article.content.split("<br>");
        res.render("readPublished", { article: article, formattedBlogContent: paragraphs });
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
});

router.get('/history',async(req,res)=>{
    try{
        const user = req.session.user;
        const historyDoc = await HistoryColl.find({authorId:user.username});
        res.status(200).render("myHistory",{historyData:historyDoc[0].historyData});
    }catch(err){
        res.status(400).send("Internal Server Error");
    }
});

router.get('/clear',(req,res)=>{
    try{
        delete req.session.successMessage;
        delete req.session.failureMessage;
        res.redirect('/my-account/dashboard');
    }
    catch(err){
        res.redirect('/my-account/dashboard');
    }
});

module.exports = router;
