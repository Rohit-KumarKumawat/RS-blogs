const express = require("express");
const COMMENT = require("../model/comment.model");

const router = express.Router();

//create a comment
router.post("/post-comment", async (req, res) => {
  try {
    const newComment = new COMMENT(req.body);
    await newComment.save();
    res
      .status(200)
      .send({ msg: "Comment created successfully", comment: newComment });
  } catch (error) {
    console.error("An error occured while posting new comment", error);
    res.status(500).send({ msg: "An error occured while posting new comment" });
  }
});

//get all comment count
router.get("/total-comments", async (req, res) => {
  try {
    const totalComment = await COMMENT.countDocuments({});
    res.status(200).send({ message: "Total comments count", totalComment });
  } catch (error) {
    console.error("An error occured while getting comment count", error);
    res
      .status(500)
      .send({ msg: "An error occured while getting comment count" });
  }
});

module.exports = router;
