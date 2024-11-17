const express = require("express");

const USER = require("../model/user.model");
const generateToken = require("../middleware/generateToken");
const router = express.Router();

//register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const user = new USER({ email, password, username });
    await user.save();
    res.status(200).send({ msg: "user registered successfully!", user: user });
  } catch (error) {
    console.error("Failed to register", error);
    res.status(500).json({ msg: "Registration failed!" });
  }
});

//login a user
router.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await USER.findOne({ email });

    if (!user) {
      return res.status(404).send({ msg: "User not found!" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).send({ msg: "Invalid password" });
    }
    //generate token here
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, //enable this only when you have https://
      secure: true,
      sameSite: true,
    });
    res.status(200).send({
      msg: "Login successful!",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to login", error);
    res.status(500).json({ msg: "Login failed !Try again" });
  }
});

//logout a user
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send({ msg: "Logged out successfully done!" });
  } catch (error) {
    console.error("Failed to log out", error);
    res.status(500).json({ msg: "Logout failed" });
  }
});

//get all users
router.get("/users", async (req, res) => {
  try {
    const users = await USER.find({}, "id email role");
    res.status(200).send({ msg: "Users found successfully", users });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ msg: "Failed to fetch users!" });
  }
});

//delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await USER.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ msg: "User not fount!" });
    }
    res.status(200).send({ msg: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).json({ msg: "Error deleting user!" });
  }
});

//update a user role
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await USER.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).send({ msg: "User not fount!" });
    }
    res.status(200).send({ msg: "User role updated successfully!", user });
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).json({ msg: "Failed updating user role!" });
  }
});

module.exports = router;
