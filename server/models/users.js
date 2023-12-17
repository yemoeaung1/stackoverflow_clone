// Users Document Schema
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    reputation: { type: Number, default: 0 },
    questionsAsked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
    tagsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag"}],
    questionsAnswered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    }],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    isAdmin: { type: Boolean, default: false },
    registerDate: {type: Date, default: Date.now()},
  },
);

module.exports = mongoose.model("User", UserSchema);
