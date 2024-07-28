const express = require("express");
const router = express.Router();

const Article = require('../models/article');
const RequestColl = require("../models/request");
const HistoryColl = require("../models/history");

router.get('/dashboard',async(req,res)=>{
    try{
        const articles = await Article.find().sort({createdAt:1}).lean();
        res.render('adminPortal',{articles:articles});
    }catch(err){
        console.log("Internal Server Error");
    }
});

router.get('/request-list',async(req,res)=>{
    try{
        const requests = await RequestColl.find({});
        res.status(200).render('adminRequestList',{requests:requests});
    }catch(err){
        res.status(400).send(err);
    }
});


router.get('/read/:id',async(req,res)=>{
    try {
        const articleId = req.params.id;
        const article  = await Article.findById({_id:articleId});
        if (!article) {
          return res.status(404).send("Article not found");
        }
        const paragraphs = article.content.split("<br>");
        res.render("readAdmin", { article: article, formattedBlogContent: paragraphs });
      } catch (err) {
        res.status(400).send("Internal Server Error");
      }
});

router.post('/drop/:id',async(req,res)=>{
    try {
        const articleId = req.params.id;
        const article  = await Article.deleteOne({_id:articleId});
        res.status(200).redirect('/admin-portal/dashboard');
      } catch (err) {
        res.status(400).send("Internal Server Error");
      }
});


module.exports = router;
