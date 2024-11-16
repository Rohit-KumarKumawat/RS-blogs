const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Blog Server is running...");
});

app.listen(PORT, () => console.log(`Server Started at PORT : ${PORT}`));
