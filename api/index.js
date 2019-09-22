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
const config = require('./config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, config);
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
	// force: env === "development"
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

//#region HTTP Server
const httpServer = express();
const controllers = require("./controllers");
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
if (!process.argv.includes("--no-api")) {
httpServer.use("/api", (req, res, next) => {
	req.models = db.models;
	return next();
});
httpServer.use("/api", controllers);
} else {
	console.log("\x1b[33m[WARN]\x1b[0m '--no-api' is set, not serving '/api'");
}

// Files Route
if (!process.argv.includes("--no-static")) {
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
				
				db.models.LogItem.create({
					id: String.prototype.concat(new Date().getTime, Math.random()),
					type: LogItemType.VERSION_DOWNLOADED,
					affectedPackageId: packageVersionObj.packageId,
					affectedPackageVersionId: packageVersionObj.id,
					detailText: `Package version ${packageVersionObj.version} <${packageVersionObj.id}> has been downloaded`,
					status: LogItemStatus.LOG_USAGE
				});
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
});
} else {
	console.log("\x1b[33m[WARN]\x1b[0m '--no-static' is set, not serving static routes");
}

if (!process.argv.includes("--no-dashboard")) {
	httpServer.use("/dashboard", serveStatic(Path.join(__dirname, "../manager/dist")));
} else {
	console.log("\x1b[33m[WARN]\x1b[0m  '--no-dashboard' is set, not serving Dashboard (/dashboard)");
}

if (!process.argv.includes("--no-storefront")) {
	httpServer.use("/", serveStatic(Path.join(__dirname, "../storefront/dist")));
} else {
	console.log("\x1b[33m[WARN]\x1b[0m '--no-storefront' is set, not serving Storefront (/)");
}
//#endregion

//#region APT/Cydia endpoints
const { Bzip2, Stream } = require("compressjs");

const repoInfo = require('./config.json').repoInfo;
const getPackages = async (platform) => {
	let packageList = await db.models.Package.findAll({
		where: {
			platform: platform,
			visible: true
		},
		include: [{
			model: db.models.PackageVersion,
			as: "versions",
			where: { visible: true },
			separate: true,
			order: [["createdAt", "DESC"]]
		}]
	});
	
	let packages = packageList.map(async packageObj => {
		let accountData = await db.models.Account.findOne({
			where: { id: packageObj.accountId }
		});
		
		let entries = packageObj.versions.map(versionObj => {
			let keys = JSON.parse(JSON.stringify({
				"Package": packageObj.identifier,
				"Name": packageObj.name,
				"Depiction": `${process.env.BASE_URL}/package/${packageObj.identifier}`,
				"Description": packageObj.shortDescription,
				"Version": versionObj.version,
				"Author": `${accountData.username} <${accountData.email}>`,
				"Maintainer": `${accountData.username} <${accountData.email}>`,
				"Architecture": packageObj.architecture,
				"Depends": Object.keys(versionObj.depends || {}).map(key => {
					return key + (versionObj.depends[key] !== true ? ` (${versionObj.depends[key]})` : "")
				}).join(", "),
				"Conflicts": Object.keys(versionObj.conflicts || {}).map(key => {
					return key + (versionObj.depends[key] !== true ? ` (${versionObj.depends[key]})` : "")
				}).join(", "),
				"Filename": versionObj.filename,
				"MD5Sum": versionObj.md5Sum,
				"SHA1": versionObj.sha1,
				"SHA256": versionObj.sha256,
				"Section": packageObj.section,
				"Size": versionObj.size,
				"Installed-Size": versionObj.installedSize
			}));
			
			return Object.keys(keys).map(key => `${key}: ${keys[key]}`).join("\n");
		});
		
		return entries.join("\n\n");
	});
	
	return Promise.all(packages).then((packages) => {
		return packages.join("\n\n");
	});
}

httpServer.use(['/cydia/Release', '/cydia/./Release'], async (req, res) => {
	res.header("Content-Type", "text/plain");
	
	let _repoInfo = Object.keys(Object.assign(repoInfo, {
		"Architectures": "iphoneos-arm"
	})).map(key => `${key}: ${repoInfo[key]}`).join("\n");
	
	return res.status(httpStatus.OK).send(_repoInfo);
});

httpServer.use(['/cydia/Packages', '/cydia/./Packages'], async (req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.removeHeader('Content-Encoding');
	
	let packageList = await getPackages("iphoneos");
	return res.status(httpStatus.OK).send(packageList);
});

httpServer.use(['/cydia/Packages.bz2', '/cydia/./Packages.bz2'], async (req, res) => {
	res.removeHeader('Content-Encoding');
	
	let packages = await getPackages("iphoneos");
	let buffer = Buffer.from(packages, "utf8");
	
	let writable = new Stream();
	writable.buffer = Buffer.alloc(buffer.length);
	writable.pos = 0;
	writable.flush = function() {
		res.write(this.buffer, "binary");
		res.end(null, "binary");
		this.pos = 0;
	}
	writable.writeByte = function(_byte) {
		if (this.pos >= this.buffer.length) this.flush();
		this.buffer[this.pos++] = _byte;
	}
	writable.buffer.fill(0);
	
	let compressedData = await Bzip2.compressFile(buffer, writable);
});

httpServer.use(['/apt/Release', '/apt/./Release'], async (req, res) => {
	res.header("Content-Type", "text/plain");
	
	let _repoInfo = Object.keys(Object.assign(repoInfo, {
		"Architectures": "x86 x86_64 i386 amd64"
	})).map(key => `${key}: ${repoInfo[key]}`).join("\n");
	
	return res.status(httpStatus.OK).send(_repoInfo);
});

httpServer.use(['/apt/Packages', '/apt/./Packages'], async (req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.removeHeader('Content-Encoding');
	
	let packageList = await getPackages("iphoneos");
	return res.status(httpStatus.OK).send(packageList);
});

httpServer.use(['/apt/Packages.bz2', '/apt/./Packages.bz2'], async (req, res) => {
	res.removeHeader('Content-Encoding');
	
	let packages = await getPackages("iphoneos");
	let buffer = Buffer.from(packages, "utf8");
	
	let writable = new Stream();
	writable.buffer = Buffer.alloc(buffer.length);
	writable.pos = 0;
	writable.flush = function() {
		res.write(this.buffer, "binary");
		res.end(null, "binary");
		this.pos = 0;
	}
	writable.writeByte = function(_byte) {
		if (this.pos >= this.buffer.length) this.flush();
		this.buffer[this.pos++] = _byte;
}
	writable.buffer.fill(0);
	
	let compressedData = await Bzip2.compressFile(buffer, writable);
});
//#endregion

httpServer.listen(process.env.SERVER_PORT, () => {
	console.log(`\x1b[34m[INFO]\x1b[0m Server is up on port ${process.env.SERVER_PORT}`);
});

//#region WebSocket Testing Area
const WebSocketServer = require("./helpers/WebSocketServer");
const socketServer = WebSocketServer(db.models);
//#endregion