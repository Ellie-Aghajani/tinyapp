const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};
/////////////////////////////////  App Routes /////////////////////////////////
// First page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get('/urls', (req, res) => {
  let templateVars = {urls : urlDatabase}
  res.render("urls_index",  templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  let templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let randomString = generateString(6);
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});



app.get("/urls/:id", (req, res) => {
  res.render('/urls');
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});