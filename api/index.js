require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");

//#region Database Setup
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const models = require("./models");
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const db = {};
//#endregion

//#region Database Seed
//#endregion

const httpServer = express();
const controllers = require("./controllers");

httpServer.use(morgan("\x1b[34m[INFO]\x1b[0m [:date[iso]] :remote-addr \":method :url HTTP/:http-version\" :status (:res[content-length] bytes)"));

httpServer.use(cors());
httpServer.use(bodyParser.json());
httpServer.use(cookieParser());
httpServer.use(fileupload());

httpServer.use(controllers);

httpServer.listen(process.env.SERVER_PORT, () => {
	console.log(`\x1b[34m[INFO]\x1b[0m Server is up on port ${process.env.SERVER_PORT}`);
});