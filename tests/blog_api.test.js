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
      .set("Authorization", `Bearer ${helper.token}`)
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
  test("if likes property is missing, it should have a default value of 0", async () => {
    const newBlog = {
      title: "Blog Without Likes",
      author: "John",
      url: "https://example.com/blog",
      user: helper.userForToken.id,
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${helper.token}`)
      .send(newBlog)
      .expect(201);

    assert.strictEqual(response.body.likes, 0);
  });
  test("if title or url is missing, respond with 400 Bad Request", async () => {
    const newBlogWithoutTitle = {
      author: "Jane",
      url: "https://example.com/blog",
      likes: 10,
      user: helper.userForToken.id,
    };

    const newBlogWithoutUrl = {
      title: "Blog Without URL",
      author: "Jane",
      likes: 10,
      user: helper.userForToken.id,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${helper.token}`)
      .send(newBlogWithoutTitle)
      .expect(400);

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${helper.token}`)
      .send(newBlogWithoutUrl)
      .expect(400);
  });
});
describe("deletion and updating of a blog", () => {
  test("a blog can be deleted", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${helper.token}`)
      .expect(204);

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
      user: helper.userForToken.id,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${helper.token}`)
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

    const passwordHash = await bcrypt.hash("1234", 10);
    const user = new User({ username: "carlos", name: "Carlos", passwordHash });

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
      .set("Authorization", `Bearer ${helper.token}`)
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
      username: "carlos",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .set("Authorization", `Bearer ${helper.token}`)
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("Username already exists"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});
test("creation fails with proper statuscode and message if username or password is less than 3 characters", async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: "us",
    name: "User",
    password: "pw",
  };

  const result = await api
    .post("/api/users")
    .set("Authorization", `Bearer ${helper.token}`)
    .send(newUser)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  const usersAtEnd = await helper.usersInDb();
  assert(
    result.body.error.includes(
      "Username and password must have at least 3 characters"
    )
  );

  assert.strictEqual(usersAtEnd.length, usersAtStart.length);
});
after(async () => {
  await mongoose.connection.close();
});
