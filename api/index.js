require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const { UserRole, LogItemType } = require("./helpers/Enumerations");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

//#region Database Setup
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const models = require("./models");
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

sequelize.query = function() {
	return Sequelize.prototype.query.apply(this, arguments).catch(err => {
		console.log(err.message);
	});
}

db.models = {};
Object.keys(models).forEach(model => {
	// sequelize['import'](model);
	db.models[model] = models[model](sequelize, Sequelize);
});

Object.keys(db.models).forEach(modelName => {
	if (db.models[modelName].associate) {
		db.models[modelName].associate(db.models);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
//#endregion

//#region Database Seed
db.sequelize.sync({
	force: env === "development"
}).then(() => {
	db.models.Account.findOrCreate({
		where: {
			role: UserRole.ROOT
		},
		defaults: {
			id: 0,
			username: process.env.ROOT_USER,
			email: process.env.ROOT_MAIL,
			password: bcrypt.hashSync(crypto.SHA512(process.env.ROOT_PASS).toString(crypto.enc.Hex), bcrypt.genSaltSync(10))
		}
	}).then(([accountObj, created]) => {
		if (created) console.log("\x1b[34m[INFO]\x1b[0m Created root account");
		
		db.models.LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.API_STARTUP,
			accountId: accountObj.id,
			detailText: `The API has finished startup at ${new Date().toISOString()}`,
			status: 2
		});
	});
});
//#endregion

const httpServer = express();
const controllers = require("./controllers");

httpServer.use(morgan("\x1b[34m[INFO]\x1b[0m [:date[iso]] :remote-addr \":method :url HTTP/:http-version\" :status (:req[Content-Length]/:res[content-length] bytes)"));

httpServer.use(cors());
httpServer.use(bodyParser.json());
httpServer.use(cookieParser());
httpServer.use(fileupload());

httpServer.use("/api", (req, res, next) => {
	req.models = db.models;
	return next();
});
httpServer.use("/api", controllers);

httpServer.listen(process.env.SERVER_PORT, () => {
	console.log(`\x1b[34m[INFO]\x1b[0m Server is up on port ${process.env.SERVER_PORT}`);
});