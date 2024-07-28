const express = require("express");
const router = express.Router();
const Article = require("../models/article");

router.get('/read/:id',async(req,res)=>{
    try {
        const articleId = req.params.id;
        const article  = await Article.findById({_id:articleId});
        if (!article) {
          return res.status(404).send("Article not found");
        }
        const paragraphs = article.content.split("<br>");
        res.render("readPublic", { article: article, formattedBlogContent: paragraphs });
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
});


module.exports = router;
