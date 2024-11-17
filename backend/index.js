const express = require("express");
const { connectMongoDB } = require("./connection");

const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const blogRoutes = require("./src/routes/blog.route");
const commentRoutes = require("./src/routes/comment.route");
const userRoutes = require("./src/routes/auth.user.route");
//parse options // middlewares
app.use(express.json());
app.use(cors());

//MongoDB connection
connectMongoDB(process.env.MONGODB_URL);
//Routes
app.use("/api/auth", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("Blog Server is running...");
});

app.listen(PORT, () => console.log(`Server Started at PORT : ${PORT}`));
