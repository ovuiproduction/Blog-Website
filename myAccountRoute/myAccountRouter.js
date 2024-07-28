const express = require("express");
const router = express.Router();

const userArticles = require('../models/userArticles');
const RequestColl = require("../models/request");
const HistoryColl = require("../models/history");

router.get('/dashboard',async(req,res)=>{
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

router.get('/history',async(req,res)=>{
    try{
        res.status(200).render("myHistory");
    }catch(err){
        res.status(400).send("Internal Server Error");
    }
})

module.exports = router;
