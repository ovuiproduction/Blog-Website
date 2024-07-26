const express = require('express');
const router = express.Router();
const Article = require('../models/article');

router.get('/new',(req,res)=>{
    try{
        const article = new Article();
        const blogContent = article.content;
        const normalisedContent = "";
        res.render("new",{article:article,aritcalContent:normalisedContent});
    }catch(err){
        console.log(err);
    }
});

router.post('/new',async (req,res)=>{
    try{
        let article = new Article();
        article.title = req.body.title.charAt(0).toUpperCase() + req.body.title.slice(1);
        article.description = req.body.description; 
        const userEnteredContent = req.body.content;
        const formattedContent = userEnteredContent.replace(/\n/g, '<br>');
        article.content = formattedContent;
        article = await article.save()
        res.redirect('/');
    }catch(err){
        console.log(err);
    }
});

router.post('/drop/:id',async (req,res)=>{
    try{
        const articleDelete = await Article.findByIdAndDelete(req.params.id);
        res.redirect('/');
    }catch(err){
        console.log(err);
    }
});

router.get('/read/:id',async(req,res)=>{
    const article = await Article.findById(req.params.id);
    const paragraphs = article.content.split('<br>');
    res.render("read",{article:article,formattedBlogContent:paragraphs});
});

router.get('/edit/:id',async (req,res)=>{
    const article = await Article.findById(req.params.id);
    const blogContent = article.content;
    const normalisedContent = blogContent.replace(/<br>/g,'\n');
    res.render("edit",{article:article,aritcalContent:normalisedContent});
});

router.post('/edit/:id',async (req,res)=>{
    let article = await Article.findById(req.params.id);
    article.title = req.body.title.charAt(0).toUpperCase() + req.body.title.slice(1);
    article.description = req.body.description;
    article.content = req.body.content;
    article = await article.save()
    res.redirect('/');
});




module.exports = router