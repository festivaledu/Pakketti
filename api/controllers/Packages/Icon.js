const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");

/**
 * GET /packages/:packageId/icon
 */
router.get("/:packageId/icon", (req, res) => {
	const { Package } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		if (!packageObj.icon) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not contain any icon`
		});

		res.write(packageObj.icon, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/icon
 */
router.put("/:packageId/icon", (req, res) => {
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

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
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

		let iconFile = req.files.file;

		if (!iconFile) return res.status(httpStatus.BAD_REQUEST).send({
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No icon file specified"
		});

		packageObj.update({
			icon: iconFile.data
		}).then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.PACKAGE_EDITED,
				accountId: account.id,
				affectedPackageId: packageObj.id,
				detailText: `Package ${packageObj.identifier} <${packageObj.id}> received a new icon`,
				status: 2
			});

			return res.status(httpStatus.OK).send({
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/icon
 */
router.delete("/:packageId/icon", (req, res) => {
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

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
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

		packageObj.update({
			icon: null
		}).then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.PACKAGE_EDITED,
				accountId: account.id,
				affectedPackageId: packageObj.id,
				detailText: `Package ${packageObj.identifier} <${packageObj.id}> received a null icon`,
				status: 2
			});

			return res.status(httpStatus.OK).send({
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;