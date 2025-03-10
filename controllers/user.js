const bcrypt = require('bcrypt');
const User = require("../models/User");

const auth = require("../auth");
const { errorHandler } = auth;

module.exports.registerUser = (req, res) => {
    // Validate input
    if (!req.body.username || req.body.username.trim() === "") {
        return res.status(400).send({ error: "Username is required" });
    } else if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: "Email invalid" });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters" });
    }

    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    });

    return newUser.save()
        .then(() => res.status(201).send({ message: "Registered Successfully" }))
        .catch(err => {
            console.error("Error in saving: ", err);
            return res.status(500).send({ error: "Error in save" });
        });
};

module.exports.loginUser = (req, res) => {
    return User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: "No Email Found" });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({ access: auth.createAccessToken(user) });
                } else {
                    return res.status(401).send({ message: "Email and password do not match" });
                }
            }
        })
        .catch(err => errorHandler(err, req, res));
};

// Retrieve user details
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            } else {
                return res.status(200).send({
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        isAdmin: user.isAdmin
                    }
                });
            }
        })
        .catch(error => errorHandler(error, req, res));
};
