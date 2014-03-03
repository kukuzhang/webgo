'use strict';

describe('Service: Identity', function () {

  function ObjectId(s) { return {_id:s}; }
  var user1 = { "lastActive" : "1393745684193", "token" : "ya29.1.AADtN_XF86JUVfvQDldF3byaspI97tWGg-fTihh5oTFimdPVNkJ4KHDN5-FQPbEuA4amQEo", "locale" : "fi", "gender" : "male", "picture" : "https://lh5.googleusercontent.com/-DUwt4x-323E/AAAAAAAAAAI/AAAAAAAAAuQ/a2_R7vV290A/photo.jpg", "email" : "juhovuo@gmail.com", "given_name" : "Juho", "family_name" : "Vuori", "name" : "Juho Vuori", "verified_email" : true, "provider" : "google", "id" : "104286650881859158337", "_id" : ObjectId("530e3aa8e957e2f464651210"), "__v" : 0 };
  var user2 = { "lastActive" : "1393752547849", "token" : "ya29.1.AADtN_V5LlwIcWTNNOwIhgzLSZGvkWQ_Y0a-QnV6w9e_Eg5qU7RjhThwKC9brQgiEXS98H0", "locale" : "en", "gender" : "female", "picture" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "email" : "webgohelper@gmail.com", "given_name" : "Marja", "family_name" : "Murjalainen", "name" : "Marja Murjalainen", "verified_email" : true, "provider" : "google", "id" : "108624322331339488326", "_id" : ObjectId("530e55b1041bfc1071aadcfc"), "__v" : 0 }

  // load the service's module
  beforeEach(module('aApp'));

  // instantiate service
  var identity;
  beforeEach(inject(function (_identity_) {
    identity = _identity_;
  }));

  it('now how to compare equality of users', function () {
    expect(identity.equals(user1,user1)).toBe(true);
    expect(identity.equals(user1,user2)).toBe(false);
    expect(identity.equals(user2,user2)).toBe(true);
  });

});
