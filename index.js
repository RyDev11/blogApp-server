const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
require("dotenv").config();

// Routes;
const userRoutes = require("./routes/user");

const blogRoutes = require("./routes/blogpost");



const app = express();


//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));


const corsOptions = {
	
	origin: [
        "http://localhost:3000", 
        "https://blog-app-client-ryan-mislangs-projects.vercel.app"
    ], // Allow local dev + deployed frontend 

	credentials: true,

	optionsSuccessStatus: 200

}


app.use(cors(corsOptions));


mongoose.connect(process.env.MONGODB_STRING);



let db = mongoose.connection;


db.on("error", console.error.bind(console, "Connection error"));

db.once("open", () => console.log("Now connected to MongoDB Atlas"))

app.use("/users", userRoutes);


app.use("/posts", blogRoutes);



//
if(require.main === module) {
	app.listen(process.env.PORT || 4000, () => {
		console.log(`API is now online at port ${process.env.PORT || 4000}`)
	});
}

module.exports = {app, mongoose}