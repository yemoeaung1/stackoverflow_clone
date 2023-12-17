// Application server
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

//schemas
const Question = require("./models/questions.js");
const Tag = require("./models/tags.js");
const Answer = require("./models/answers.js");
const User = require("./models/users.js");
const Comment = require("./models/comments.js");

db.on("error", console.error.bind(console, "MongoDB connection error"));

/* express */
const app = express();
const port = 8000;
const store = new session.MemoryStore();

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: `blah`,
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
      httpOnly: true,
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with the actual origin of your frontend
    credentials: true,
  })
);

/* password hashing */
const saltRounds = 10;

app.use((req, res, next) => {
  // console.log(`Method: ${req.method}   URL: ${req.url} \n`);
  // console.log("Sessions stored:" + JSON.stringify(store));
  next();
});

/*make sure to persist middleware */
const isAuthenticated = (req, res, next) => {
  const sessionId = req.sessionID;
  console.log("===New Call===")
  console.log("Store" + JSON.stringify(store) + "\n");
  console.log("Session body: " + JSON.stringify(req.session))
  // console.log("In Authenticated");
  console.log("session ID from cookie:", sessionId);
  req.sessionStore.get(sessionId, (err, sessionData) => {
    if (err) {
      console.error("Error retrieving session data:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("found session data" + JSON.stringify(sessionData));
      if (sessionData && sessionData.authenticated) {
        // User is authenticated, proceed to the next middleware or route handler
        req.user = sessionData.user; // Attach user data to the request
        next();
      } else {
        // User is not authenticated, send an unauthorized response
        res.status(401).json({ msg: "Not authenticated" });
      }
    }
  });
};

app.post("/posts/question/:id/answerform", isAuthenticated, async (req, res) => {
  console.log("In answer form route: " + JSON.stringify(req.body))
  console.log("In session object: " + JSON.stringify(req.session))
  try {
    const qId = req.params.id;

    const { answer } = req.body;
    const user = await checkForUser(req.user.email);
    if(user === null) {
      res.status(404).json("User not found")
    } else {
      const newAnswer = new Answer({
        text: answer.text,
        ans_by: user._id,
        ans_date_time: answer.ans_date_time,
        comments:[],
      });
      console.log(newAnswer);
      // console.log(qId);
      await newAnswer.save();

      const updatedQuestion = await Question.findOneAndUpdate(
        { _id: qId },
        { $push: { answers: newAnswer._id } }
      ).populate("asked_by").exec();

      res.json(updatedQuestion)
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/posts/question/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;

  console.log(`Comment ${req.body.comment} for question ${id}`);
  try {
    const { comment } = req.body;
    console.log(comment);
    const user = await checkForUser(req.user.email);
    if(user === null) {
      res.status(404).json("User not found")
    } else {
      const newComment = new Comment({
        text: comment,
        commented_by: user._id,
      });
      console.log(newComment);
      // console.log(qId);
      await newComment.save();

      const updatedQuestion = await Question.findOneAndUpdate(
        { _id: id },
        { $push: { comments: newComment._id } }
      ).populate("tags").populate({
        path: 'comments',
        populate: {
          path: 'commented_by'
        }
      }).exec();

      console.log(updatedQuestion)

      res.json(updatedQuestion)
    }
  } catch (error) {
    console.error(error);
  }
})

/* get user route */
app.get("/user", isAuthenticated, (req, res) => {
  console.log("user", JSON.stringify(req.user));
  res.json({ AuthenticatedUser: req.user });
});

app.get("/users", async (req, res) => {
  let userData = await User.find({});
  console.log(userData);
  res.send(userData);
});


app.get("/user/:email", async (req, res) => {
  let userData = await User.find({email: req.params.email});
  res.send(userData[0]);
})

app.get("/user/:email/tags", async (req, res) => {
  let userData = await User.find({email: req.params.email});

  const resArr = [];

  let tArr = userData[0].tagsCreated;
  for(let i = 0; i < tArr.length; i++){
    let tag = await Tag.findById(tArr[i]);
    resArr.push(tag);
  }
  res.send(resArr);
})

app.get("/user/:email/questions", async (req, res) => {
  let userData = await User.find({email: req.params.email});

  const resArr = [];

  let qArr = userData[0].questionsAsked;
  for(let i = 0; i < qArr.length; i++){
    let question = await Question.findById(qArr[i]).populate("asked_by").populate("comments").exec();
    resArr.push(question);
  }
  res.send(resArr);
})

/* deleting and editing components */
app.post("/delete/tag/:id", async (req, res) => {
  try{
    let tag = await Tag.findByIdAndDelete(req.params.id);
    // Delete from Users.tagsCreated
    await User.findOneAndUpdate({ tagsCreated: tag._id }, {$pull: { tagsCreated: tag._id }});
    // Delete from Questions.tags
    await Question.findOneAndUpdate({ tags: tag._id }, {$pull: { tags: tag._id }});

    res.send("SUCCESS");
  } catch (err) {
    res.status(404).send("Delete Tag ERROR: " + err);
  }
});

app.post("/edit/tag/:id/:name", async (req, res) => {
  try{
    let existingTag = await Tag.findOne({name: req.params.name});
    if(existingTag === undefined || existingTag === null){
      let tag = await Tag.findByIdAndUpdate(req.params.id, {$set:{name : req.params.name}});
      res.send("SUCCESS");
    }
    else{
      console.log("FOUND EXISTING TAG");
      // If preexisting tag exists:
      // Delete tag from tagsCreated in User Schema
      // Replace tag from tags in Question Schema
      await User.findOneAndUpdate({ tagsCreated: req.params.id }, {$pull: { tagsCreated: req.params.id }});
      await Question.updateMany({ tags: req.params.id }, {$set: {'tags.$': existingTag._id}})
      await Tag.findByIdAndDelete(req.params.id);
      res.send("MERGE");
    }
  } catch (err) {
    res.status(404).send("Edit Tag ERROR: " + err);
  }

});

app.post("/delete/question/:id", async (req, res) => {
  try{
    let question = await Question.findByIdAndDelete(req.params.id).populate("asked_by").exec();

    // Deletes associated comments with to the question
    for(let i = 0; i < question.comments.length; i++){
      await Comment.findByIdAndDelete(question.comments[i]._id);
    }

    // Delete from Users.questionsAsked
    await User.findOneAndUpdate({ questionsAsked: question._id }, {$pull: { questionsAsked: question._id }});
    
    for(let i = 0; i < question.answers.length; i++){
      let answer = await Answer.findByIdAndDelete(question.answers[i]._id).populate("ans_by").exec();
      for(let j = 0; j < answer.comments.length; j++){
        await Comment.findByIdAndDelete(answer.comments[j]._id).populate("commented_by").exec();
      }
    }

    res.send("SUCCESS");
  } catch (err) {
    res.status(404).send("Delete Question ERROR: " + err);
  }
});

app.post("/edit/question/:id", () => {

  res.send("SUCCESS");
});

app.post("/delete/user/:id", async (req, res) => {
  // DELETE User, Comments, Answers, Questions
  try{
    let user = await User.findByIdAndDelete(req.params.id);

    while(true){
      let answer = await Answer.findOneAndDelete({ans_by: req.params.id});

      if(answer === undefined || answer === null)
        break;

      for(let i = 0; answer.comments !== undefined && i < answer.comments.length; i++){
        await Comment.findByIdAndDelete(answer.comments[i]);
      }

      await Question.findOneAndUpdate({answers: answer._id}, { $pull: {answers: answer._id} })
    }

    for(let i = 0; i < user.questionsAsked.length; i++){
      let question = await Question.findByIdAndDelete(user.questionsAsked[i]);

      if(question === undefined || question === null)
        continue;

      for(let j = 0; question.comments !== undefined && j < question.comments.length; j++)
        await Comment.findByIdAndDelete(question.comments[j]);

      for(let j = 0; question.answers !== undefined && j < question.answers.length; j++){
        let answer = Answer.findByIdAndDelete(question.answers[j]);

        if(answer === undefined || answer === null)
          continue;

        for(let k = 0; answer.comments !== undefined && k < answer.comments.length; k++)
          await Comment.findByIdAndDelete(answer.comments[k]);
      }
    }

    while(true){
      let findStatus = await Comment.findOneAndDelete({commented_by: req.params.id});

      if(findStatus === undefined || findStatus === null)
        break;

      await Answer.findOneAndDelete({comments: findStatus._id});
      await Question.findOneAndDelete({comments: findStatus._id});

    }
    res.send("SUCCESS");
  } catch (err) {
    console.log(err);
    res.status(404).send("User Delete ERROR: " + err);
  }

});

/* login route */
app.post("/login", async (req, res) => {
  console.log(`Session ID after logging in:` + req.sessionID);
  console.log(`Incoming request body ${JSON.stringify(req.body)}`);
  const { email, password } = req.body;
  if (email && password) {
    const user = await checkForUser(email);
    console.log(user);
    if (user !== null) {
      const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
      console.log("Is password correct?: " + passwordCorrect);
      if (passwordCorrect) {
        req.session.authenticated=true
        req.session.user = {
          email,
        };
        res.json({ msg: "Succcessful log in ", user: req.session.user });
      } else {
        res.status(403).json({ msg: "Incorrect Password or Username" });
      }
    } else {
      res.status(403).json({ msg: "Bad Credentials" }); //user doesn't exist
    }
  } else {
    res.status(403).json({ msg: "Bad Credentials" });
  }
});

/* get question route */
app.get("/questions", async (req, res) => {
  // console.log(
  //   "Session from questions:" +
  //     JSON.stringify(req.session.authenticated) +
  //     "\n"
  // );
  // const questions = await Question.find({}).populate("asked_by").exec();
  const questions = await Question.find({}).populate("tags").populate("asked_by").exec();
  res.send(questions);
});

/* logout route */
app.delete("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Clear session-related cookies on the client
      // res.clearCookie("connect.sid");
      console.log(req.sessionID);
      // res.clearCookie("connect.sid");
      res.status(200).send("Logout successful");
    }
  })
});

