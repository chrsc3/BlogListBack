const { test, after, beforeEach, describe } = require("node:test");
const bcrypt = require("bcrypt");
const assert = require("node:assert");
const Blog = require("../models/blog");
const User = require("../models/user");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const api = supertest(app);

test("dec test", async () => {
  const userForToken = {
    username: "carlos",
    id: "66cd2e3d14511854b8bdfd47",
  };

  const token = jwt.sign(userForToken, process.env.SECRET);
  console.log(token);
  const decodedToken = jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      assert.fail("token invalid");
    } else {
      console.log(decoded);
      assert(decoded, "token invalid");
    }
  });
});
after(async () => {});
