const express = require("express");

const userController = require("../controllers/user");
const { verify, isLoggedIn } = require("../auth");
const router = express.Router();


// Route for user registration
router.post("/register", userController.registerUser);

// Route for user authentication
router.post("/login", userController.loginUser);

//Route for retrieving user details
router.get("/details", verify, userController.getProfile);


module.exports = router;