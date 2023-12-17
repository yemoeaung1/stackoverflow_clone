// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

const bcrypt = require("bcrypt");
const saltRounds = 10;

let userArgs = process.argv.slice(2);

// Verify that the first argument is a proper email

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

if (!isValidEmail(userArgs[0])) {
    console.log('ERROR: You need to specify a valid EMAIL as the first argument');
    return;
}

if(userArgs.length < 2){
  console.log('ERROR: You need to specify both an email and password');
  return;
}

let User = require('./models/users.js');
let Tag = require('./models/tags');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let Comment = require('./models/comments.js');

const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function userCreate(username, email, password, reputation, registerDate){

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const pwHash = await bcrypt.hash(password, salt);

    let userDetail = {
      username: username,
      email: email,
      passwordHash: pwHash,
      reputation: reputation,
      questionsAsked: [],
      tagsCreated: [],
      questionsAnswered: [],
      comments: [],
      registerDate: registerDate,
    }

    let user = new User(userDetail);
    return user.save();

  } catch (err) {
    console.log(`Error saving user: ${err}`);
    return;
  }
}

async function tagCreate(name, owner) {
  let tag = new Tag({ name: name });
  tag.save()
  
  await User.findByIdAndUpdate(owner, { $push: { tagsCreated: tag } });

  return tag;
}

async function commentCreate(text, commented_by, votes, comment_date_time){
  let commentDetail = {
    text: text,
    commented_by: commented_by,
    votes: votes,
    comment_date_time: comment_date_time
  }

  let comment = new Comment(commentDetail);
  comment.save();

  await User.findByIdAndUpdate(commented_by, { $push: { comments: comment } });

  return comment;
}

async function answerCreate(text, ans_by, ans_date_time, comments, votes) {
  
  let ansDetail = {
    text: text,
    ans_by: ans_by,
    ans_date_time: ans_date_time,
    comments: comments,
    votes: votes,
  }

  let answer = new Answer(ansDetail);

  return answer.save();
}

async function questionCreate(title, text, summary, tags, asked_by, ask_date_time, views, votes, comments) {
  qstndetail = {
    title: title,
    text: text,
    summary: summary,
    tags: tags,
    answers: [],
    asked_by: asked_by,
    ask_date_time: ask_date_time,
    views: views,
    votes: votes,
    comments: comments,
  }

  let qstn = new Question(qstndetail);
  qstn.save();

  await User.findByIdAndUpdate(asked_by, { $push: { questionsAsked: qstn } });

  return qstn;
}

async function addAnswers2Question(question, answers){
  let qstn = await Question.findByIdAndUpdate(question, { $set: { answers: answers } });
  for(let i = 0; i < answers.length; i++){
    await User.findByIdAndUpdate(answers[i].ans_by, { $push: { questionsAnswered: qstn } })
  }
}

async function generateAdmin(email, password, defaultAdmin = false){
  const salt = await bcrypt.genSalt(saltRounds);
  const pwHash = await bcrypt.hash(password, salt);
  
  let userDetail = {
    email: email,
    passwordHash: pwHash,
    reputation: 0,
    questionsAsked: [],
    tagsCreated: [],
    questionsAnswered: [],
    comments: [],
    isAdmin: true,
    registerDate: new Date(Date.now()),
  }

  if(defaultAdmin)
    userDetail.username = "ADMIN";
  else
    userDetail.username = email.substring(0, email.indexOf('@'));

  let user = new User(userDetail);
  return user.save();
}

const populate = async () => {
  generateAdmin("ADMIN", "ADMIN", true);
  generateAdmin(userArgs[0], userArgs[1]);

  let u1 = await userCreate("Manic Penguin", "jafar2000@co.uk", "Dogs2000Eggs", 50, new Date('December 24, 2022 13:05:41'));
  let u2 = await userCreate("John Doe", "johndoe@gmail.com", "JohnRed11172021", 1000, new Date('November 17, 2021 03:24:35'));
  let u3 = await userCreate("Genius 10/10", "genius100@yahoo.com", "IAMAGENIUS", -25, new Date('December 1, 2023 21:00:00'));
  let u4 = await userCreate("Abigail Williams", "abigail.w@aol.com", "abby1980", 40, new Date('January 25, 2023 05:21:19'));
  let u5 = await userCreate("NewUser8798156412", "john.smith2005@gmail.com", "JSmith2005", 1000, new Date(Date.now()));

  let t1 = await tagCreate('android-studio', u1);
  let t2 = await tagCreate('shared-preferences', u1);
  let t3 = await tagCreate('javascript', u2);
  let t4 = await tagCreate('react', u2);
  let t5 = await tagCreate('node', u2);
  let t6 = await tagCreate('express', u2);
  let t7 = await tagCreate('gaming', u2);
  let t8 = await tagCreate('quickhelp', u2);

  // let c1 = await commentCreate();
  // let c2 = await commentCreate();
  // let c3 = await commentCreate();
  // let c4 = await commentCreate();
  // let c5 = await commentCreate();
  // let c6 = await commentCreate();
  // let c7 = await commentCreate();
  // let c8 = await commentCreate();

  // text, ans_by, ans_date_time, comments, votes

  let a1 = await answerCreate(
    'Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.',
    u2, new Date(Date.now()), [], 52);
  let a2 = await answerCreate(
    'YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);',
    u4, new Date(Date.now()), [], 12);
  let a3 = await answerCreate(
    'I just found all the above examples just too confusing, so I wrote my own. ',
    u3, new Date(Date.now()), [], 0);
  let a4 = await answerCreate(
    'React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.',
    u2, new Date(Date.now()), [], 17);
  let a5 = await answerCreate(
    'On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.',
    u1, new Date(Date.now()), [], 5);
  
  //title, text, summary, tags, asked_by, ask_date_time, views, comments

  let q1 = await questionCreate(
    'Title',
    'Text',
    'Summary',
    [], u1, new Date(), 0, 0, []);

  let q2 = await questionCreate(
    'android studio help',
    'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.',
    'android studio save string shared preference, start activity and load the saved string', 
    [t1, t2, t3], u1, new Date('February 22, 2023 15:41:11'), 121, 18, []);

  await addAnswers2Question(q2, [a1, a2, a3]);

  let q3 = await questionCreate(
    'Programmatically navigate using React router',
    'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.',
    'No Summary',
    [t3, t4], u4, new Date('August 13, 2023 09:13:05'), 59, 7, []);

  await addAnswers2Question(q3, [a4, a5]);
    

  if(db) db.close();
  console.log('done');
}

// function clearDB(){
//   User.deleteMany({});
//   Comment.deleteMany({});
//   Tag.deleteMany({});
//   Answer.deleteMany({});
//   Question.deleteMany({});
// }

// clearDB();

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');