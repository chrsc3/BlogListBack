const dummy = (blogs) => {
  return 1;
};
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};
const favoriteBlog = (blogs) => {
  const favoriteBlog = blogs.reduce((max, blog) =>
    max.likes > blog.likes ? max : blog
  );

  return {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: favoriteBlog.likes,
  };
};
const mostBlogs = (blogs) => {
  const blogCounts = {};
  let maxAuthor = "";
  let maxCount = 0;

  blogs.forEach((blog) => {
    if (blog.author in blogCounts) {
      blogCounts[blog.author]++;
    } else {
      blogCounts[blog.author] = 1;
    }

    if (blogCounts[blog.author] > maxCount) {
      maxAuthor = blog.author;
      maxCount = blogCounts[blog.author];
    }
  });

  return {
    author: maxAuthor,
    blogs: maxCount,
  };
};
const mostLikes = (blogs) => {
  const LikeCounts = {};
  let maxAuthor = "";
  let maxCount = 0;

  blogs.forEach((blog) => {
    if (blog.author in LikeCounts) {
      LikeCounts[blog.author] = LikeCounts[blog.author] + blog.likes;
    } else {
      LikeCounts[blog.author] = blog.likes;
    }

    if (LikeCounts[blog.author] > maxCount) {
      maxAuthor = blog.author;
      maxCount = LikeCounts[blog.author];
    }
  });

  return {
    author: maxAuthor,
    likes: maxCount,
  };
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
