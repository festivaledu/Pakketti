const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");

/**
 * GET /packages/:packageId
 */
router.get("/:packageId", async (req, res) => {
	const { Package, PackageVersion, PackageScreenshot } = req.models;

	let packageObj = await Package.findOne({
		where: {
			visible: true,
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		},
		attributes: { exclude: ["icon"] },
		order: [["createdAt", "DESC"]],
		include: [{
			model: PackageVersion,
			as: "versions",
			separate: true,
			attributes: { exclude: ["fileData"] },
			where: { visible: true },
			order: [["createdAt", "DESC"]],
			limit: 1
		}, {
			model: PackageScreenshot,
			as: "screenshots",
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "ASC"]]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	if (packageObj.dataValues.versions.length) {
		packageObj.dataValues.latestVersion = packageObj.dataValues.versions[0];
	}

	packageObj.dataValues.versions = undefined;

	if (packageObj.dataValues.screenshots.length) {
		packageObj.dataValues.screenshots = packageObj.dataValues.screenshots.reduce((obj, item) => ({
			...obj,
			[item["screenClass"]]: (obj[item["screenClass"]] || []).concat(item)
		}), {});
	}

	return res.status(httpStatus.OK).send(packageObj);
});

/**
 * PUT /packages/:packageId
 */
router.put("/:packageId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	const { Package, LogItem } = req.models;

	const packageData = req.body;

	if (!packageData) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No package data specified"
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		},
		attributes: { exclude: ["icon"] },
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	packageObj.update(Object.assign(packageData, {
		id: packageObj.id,
		identifier: packageObj.identifier,
		icon: undefined,
		accountId: packageObj.accountId,
		createdAt: packageObj.createdAt,
		updatedAt: packageObj.updatedAt
	})).then(packageObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> was edited by ${account.username} <${account.email}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send(packageObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId
 */
router.delete("/:packageId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if (account.role < UserRole.DEVELOPER) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	const { Package, LogItem } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	if (((account.role & UserRole.DEVELOPER) == UserRole.DEVELOPER &&
		(account.role & UserRole.ADMINISTRATOR) == 0) &&
		packageObj.accountId != account.id) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	packageObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `Package ${packageObj.identifier} <${packageObj.id}> was deleted by ${account.username} <${account.email}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;