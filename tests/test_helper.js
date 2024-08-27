const { use } = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userForToken = {
  username: "carlos",
  id: "66cd2e3d14511854b8bdfd47",
};

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcmxvcyIsImlkIjoiNjZjZDJlM2QxNDUxMTg1NGI4YmRmZDQ3IiwiaWF0IjoxNzI0NzIyOTA4fQ.OCRBU-i62fLN3j4BQOUOrlbOd-bhlIAwlH0b754tHso";
const initialBlogs = [
  {
    title: "Blog 1",
    author: "Juan",
    url: "sinUrl",
    likes: 10,
    user: "66cd2e3d14511854b8bdfd47",
  },
  {
    title: "Blog 2",
    author: "Carlos",
    url: "sinUrl",
    likes: 100,
    user: "66cd2e3d14511854b8bdfd47",
  },
];
const nonExistingId = async () => {
  const blog = new Blog({ content: "willremovethissoon" });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const notes = await Blog.find({});
  return notes.map((blog) => blog.toJSON());
};
const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  token,
  nonExistingId,
  blogsInDb,
  usersInDb,
  userForToken,
};
