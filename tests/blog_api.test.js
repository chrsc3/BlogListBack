const { test, after, beforeEach, describe } = require("node:test");
const bcrypt = require("bcrypt");
const assert = require("node:assert");
const Blog = require("../models/blog");
const User = require("../models/user");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

describe("when there is initially", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog);
      await blogObject.save();
    }
  });
  test("blog are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
describe("posting a new blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog);
      await blogObject.save();
    }
  });
  test("a valid blog can be added ", async () => {
    const newBlog = {
      title: "Blog New",
      author: "Carlos",
      url: "sinUrl",
      likes: 100,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    const contents = blogsAtEnd.map((n) => n.title);
    assert(contents.includes("Blog New"));
  });
  test("blog posts have unique identifier property named 'id'", async () => {
    const response = await api.get("/api/blogs");
    const blogs = response.body;

    blogs.forEach((blog) => {
      assert(blog.id);
    });
  });
  test("if likes property is missing, it should have a default value of 0", async () => {
    const newBlog = {
      title: "Blog Without Likes",
      author: "John",
      url: "https://example.com/blog",
    };

    const response = await api.post("/api/blogs").send(newBlog).expect(201);

    assert.strictEqual(response.body.likes, 0);
  });
  test("if title or url is missing, respond with 400 Bad Request", async () => {
    const newBlogWithoutTitle = {
      author: "Jane",
      url: "https://example.com/blog",
      likes: 10,
    };

    const newBlogWithoutUrl = {
      title: "Blog Without URL",
      author: "Jane",
      likes: 10,
    };

    await api.post("/api/blogs").send(newBlogWithoutTitle).expect(400);

    await api.post("/api/blogs").send(newBlogWithoutUrl).expect(400);
  });
});
describe("deletion and updating of a blog", () => {
  test("a blog can be deleted", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((n) => n.title);
    assert(!contents.includes(blogToDelete.title));
  });
  test("a blog can be updated", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlog = {
      title: "Updated Blog",
      author: "John Doe",
      url: "https://example.com/updated-blog",
      likes: 50,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlogInDb = blogsAtEnd.find(
      (blog) => blog.id === blogToUpdate.id
    );

    assert.strictEqual(updatedBlogInDb.title, updatedBlog.title);
    assert.strictEqual(updatedBlogInDb.author, updatedBlog.author);
    assert.strictEqual(updatedBlogInDb.url, updatedBlog.url);
    assert.strictEqual(updatedBlogInDb.likes, updatedBlog.likes);
  });
});
describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
