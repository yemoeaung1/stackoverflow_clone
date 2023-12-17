// Answer Document Schema
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxLength: 140 },
  commented_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  votes: { type: Number, default: 0 },
  comment_date_time: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Comment", CommentSchema);
