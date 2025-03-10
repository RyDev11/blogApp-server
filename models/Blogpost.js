const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,  // Reference to User Model
    ref: "User",
    required: true 
  },  
  comment: { 
    type: String, 
    required: true 
  } 
});


const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"]
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
