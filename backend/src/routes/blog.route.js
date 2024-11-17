const express = require("express");
const BLOG = require("../model/blog.model");
const COMMENT = require("../model/comment.model");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

//create a blog post
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
  try {
    // console.log(req.body);
    const newPost = new BLOG({ ...req.body, author: req.userId }); // use author:req.userId,when you have tokenVerify
    await newPost.save();
    res.status(201).send({ msg: "Post created successfully", post: newPost });
  } catch (err) {
    console.error("Error creating post: ", err);
    res.status(500).send({ msg: "Error creating post" });
  }
});

//get all blogs
router.route("/").get(async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let query = {};
    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }
    if (category) {
      query = {
        ...query,
        category,
      };
    }
    if (location) {
      query = {
        ...query,
        location,
      };
    }

    const post = await BLOG.find(query)
      .populate("author", "email")
      .sort({ createdAt: -1 });
    res.status(200).send({
      msg: "All posts retrieved successfully",
      posts: post,
    });
  } catch (err) {
    console.error("Error while retrieving post: ", err);
    res.status(500).send({ msg: "Error while retrieving post" });
  }
});

//get single blog by id
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await BLOG.findById(postId);
    if (!post) {
      return res.status(404).send({ msg: "Post Not Found" });
    }
    //Todo:will fetch comments related to post
    const comment = await COMMENT.find({ postId: postId }).populate(
      "user",
      "username email"
    );
    res.status(200).send({ msg: "post retrieved successfully", post: post });
  } catch (err) {
    console.error("Error fetching single post: ", err);
    res.status(500).send({ msg: "Error fetching single post" });
  }
});

//update a blog post
router.patch("/update-post/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatePost = await BLOG.findByIdAndUpdate(
      postId,
      {
        ...req.body,
      },
      { new: true }
    );
    if (!updatePost) {
      return res.status(404).send({ msg: "Post Not Found" });
    }
    res
      .status(200)
      .send({ msg: "post updated successfully", post: updatePost });
  } catch (err) {
    console.error("Error updating post: ", err);
    res.status(500).send({ msg: "Error  updating  post" });
  }
});

//delete a blog post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await BLOG.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }
    //delete related comments
    await COMMENT.deleteMany({ postId: postId });

    res.status(200).send({
      msg: "Post deleted successfully",
      post: post,
    });
  } catch (err) {
    console.error("Error deleting post: ", err);
    res.status(500).send({ msg: "Error  deleting  post" });
  }
});

//related post
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ msg: "Post id is required" });
    }
    const blog = await BLOG.findById(id);
    if (!blog) {
      return res.status(400).send({ msg: "Post is not found!" });
    }
    const titleRegex = new RegExp(blog.title.split(" ").join("|"), "i");

    const relatedQuery = {
      _id: { $ne: id }, //exclude the current blog by id
      title: { $regex: titleRegex },
    };

    const relatedPost = await BLOG.find(relatedQuery);
    res.status(200).send({ msg: "Related Post found!", post: relatedPost });
  } catch (err) {
    console.error("Error deleting post: ", err);
    res.status(500).send({ msg: "Error  deleting  post" });
  }
});

module.exports = router;
