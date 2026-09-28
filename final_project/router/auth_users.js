const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Username is valid to register if it's non-empty and not already taken
  let userswithsamename = users.filter((user)=>{return user.username === username;});
  return username && username.trim().length > 0 && userswithsamename.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{return user.username === username && user.password === password;});
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in. Username and password are required."});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

  let accessToken = jwt.sign({
    data: username
  }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = {
    accessToken, username
  };
  return res.status(200).json({message: "User successfully logged in", accessToken});
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization ? req.session.authorization.username : undefined;

  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }

  if (!review) {
    return res.status(400).json({message: "Review text is required as a query parameter"});
  }

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "The review for the book with ISBN " + isbn + " has been added/updated", reviews: books[isbn].reviews});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization.username : undefined;

  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "No review by this user found for ISBN " + isbn});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({message: "The review for the book with ISBN " + isbn + " has been deleted", reviews: books[isbn].reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
