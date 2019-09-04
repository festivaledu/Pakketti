const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");



/**
 * GET /packages/icon
 * 
 * Gets the icon file of a specified Package
 */
router.get("/icon", async (req, res) => {
	let query = (req.query.package || {}).filter(["id", "identifier", "name"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			},
		)
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});

	if (!packageObj.icon) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package \"${packageObj.identifier}\" does not contain any icon`
		}
	});

	res.header("Content-Type", packageObj.iconMime);
	res.write(packageObj.icon, "binary");
	return res.end(undefined, "binary");
});

/**
 * PUT /packages/icon
 * 
 * Updates the icon of a specified Package
 */
router.put("/icon", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER || !req.developer) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});

	const { Package, LogItem } = req.models;
	const packageData = req.body;

	if (!packageData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package data specified"
		}
	});

	let query = (req.query.package || {}).filter(["id", "identifier", "name"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});

	let packageObj = await Package.findOne({
		where: query
	});

	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});

	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	let iconFile = req.files.file;
	if (!iconFile) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No icon file specified"
		}
	});
	
	return packageObj.update({
		icon: iconFile.data,
		iconMime: iconFile.mimetype
	}).then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> received a new icon`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK,
			message: "Icon successfully updated"
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/icon
 * 
 * Deletes the icon associated to a Package
 */
router.delete("/icon", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER || !req.developer) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});

	const { Package, LogItem } = req.models;

	let query = (req.query.package || {}).filter(["id", "identifier", "name"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});

	let packageObj = await Package.findOne({
		where: query
	});

	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});

	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return packageObj.update({
		icon: null,
		iconMime: null
	}).then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> received a null icon`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK,
			message: "Icon successfully deleted"
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;