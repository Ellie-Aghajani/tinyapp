const { checkIfUserExists, findUser, returnUsersUrls, generateRandomString} = require('../helper.js');
const { assert } = require('chai');
const { expect } = require('chai');
const { it } = require('mocha');
const { describe } = require('mocha');


//the database test
const testURLs = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//test for the function generateRandomString
describe('generateRandomString()', () => {
  it('should return a string with a length of 6, with no argument passed', () => {
    const resultLength = generateRandomString().length;
    const expectedLength = 6;

    expect(resultLength).to.be.equal(expectedLength);
  });
});

//test for the function checkIfUserExists
describe('checkIfUserExists', function() {
  it('should return true with valid email', function() {
    const user = checkIfUserExists(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false with non valid email', function() {
    const user = checkIfUserExists(testUsers, "un@example.com");
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

//test of the function findUser
describe('findUser', function() {
  it('should return undefined with non valid email', function() {
    const user = findUser(testUsers, "un@example.com");
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

//test of the function returnUsersUrls
describe('returnUsersUrls', function() {
  it('should return a list of URLs of a user', function() {
    const urls = returnUsersUrls(testURLs, "userRandomID");
    const expectedOutput = { "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},};
    assert.deepEqual(urls, expectedOutput);
  });
  it('should return {} of  a non valid user', function() {
    const urls = returnUsersUrls(testURLs, "userunknownID");
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});