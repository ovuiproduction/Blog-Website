const express = require("express");
const router = express.Router();

const userArticles = require("../models/userArticles");
const RequestColl = require("../models/request");
const HistoryColl = require("../models/history");

const updateHistory = async (
  authorId,
  articleId,
  blogName,
  actionType,
  actionDescription
) => {
  try {
    let historyDoc = await HistoryColl.findOne({ authorId: authorId });
    const date = new Date();
    const dd = String(date.getDate()).padStart("0", 2);
    const mm = String(date.getMonth() + 1).padStart("0", 2);
    const yy = date.getFullYear();
    const dateOfAction = `${dd}-${mm}-${yy}`;

    let actionDetails = {
      actionType: actionType,
      dateOfAction: dateOfAction,
      actionDescription: actionDescription,
    };

    if (historyDoc) {
      let articleHistory = historyDoc.historyData.find(
        (history) => history.blogId === articleId
      );

      if (articleHistory) {
        articleHistory.actions.push(actionDetails);
      } else {
        historyDoc.historyData.push({
          blogId: articleId,
          blogName:blogName,
          actions: [actionDetails],
        });
      }

      await historyDoc.save();
    } else {
      let newHistoryDoc = new HistoryColl({
        authorId: authorId,
        historyData: [
          {
            blogId: articleId,
            blogName:blogName,
            actions: [actionDetails],
          },
        ],
      });

      await newHistoryDoc.save();
    }
  } catch (err) {
    console.log("Update history error: " + err);
  }
};



router.get("/new", (req, res) => {
  try {
    const article = new userArticles();
    const blogContent = article.content;
    const normalisedContent = "";
    res.render("new", { article: article, aritcalContent: normalisedContent });
  } catch (err) {
    console.log(err);
  }
});

router.post("/new", async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).send("User not authenticated");
    }

    const formattedContent = content.replace(/\n/g, "<br>");
    const article = {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: description,
      content: formattedContent,
    };

    let blog = await userArticles.findOne({ authorId: user.username });

    if (blog) {
      blog.article.push(article);
    } else {
      blog = new userArticles({
        authorId: user.username,
        article: [article],
      });
    }
    const newArticle = blog.article[blog.article.length - 1];
   
    await blog.save() && updateHistory(user.username,newArticle._id,title,"Create","Article Initialized");
      
    res.redirect("/my-account/dashboard");

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/request-drop/:id",(req,res)=>{
  const articleId = req.params.id;
  res.render("deleteConformation",{articleId : articleId});
});

router.post("/request-drop/:id",async(req,res)=>{
  try{
  const user = req.session.user;
  const articleId = req.params.id;
  const password = req.body.password;
  if(password == user.password){
    req.session.successMessage = "Delete Successfully";
    res.status(200).redirect(`/article/drop/${articleId}`);
  }
  else{
    req.session.failureMessage = "Invalid Password!";
    res.status(400).redirect("/my-account/dashboard");
  }
}catch(err){
  res.status(404).send("Internal Server Error")
}
});

router.get("/drop/:id", async (req, res) => {
  try {
    const user = req.session.user;

    const articleId = req.params.id;
    let userDocument = await userArticles.findOne({ "article._id": articleId });

    if (!userDocument) {
      return res.status(404).send("Article not found");
    }

    let articleIndex = userDocument.article.findIndex(
      (article) => article._id.toString() === articleId
    );

    let article = userDocument.article.find(
      (article) => article._id.toString() === articleId
    );

    if (articleIndex === -1) {
      return res.status(404).send("Article not found");
    }

    // Remove the specific article from the user's articles array
    userDocument.article.splice(articleIndex, 1);

    // Save the updated document
    await userDocument.save() && updateHistory(user.username,articleId,article.title,"Delete","Article Deleted");

    let requestDocument = await RequestColl.findOne({
      "requestData.blogId": articleId,
    });
    articleIndex = -1;
    if(requestDocument){
      articleIndex = requestDocument.requestData.findIndex(
        (article) => article.blogId.toString() === articleId
      );  
    }
    
    if (requestDocument && articleIndex != -1 && article.status == "Private") {
      if (!requestDocument) {
        return res.status(404).send("Article not found");
      }
      requestDocument.requestData.splice(articleIndex, 1);

      await requestDocument.save();
    }
    res.redirect("/my-account/dashboard");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/read/:id", async (req, res) => {
  try {
    const articleId = req.params.id;

    // Find the user document that contains the article with the specified ID
    let userDocument = await userArticles.findOne({ "article._id": articleId });

    if (!userDocument) {
      return res.status(404).send("Article not found");
    }

    // Find the specific article within the user document
    let article = userDocument.article.id(articleId);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    const paragraphs = article.content.split("<br>");
    res.render("read", { article: article, formattedBlogContent: paragraphs });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const articleId = req.params.id;

    let userDocument = await userArticles.findOne({ "article._id": articleId });

    if (!userDocument) {
      return res.status(404).send("Article not found");
    }

    let article = userDocument.article.id(articleId);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    res.render("edit", { article: article });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const { title, description, content } = req.body;
    const user = req.session.user;
    let userDocument = await userArticles.findOne({ "article._id": articleId });

    if (!userDocument) {
      return res.status(404).send("Article not found");
    }

    let article = userDocument.article.id(articleId);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    article.title = title.charAt(0).toUpperCase() + title.slice(1);
    article.description = description;
    article.content = content.replace(/\n/g, "<br>");

    await userDocument.save() && updateHistory(user.username,articleId,title,"Edit","Article Edited");

    res.redirect("/my-account/dashboard");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
