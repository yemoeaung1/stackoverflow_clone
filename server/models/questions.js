// Question Document Schema
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 50 },
  text: { type: String, required: true },
  summary: {type: String, required: true, maxLength:140},
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
  asked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ask_date_time: { type: Date, default: new Date()},
  views: { type: Number, min: 0, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  votes: {type:Number, default: 0},
});

// Virtual for book's URL
QuestionSchema.virtual("url").get(function () {
  return "/posts/question/" + this._id;
});

module.exports = mongoose.model("Question", QuestionSchema);
