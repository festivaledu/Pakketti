const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");

Object.defineProperty(Object.prototype, 'filter', {
    value: function(values) {
        return Object.keys(this).filter(k => values.includes(k)).reduce((r, k) => { r[k] = this[k]; return r; }, {});
    },
    enumerable: false
});

router.use((req, res, next) => {
	const { Device, PackageRating, PackageReview, PackageReviewMessage, PackageScreenshot, PackageVersion } = req.models;

	// Define various includes that the user can embed using the "include" GET parameter
	const includes = {
		ratings: {
			model: PackageRating,
			as: "ratings",
			where: (req.query.rating || {}).filter(["id"]),
			separate: true
		},
		reviews: {
			model: PackageReview,
			as: "reviews",
			where: (req.query.review || {}).filter(["id"]),
			separate: true,
			attributes: { exclude: ["deviceId"] },
			order: [["createdAt", "DESC"]],
			include: [{
				model: PackageReviewMessage,
				as: "messages",
				separate: true,
				order: [["createdAt", "ASC"]]
			}, {
				model: PackageRating,
				as: "rating"
			}, {
				model: Device,
				as: "device",
				attributes: {
					exclude: ["id", "udid", "variant", "capacity"]
				}
			}]
		},
		screenshots: {
			model: PackageScreenshot,
			as: "screenshots",
			where: (req.query.screenshot || {}).filter(["id","screenClass","width","height"]),
			separate: true,
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "ASC"]]
		},
		versions: {
			model: PackageVersion,
			as: "versions",
			where: Object.assign((req.query.version || {}).filter(["id", "version"]), 
				req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					visible: true
				}
			),
			separate: true,
			order: [["createdAt", "DESC"]]
		}
	};

	if (req.query && req.query.include) {
		req.includes = req.query.include.split(",").map(include => includes[include.toLowerCase()]).filter(Boolean);
	} else {
		req.includes = [];
	}

	return next();
});



/**
 * GET /packages
 *
 * Gets a list of available (visible) packages with optional includable metadata
 */
router.get("/", async (req, res) => {
	const { Package } = req.models;

	let packageList = await Package.findAll({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			},
		),
		include: req.includes
	});

	res.status(httpStatus.OK).send(packageList);
});

/**
 * PUT /packages/
 *
 * Updates the metadata of a Package using specified attributes (id, identifier, name)
 */
router.put("/", async (req, res) => {
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

	
	return packageObj.update(packageData.filter([
		"name",
		"shortDescription",
		"detailedDescription",
		"platform",
		"architecture",
		"minOSVersion",
		"maxOSVersion",
		"visible",
		"issueURL"
	])).then(packageObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> was edited by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(packageObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/
 *
 * Updates the metadata of a Package using specified attributes (id, identifier, name)
 */
router.delete("/", async (req, res) => {
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
		// TODO: delete package files
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

	return packageObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> was deleted by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});
		
		// TODO: delete package files

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Package successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/new
 *
 * Creates a new Package
 */
router.post("/new", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});

	const { Package, LogItem } = req.models;
	const packageData = req.body;

	if (!packageData.identifier || !packageData.name) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Package identifier or name missing"
		}
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				identifier: packageData.identifier,
				name: packageData.name
			}
		}
	});

	if (packageObj) return res.status(httpStatus.CONFLICT).send({
		error: {
			name: httpStatus[httpStatus.CONFLICT],
			code: httpStatus.CONFLICT,
			message: `Package with identifier \"${packageData.identifier}\" or name \"${packageData.name}\" already exists`
		}
	});

	return Package.create(Object.assign(packageData, {
		id: String.prototype.concat(packageData.name, packageData.identifier, new Date().getTime()),
		accountId: account.id,
		screenshots: {},
	})).then(packageObj => {
		delete packageObj.dataValues.icon;

		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> was created by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(packageObj);
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * Additional routes
 */
fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.reverse()
	.forEach(file => {
		router.use("/", require(path.join(__dirname, file)));
	});

module.exports = router;