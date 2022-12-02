/////////////////////////////////  Config /////////////////////////////////////
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')
const { checkIfUserExists, findUser, returnUsersUrls, generateRandomString } = require('./helper.js');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
app.use(methodOverride('_method'))
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {};
/////////////////////////////////  App Routes /////////////////////////////////
// First page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls.users.json', (req, res) => {
  res.json(users);
});

//Go to create new url page
app.get('/urls/new', (req, res) => {
  if (!users[req.session['user_id']]) {
    res.redirect('/login?reroute=true');
    return;
  }
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render('urls_new', templateVars);
});

//Main page
app.get('/urls', (req, res) => {
  if (!users[req.session['user_id']]) {
    res.redirect('/login?reroute=true');
    return;
  }
  let doesntExist = req.query.doesntExist ? true : false;
  let denied = req.query.denied ? true : false;
  let usersUrls = returnUsersUrls(urlDatabase, req.session['user_id']);
  const templateVars = {
    urls: usersUrls,
    user: users[req.session['user_id']],
    denied,
    doesntExist
  };
  res.render('urls_index', templateVars);
});


//Go to a specific shortURL
app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).redirect('/urls?doesntExist=true');
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session['user_id']) {
    res.status(403).redirect('/urls?denied=true');
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    url: urlDatabase[req.params.shortURL],
    user: users[req.session['user_id']]
  };
  res.render('urls_show', templateVars);
});

//Go to longURL 
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).redirect('/urls?doesntExist=true');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//Creates a new shortURL
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session['user_id'],
  };
  res.redirect(`/urls/${randomString}`);
});


//Update (edit) longURL
app.put('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).userIDredirect('/urls?doesntExist=true');
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session['user_id']) {
    res.status(403).redirect('/urls?denied=true');
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/');
});

//Delete shortURL form list 
app.delete('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).userIDredirect('/urls?doesntExist=true');
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session['user_id']) {
    res.status(403).redirect('/urls?denied=true');
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect('/');
});

//Login 
app.get('/login', (req, res) => {
  if (users[req.session['user_id']]) {
    res.redirect('/urls');
    return;
  }
  let reroute;
  let failed;
  if (req.query.reroute) {
    reroute = JSON.parse(req.query.reroute);
  }
  if (req.query.failed) {
    failed = JSON.parse(req.query.failed);
  }
  const templateVars = {
    user: users[req.session['user_id']],
    reroute,
    failed
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userKey = findUser(users, email, password);
  if (userKey) {
    req.session['user_id'] = userKey;
    res.redirect('/');
  } else {
    res.status(403).redirect('/login?failed=true');
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/');
});



//Register page 
app.get('/register', (req, res) => {
  if (users[req.session['user_id']]) {
    res.redirect('/urls');
    return;
  }
  let userExists = req.query.userExists ? true : false;
  const templateVars = {
    user: users[req.session['user_id']],
    userExists
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    console.log('please make sure to provide all required information');
    res.status(400).redirect('/register');
    return;
  }
  if (checkIfUserExists(users, email)) {
    console.log('user with the given email already exists in the db');
    res.status(400).redirect('/register?userExists=true');
    return;
  }
  const id = generateRandomString();
  const newUser = {
    id,
    name,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[id] = newUser;
  req.session['user_id'] = id;
  res.redirect('/');
});

