const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports.createAccessToken = (user) => {

	//Payload/Data from the user
	const data = {
		id: user.id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	console.log(data) //can see in terminal
	
	//Generates the token through the sign() method
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {
		expiresIn: "1d"  //expires in one day
		//if "30s" -30 seconds
		//"1m" - 1 minute
		//"1h" - 1 hour
	})
}


//Verify if token is valid

module.exports.verify = (req, res, next) => {

	console.log("REQ HEADERS: ", req.headers.authorization);

	let token = req.headers.authorization

	if(typeof token === "undefined") {
		return res.send({ auth: "Failed. No Token"});
	} else {
		console.log(token);
		// To remove the "Bearer" prefix
		token = token.slice(7, token.length); //first seven characters
		console.log(token);

		//Verify method to verify token by comparing JWT SECRET KEY if match
		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err,
			decodedToken) {

			if(err){
				return res.send({
					auth: "Failed",
					message: err.message
				})
			} else {
				console.log("Result from verify method: ")
				console.log(decodedToken)

				// Assigns the user with the values from the decodedToken
				req.user = decodedToken;
				next();  //para magnext sa next middleware
			}
		})
	}
}


//

module.exports.verifyAdmin = (req, res, next) => {
	
	console.log("Result from verifyAdmin: ", req.user);

	if(req.user.isAdmin){
		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}


//Error Handler
module.exports.errorHandler = (err, req, res, next) => {

	console.log(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || "Internal Server Error";
	//same with res.send but in json format
	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || "SERVER_ERROR",
			details: err.details || null
		}
	})
}



module.exports.isLoggedIn = (req, res, next) => {
	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}
}