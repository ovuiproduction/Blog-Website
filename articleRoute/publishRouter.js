const express = require("express");
const router = express.Router();
const userArticles = require("../models/userArticles");
const Article = require("../models/article");
const RequestColl = require("../models/request");


// request for publish
router.get("/article/:blogName/:blogId", async (req, res) => {
  try {
    const { blogName, blogId } = req.params;
    const user = req.session.user;
    if (!user) {
      return res.status(401).send("User not authenticated");
    }
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = date.getFullYear();
    const dateOfRequest = `${dd}-${mm}-${yy}`;
    let requestData = {
      blogName: blogName,
      blogId: blogId,
      dateOfRequest: dateOfRequest,
    };
    let request = await RequestColl.findOne({ authorId: user.username });

    if (request) {
      request.requestData.push(requestData);
    } else {
      request = new RequestColl({
        authorId: user.username,
        requestData: [requestData],
      });
    }

    await request.save();

    res.redirect("/my-account/dashboard");
  } catch (err) {
    console.log(err);
    res.status(400).send("Internal Server Error");
  }
});

// view request for admin
router.get("/view-request/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const requests = await RequestColl.findOne({
      "requestData._id": requestId,
    });
    const request = requests.requestData.id(requestId);
    const userDoc = await userArticles.findOne({
      "article._id": request.blogId,
    });
    const article = userDoc.article.id(request.blogId);
    const paragraphs = article.content.split("<br>");
    res
      .status(400)
      .render("approveRequest", {
        article: article,
        formattedBlogContent: paragraphs,
        author: requests.authorId,
        request: request,
        requestId:requestId
      });
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

// approve request for admin
router.get("/approve-request/:reqId/:blogId", async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const blogId = req.params.blogId;

    const requestDoc = await RequestColl.findOne({
      "requestData._id": requestId,
    });
    

    const request = requestDoc.requestData.id(blogId);

    

    const date = new Date();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = date.getFullYear();
    const dateOfApprove = `${dd}-${mm}-${yy}`;
    request.dateOfApprove = dateOfApprove;
    request.status = "Approved";
    request.remark = "Published";
    await requestDoc.save();

    const userDoc = await userArticles.findOne({ "article._id": request.blogId });
    const article = userDoc.article.id(request.blogId);
    article.status = "Public";
    await userDoc.save();

    const publicBlog = new Article({title:article.title,content:article.content,description:article.description});
    await publicBlog.save();

    res.status(400).redirect("/admin-portal");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