/* register route */
app.post("/register", async (req, res) => {
  console.log("Coming to register: ", req.body);
  const exisitingUser = await checkForUser(req.body.email);
  console.log(exisitingUser);
  if (exisitingUser === null) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const pwHash = await bcrypt.hash(req.body.password, salt);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        passwordHash: pwHash,
        registerDate: Date.now(),
      });
      const savedUser = await newUser.save();
      console.log(`user created: ${JSON.stringify(newUser)}`);
      res.status(200).json({ msg: "Success registering" });
    } catch (err) {
      console.log(`Error saving user: ${err}`);
    }
  } else {
    res
      .status(403)
      .json({ msg: "Email has previously been used to make an account." });
  }
});

async function checkForUser(email) {
  const targetUser = await User.findOne({
    email: email,
  });
  // console.log(targetUser);
  return targetUser;
}

app.get("/tags", async (req, res) => {
  const tags = await Tag.find({});
  res.send(tags);
});

app.post("/questionform", async (req, res) => {
  try {
    const { question } = req.body;
    console.log(JSON.stringify(question));
    const user = await checkForUser(question.userEmail)
    const tags = await getQuestionTags(question.tags, user)
    console.log(JSON.stringify(question));
    if(tags === null) {
      res.status(404).json({msg: "You don't have enough rp to make tags"})
    } else {
      const newQuestion = new Question({
        title: question.title,
        summary: question.summary,
        text: question.text,
        tags:tags,
        answers: question.ansIds,
        asked_by: user._id,
        ask_date_time: question.askDate,
        views: question.views,
        comments: []
      });

      const savedNewQuestion = await newQuestion.save();
      const updateUser = await User.findOneAndUpdate({ username: user.username}, {$push: {questionsAsked : savedNewQuestion._id}})
      res.redirect("/questions");
    }
  } catch (err) {
    console.log(err);
  }
});


