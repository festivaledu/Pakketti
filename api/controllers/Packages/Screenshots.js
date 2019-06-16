const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");

/**
 * GET /packages/:packageId/screenshots
 */
router.get("/:packageId/screenshots", async (req, res) => {
	const { Package, PackageScreenshot } = req.models;

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

	let packageScreenshotList = await PackageScreenshot.findAll({
		where: { packageId: packageObj.id },
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "ASC"]]
	})

	if (!packageScreenshotList || !packageScreenshotList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any screenshots`
	});

	return res.status(httpStatus.OK).send(packageScreenshotList.reduce((obj, item) => ({
		...obj,
		[item["screenClass"]]: (obj[item["screenClass"]] || []).concat(item)
	}), {}));
});

/**
 * POST /packages/:packageId/screenshots
 */
router.post("/:packageId/screenshots", async (req, res) => {
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

	const { Package, PackageScreenshot, LogItem } = req.models;
	const screenshotData = req.body;

	if (!req.body || !req.body.length) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Screenshot data missing"
	});

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

	if (packageObj.accountId != account.id) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	PackageScreenshot.bulkCreate(screenshotData.map(screenshotObj => Object.assign(screenshotObj, {
		id: String.prototype.concat(packageObj.id, new Date().getTime(), Math.random()),
		packageId: packageObj.id
	}))).then(() => {
		return PackageScreenshot.findAll({
			where: {
				sha256: {
					[Sequelize.Op.in]: screenshotData.map(screenshotObj => screenshotObj.sha256)
				}
			}
		});
	}).then(screenshotList => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> added ${screenshotList.length} screenshot(s) to package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send(screenshotList);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/screenshots/:screenshotId
 */
router.get("/:packageId/screenshots/:screenshotId", async (req, res) => {
	const { Package, PackageScreenshot } = req.models;

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

	let packageScreenshotObj = await PackageScreenshot.findOne({
		where: {
			id: req.params.screenshotId,
			packageId: packageObj.id
		}
	});

	if (!packageScreenshotObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any screenshot with identifier ${req.params.screenshotId}`
	});

	res.write(packageScreenshotObj.fileData, "binary");
	return res.end(undefined, "binary");
});

/**
 * DELETE /packages/:packageId/screenshots/:screenshotId
 */
router.delete("/:packageId/screenshots/:screenshotId", async (req, res) => {
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

	const { Package, PackageScreenshot, LogItem } = req.models;

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

	if (packageObj.accountId != account.id) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	let packageScreenshotObj = await PackageScreenshot.findOne({
		where: {
			id: req.params.screenshotId,
			packageId: packageObj.id
		}
	});

	if (!packageScreenshotObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any screenshot with identifier ${req.params.screenshotId}`
	});

	packageScreenshotObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> deleted screenshot ${packageScreenshotObj.id} from package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;