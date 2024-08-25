const Blog = require("../models/blog");
const User = require("../models/user");
const initialBlogs = [
  {
    title: "Blog 1",
    author: "Juan",
    url: "sinUrl",
    likes: 10,
  },
  {
    title: "Blog 2",
    author: "Carlos",
    url: "sinUrl",
    likes: 100,
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
  nonExistingId,
  blogsInDb,
  usersInDb,
};
