const express = require("express");
const blogController = require("../controllers/blogpost");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// Create a blog post (Authenticated users only)
router.post("/add", verify, blogController.addPost);

// Get all blog posts (Public)
router.get("/all", blogController.getAllPosts);

// Get a single blog post by ID (Public)
router.get("/:id", blogController.getPostById);

// Update a blog post (Only the author can update)
router.patch("/update/:id", verify, blogController.updatePost);

// Delete a blog post (Only the author or admin can delete)
router.delete("/delete/:id", verify, blogController.deletePost);

// Admin: Delete any post
router.delete("/admin/delete/:id", verify, verifyAdmin, blogController.adminDeletePost);

// Add a comment (Authenticated users only)
router.patch("/addComment/:postId", verify, blogController.addPostComment);

// Get comments for a specific post (Public access)
router.get("/getComments/:postId", blogController.getPostComments);

// Admin: Remove a comment
router.delete("/deleteComment/:postId/:commentId", verify, verifyAdmin, blogController.adminRemoveComment);

module.exports = router;
