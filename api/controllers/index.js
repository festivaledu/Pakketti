const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");

/**
 * Make every route use the AuthHelper before reaching their logic to inject a User's account into the Request object
 */
router.use("/", require("../helpers/AuthHelper"));

/**
 * Additional Routes
 */
fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && ((file.slice(-3) === '.js' | fs.lstatSync(path.join(__dirname, file)).isDirectory()));
	})
	.forEach(file => {
		const _basename = path.basename(file, ".js");
		router.use(`/${_basename.toLowerCase()}`, require(path.join(__dirname, file)));
	});

module.exports = router;