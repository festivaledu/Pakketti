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
const Path = require('path');
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
const controllers = require("./controllers_new");
const url = require('url');
const serveStatic = require("serve-static");
const httpStatus = require("http-status");

if (env !== "production") {
httpServer.use(morgan("\x1b[34m[INFO]\x1b[0m [:date[iso]] :remote-addr \":method :url HTTP/:http-version\" :status (:req[Content-Length]/:res[content-length] bytes)"));
}

httpServer.use(cors());
httpServer.use(bodyParser.json());
httpServer.use(cookieParser());
httpServer.use(fileupload());

// API Route
httpServer.use("/api", (req, res, next) => {
	req.models = db.models;
	return next();
});
httpServer.use("/api", controllers);

// Files Route
httpServer.use("/files", async (req, res, next) => {	
	const serve = serveStatic(Path.join(__dirname, "../files"));
	
	if (fs.existsSync(Path.join(__dirname, "..", req._parsedUrl.path))) {
		let packageVersionObj = await db.models.PackageVersion.findOne({
			where: {
				filename: req._parsedUrl.path
			}
		});
		
		if (packageVersionObj) {
			packageVersionObj.increment("downloadCount");
		}
		
		return serve(req, res);
	} else {
		return res.status(httpStatus.NOT_FOUND).send({
			error: {
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: "File not found"
			}
		});
	}
});

// Media Route
httpServer.use("/media/:category/:mediaId", (req, res, next) => {
	switch (req.params.category) {
		case "avatar":
			res.redirect(url.format({
				pathname: "/api/account/avatar",
				query: {
					"account.id": req.params.mediaId
				}
			}));
			break;
		case "icon":
			res.redirect(url.format({
				pathname: "/api/packages/icon",
				query: {
					"package.id": req.params.mediaId
				}
			}));
			break;
		case "hero":
			res.redirect(url.format({
				pathname: "/api/packages/hero",
				query: {
					"package.id": req.params.mediaId
				}
			}));
			break;
		case "screenshot":
			res.redirect(url.format({
				pathname: "/api/packages/screenshot",
				query: {
					"screenshot.id": req.params.mediaId
				}
			}));
			break;
		default: break;
	}
	// res.status(200).send("OK");
});

httpServer.listen(process.env.SERVER_PORT, () => {
	console.log(`\x1b[34m[INFO]\x1b[0m Server is up on port ${process.env.SERVER_PORT}`);
});

//#region WebSocket Testing Area
const WebSocketServer = require("./helpers/WebSocketServer");
const socketServer = WebSocketServer(db.models);
//#endregion