app.get("/posts/question/:id", async (req, res) => {
  try {
    const qId = req.params.id;
    // const question = await Question.findById(qId);
    const question = await Question.findOneAndUpdate(
      { _id: qId },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("tags").populate("asked_by")
    .populate({
      path: 'comments',
      populate: {
        path: 'commented_by'
      }
    })
    .exec();
    if (!question) {
      return res.status(404).send("Question not found");
    }
    // question.views +=1;
    console.log(question);
    res.send(question);
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/question/:id/answerform", async (req, res) => {
  try {
    const qId = req.params.id;
    const question = await Question.findById(qId).populate("asked_by").exec();
    if (!question) {
      return res.status(404).send("Question not found");
    }
    res.send(question);
  } catch (err) {
    console.log(err);
  }
});


app.get("/posts/question/:id/:vote", isAuthenticated, async (req, res) => {
  try {
    const requestedUser = req.user;
    const type = req.params.vote;
    const qId = req.params.id;
    console.log("vote type:" +1 + "qId: " + qId)
    let question;
    let user = await User.findOne({email: requestedUser.email});
    // console.log("User voting: "+ user);
    if(!user) {
      return res.status(404).send("User not found");
    } else {
      if(user.reputation < 50 && user.isAdmin==false) {
        return res.status(403).send("cannot vote");
      } else {
        if(type === '1') {
          question = await Question.findOneAndUpdate( {_id:qId}, {$inc: {votes: 1}}).populate("asked_by").exec();
          console.log("Question:" + JSON.stringify(question));
          usertoUpdateRep = await User.findOne({username: question.asked_by.username})
          console.log("User found: " + usertoUpdateRep)
          console.log(usertoUpdateRep.reputation);
          return res.status(200).send("Successfully voted");
        } else if (type === '-1') {
          question = await Question.findOneAndUpdate( {_id:qId}, {$inc: {votes: -1}}).populate("asked_by").exec();
          console.log("Question voted on: " + question);
          usertoUpdateRep = await User.findOneAndUpdate({username: question.asked_by}, {$inc: {reputation: -10}})
          return res.status(201).send("Successfully voted");
        } 
        if (!question) {
          return res.status(404).send("Question not found");
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/answer/:id", async (req, res) => {
  try {
    const aId = req.params.id;
    const answer = await Answer.findById(aId).populate("ans_by").exec();
    if (!answer) {
      return res.status(404).send("Answer not found");
    }
    res.send(answer);
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/answer/:id/:vote", isAuthenticated, async (req, res) => {
  try {
    const requestedUser = req.user;
    const type = req.params.vote;
    const aId = req.params.id;
    console.log("vote type:" +1 + "aId: " + aId)
    let answer;
    let user = await User.findOne({email: requestedUser.email});
    if(!user) {
      return res.status(404).send("User not found");
    } else {
      if(user.reputation < 50 && user.isAdmin==false) {
        return res.status(403).send("cannot vote");
      } else {
        if(type === '1') {
          answer = await Answer.findOneAndUpdate( {_id:aId}, {$inc: {votes: 1}}).populate("ans_by").exec();
          usertoUpdateRep = await User.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: 5}})
          return res.status(200).send("Successfully voted");
        } else if (type === '-1') {
          answer = await Answer.findOneAndUpdate( {_id:aId}, {$inc: {votes: -1}}).populate("ans_by").exec();
          usertoUpdateRep = await User.findOneAndUpdate({username: answer.ans_by}, {$inc: {reputation: -10}})
          return res.status(201).send("Successfully voted");
        } 
        if (!answer) {
          return res.status(404).send("Answer not found");
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/comment/:id/:vote", isAuthenticated, async (req, res) => {
  try {
    const requestedUser = req.user;
    const type = req.params.vote;
    const cId = req.params.id;
    console.log("vote type:" + type + "cId: " + cId)
    let answer;
    let user = await User.findOne({email: requestedUser.email});
    if(!user) {
      return res.status(404).send("User not found");
    } else {
      if(user.reputation < 50 && user.isAdmin==false) {
        return res.status(403).send("cannot vote");
      } else {
        if(type === '1') {
          comment = await Comment.findOneAndUpdate( {_id:cId}, {$inc: {votes: 1}}).populate("commented_by").exec();
          usertoUpdateRep = await User.findOneAndUpdate({username: comment.commented_by}, {$inc: {reputation: 5}})
          return res.status(200).send("Successfully voted");
        } else if (type === '-1') {
          comment = await Comment.findOneAndUpdate( {_id:aId}, {$inc: {votes: -1}}).populate("commented_by").exec();
          usertoUpdateRep = await User.findOneAndUpdate({username: comment.ans_by}, {$inc: {reputation: -10}})
          return res.status(201).send("Successfully voted");
        } 
        if (!answer) {
          return res.status(404).send("Answer not found");
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/tag/:id", async (req, res) => {
  console.log("Tag Search Post");
  try {
    const tid = req.params.id;
    const tag = await Tag.findById(tid);
    const qArr = await Question.find({ tags: tid }).populate("asked_by").exec() ;

    res.send({ tag: tag, qArr: qArr });
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/question/:qid/tag/:tid",isAuthenticated, async(req, res) => {
  try {
    const tid = req.params.tid;
    const qid = req.params.qid;
    const tag = await Tag.find({_id: tid}).exec();
    res.send(tag);
  } catch (err) {
    console.log(err);
  }
})

const server = app.listen(port, () => {
  console.log(`APP listening on port ${port}`);
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await db.close();
    console.log("Server closed. Database instance disconnected");
  });
});
process.on("SIGINT", () => {
  server.close(async () => {
    await db.close();
    console.log("Server closed. Database instance disconnected");
  });
});

async function getQuestionTags(tagsArr,user) {
  let questiontags = [];
  const DBTags = await Tag.find({});
  // console.log(DBTags);
  for (let tag of tagsArr) {
    const existingTag = DBTags.find((DBTag) => DBTag.name === tag);

    if (existingTag) questiontags.push(existingTag._id);
    else {
      //check if user has at least 50 rp
      if(user.reputation >= 50 || user.isAdmin) {
        const newTagId = await addTagtoDB(tag);
        questiontags.push(newTagId);
        const updateUserCreatedTags = await User.findOneAndUpdate ({ username: user.username}, {$push: {tagsCreated : newTagId}});
      } else {
        return null;
      }
    }
  }
  return questiontags;
}


async function addTagtoDB(tag) {
  let newTag = new Tag({
    name: tag,
  });
  await newTag.save();
  return newTag._id;
}
