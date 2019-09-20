const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");

Object.defineProperty(Object.prototype, 'filter', {
    value: function(values) {
        return Object.keys(this).filter(k => values.includes(k)).reduce((r, k) => { r[k] = this[k]; return r; }, {});
    },
    enumerable: false
});

let asyncForEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index)
	}
}



/**
 * GET /packages
 *
 * Gets a list of available (visible) packages with optional includable metadata
 */
router.get("/", async (req, res) => {
	const { Package, PackageVersion } = req.models;

	let packageList = await Package.findAll({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]),
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			},
		),
		include: req.includes,
		attributes: { exclude: ["icon", "headerImage"] }
	});
	
	await asyncForEach(packageList, async packageObj => {
		await PackageVersion.findAll({
			where: Object.assign({
				packageId: packageObj.id
			}, req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
							visible: true,
							accountId: req.developer !== undefined ? req.developer.id : undefined
						}))
					)()
				}
			)
		}).then(versionList => {
			packageObj.dataValues.downloadCount = versionList.map(_ => _.downloadCount).reduce((a, b) => a + b);
		}).catch(error => ErrorHandler(req, res, error));
	});

	res.status(httpStatus.OK).send(packageList);
});

/**
 * PUT /packages
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

	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
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
		"section",
		"deviceFamilies",
		"visible",
		"status",
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
 * DELETE /packages
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

	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
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