const bcrypt = require('bcrypt');

const checkIfUserExists =(users, email) =>{
  for (let id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

const findUser =(users, email, password) =>{
  for (let id in users) {
    if (users[id].email === email) {
      if (bcrypt.compareSync(password, users[id].password)) {
        return id;
      }
    }
  }
  return;
};


const returnUsersUrls =(urlDatabase, userID) => {
  let newObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      newObj[key] = urlDatabase[key];
    }
  }
  return newObj;
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

module.exports = {
  checkIfUserExists,
  findUser,
  returnUsersUrls,
  generateRandomString
};

