const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
require("express-async-errors");
const User = require("../models/user");

usersRouter.post("/", async (request, response, next) => {
  try {
    const { username, name, password } = request.body;

    // Check if username and password are provided
    if (!username || !password) {
      return response
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Check if username and password have at least 3 characters
    if (username.length < 3 || password.length < 3) {
      return response
        .status(400)
        .json({
          error: "Username and password must have at least 3 characters",
        });
    }

    // Check if username is unique
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response.status(400).json({ error: "Username already exists" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
  });
  response.json(users);
});
usersRouter.get("/:id", async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (user) {
      response.json(user);
    } else {
      response.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
