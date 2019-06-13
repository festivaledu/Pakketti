const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole } = require("../../helpers/Enumerations");

/**
 * GET /packages/:packageId/screenshots
 */
router.get("/:packageId/screenshots", (req, res) => {
	const { Package, PackageScreenshot } = req.models;

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
		
		return PackageScreenshot.findAll({
			where: { packageId: packageObj.id },
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "ASC"]]
		})
	}).then(packageScreenshotList => {
		if (!packageScreenshotList || !packageScreenshotList.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any screenshots`
		});
		
		return res.status(httpStatus.OK).send(packageScreenshotList.reduce((obj, item) => ({
			...obj,
			[item["screenClass"]]: (obj[item["screenClass"]] || []).concat(item)
		}), {}));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/screenshots/:screenshotId
 */
router.get("/:packageId/screenshots/:screenshotId", (req, res) => {
	const { Package, PackageScreenshot } = req.models;

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
		
		return PackageScreenshot.findOne({
			where: {
				id: req.params.screenshotId,
				packageId: packageObj.id
			}
		});
	}).then(packageScreenshotObj => {
		if (!packageScreenshotObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any screenshot with identifier ${req.params.screenshotId}`
		});

		res.write(packageScreenshotObj.fileData, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/screenshots/:screenshotId
 */
router.delete("/:packageId/screenshots/:screenshotId", (req, res) => {
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
	
	const { Package, PackageScreenshot } = req.models;
	
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
		
		if (packageObj.accountId != account.id) {
			return res.status(httpStatus.FORBIDDEN).send({
				name: httpStatus[httpStatus.FORBIDDEN],
				code: httpStatus.FORBIDDEN,
				message: "You are not allowed to perform this action"
			});
		}
		
		return PackageScreenshot.findOne({
			where: {
				id: req.params.screenshotId,
				packageId: packageObj.id
			}
		});
	}).then(packageScreenshotObj => {
		if (!packageScreenshotObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any screenshot with identifier ${req.params.screenshotId}`
		});

		packageScreenshotObj.destroy().then(() => {
			return res.status(httpStatus.OK).send({
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;