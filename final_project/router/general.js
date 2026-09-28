const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are required"});
  }

  if (!isValid(username)) {
    return res.status(404).json({message: "User already exists!"});
  }

  users.push({username, password: bcrypt.hashSync(password, 10)});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  }).then((booklist) => {
    return res.status(200).send(JSON.stringify(booklist, null, 4));
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found for ISBN " + isbn);
    }
  }).then((book) => {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }).catch((error) => {
    return res.status(404).json({message: error});
  });
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    let matches = Object.keys(books)
      .filter((isbn) => books[isbn].author === author)
      .map((isbn) => ({isbn, ...books[isbn]}));
    resolve(matches);
  }).then((matches) => {
    if (matches.length === 0) {
      return res.status(404).json({message: "No books found for author " + author});
    }
    return res.status(200).send(JSON.stringify(matches, null, 4));
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    let matches = Object.keys(books)
      .filter((isbn) => books[isbn].title === title)
      .map((isbn) => ({isbn, ...books[isbn]}));
    resolve(matches);
  }).then((matches) => {
    if (matches.length === 0) {
      return res.status(404).json({message: "No books found with title " + title});
    }
    return res.status(200).send(JSON.stringify(matches, null, 4));
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;

// ---------------------------------------------------------------------------
// Task 10: Node.js program using Axios + async/await to consume the API above.
// These are standalone helper functions (not Express routes) demonstrating
// non-blocking retrieval of book data. Run the server first (npm start),
// then invoke these e.g. from a small script or the Node REPL.
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:5000";

async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

async function getBookByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

async function getBookByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;
