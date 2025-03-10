const mongoose = require("mongoose");
const BlogPost = require("../models/Blogpost");
const { errorHandler } = require("../auth");

// Create a new blog post
module.exports.addPost = (req, res) => {
    let newPost = new BlogPost({
        author: req.user.id,
        title: req.body.title.trim(),
        content: req.body.content.trim()
    });

    newPost.save()
        .then(post => res.status(201).send({ message: "Post created successfully", post }))
        .catch(err => errorHandler(err, req, res));
};

// Get all blog posts
module.exports.getAllPosts = (req, res) => {
    BlogPost.find()
        .populate("author", "username email")
        .then(posts => res.status(200).send(posts))
        .catch(err => errorHandler(err, req, res));
};

// Get a single blog post by ID
module.exports.getPostById = (req, res) => {
    BlogPost.findById(req.params.id)
        .populate("author", "username email")
        .populate("comments.user", "username email")
        .then(post => {
            if (!post) return res.status(404).send({ message: "Post not found" });
            res.status(200).send(post);
        })
        .catch(err => errorHandler(err, req, res));
};

// Update a blog post (Only author can update)
module.exports.updatePost = (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({ message: "Invalid post ID" });
    }

    BlogPost.findOneAndUpdate(
        { _id: postId, author: req.user.id },
        { $set: req.body, updatedAt: Date.now() },
        { new: true }
    )
        .then(updatedPost => {
            if (!updatedPost) {
                return res.status(403).send({ message: "Unauthorized: You can only update your own posts" });
            }
            res.status(200).send({ success: true, message: "Post updated successfully", updatedPost });
        })
        .catch(err => errorHandler(err, req, res));
};

// Delete a blog post (Only author can delete)
module.exports.deletePost = (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({ message: "Invalid post ID" });
    }

    BlogPost.findOneAndDelete({ _id: postId, author: req.user.id })
        .then(deletedPost => {
            if (!deletedPost) {
                return res.status(403).send({ message: "Unauthorized: You can only delete your own posts" });
            }
            res.status(200).send({ success: true, message: "Post deleted successfully" });
        })
        .catch(err => errorHandler(err, req, res));
};

// Admin: Delete any post
module.exports.adminDeletePost = (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).send({ message: "Invalid post ID" });
    }

    BlogPost.findByIdAndDelete(postId)
        .then(deletedPost => {
            if (!deletedPost) return res.status(404).send({ message: "Post not found" });
            res.status(200).send({ success: true, message: "Post deleted by admin successfully" });
        })
        .catch(err => errorHandler(err, req, res));
};



// Add a comment to a blog post
module.exports.addPostComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the comment to the post
    const newComment = { user: userId, comment };
    post.comments.push(newComment);

    await post.save();

    res.status(200).json({
      message: "Comment added successfully",
      updatedPost: {
        _id: post._id,
        title: post.title,
        comments: post.comments
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Retrieve comments for a specific blog post
module.exports.getPostComments = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId).lean();
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const User = require("../models/User"); // Ensure correct User model path

    // Manually fetch usernames
    const commentsWithUsernames = await Promise.all(
      post.comments.map(async (comment) => {
        const user = await User.findById(comment.user).select("username");
        return {
          userId: comment.user,
          username: user ? user.username : "Unknown",
          comment: comment.comment,
          _id: comment._id
        };
      })
    );

    res.status(200).json({ comments: commentsWithUsernames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Admin: Remove a comment from a blog post
module.exports.adminRemoveComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment by its ID
    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: "Comment removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};