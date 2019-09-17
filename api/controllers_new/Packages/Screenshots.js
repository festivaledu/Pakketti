const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");

let asyncForEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index)
	}
}


/**
 * GET /packages/screenshots
 * 
 * Gets a list of Screenshot metadata objects associated to a specified Package
 */
router.get("/screenshots", async (req, res) => {
	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageScreenshot } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true
					}))
				)()
			},
		),
		include: [{
			model: PackageScreenshot,
			as: "screenshots",
			separate: true,
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "ASC"]]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	return res.status(httpStatus.OK).send((packageObj.screenshots || []).reduce((obj, item) => ({
		...obj,
		[item["screenClass"]]: (obj[item["screenClass"]] || []).concat(item)
	}), {}));
});

/**
 * POST /packages/screenshots
 * 
 * Creates a bunch of Screenshot metadata objects and associates them to a specified Package
 */
router.post("/screenshots", async (req, res) => {
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
	
	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageScreenshot, LogItem } = req.models;
	let screenshotData = req.body;
	
	if (!screenshotData || !Object.keys(screenshotData).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Screenshot data missing"
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
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
	
	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return PackageScreenshot.bulkCreate(screenshotData.map(screenshotObj => Object.assign(screenshotObj, {
		id: String.prototype.concat(packageObj.id, new Date().getTime(), Math.random()),
		packageId: packageObj.id,
		fileMime: null,
		fileData: null
	}))).then(async () => {
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
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(screenshotList);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/screenshots/files
 * 
 * Adds the submitted Screenshot files to the associated metadata objects
 */
router.post("/screenshots/files", async (req, res) => {
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
	
	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageScreenshot, LogItem } = req.models;
	let screenshotFiles = req.files;

	if (!screenshotFiles || !Object.keys(screenshotFiles).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Screenshot files missing"
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
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
	
	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	let didUpdateScreenshot = false;
	await asyncForEach(Object.keys(screenshotFiles), async fileId => {
		let screenshotObj = await PackageScreenshot.findOne({
			where: { id: fileId }
		});
		
		if (screenshotObj) {
			await screenshotObj.update({
				fileData: screenshotFiles[fileId].data,
				fileMime: screenshotFiles[fileId].mimetype
			});
			didUpdateScreenshot = true;
		}
	});
	
	if (!didUpdateScreenshot) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Could not update any screenshots"
		}
	});
	
	return res.status(httpStatus.OK).send({
		success: {
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK,
			message: "Package screenshot(s) successfully updated"
		}
	});
});

/**
 * GET /packages/screenshot
 * 
 * Gets the binary data of a specific Screenshot associated to a specified Package
 */
router.get("/screenshot", async (req, res) => {
	let query = (req.query.screenshot || {}).filter(["id","screenClass","width","height"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No screenshot specified"
		}
	});
	
	const { PackageScreenshot } = req.models;
	
	let packageScreenshotObj = await PackageScreenshot.findOne({
		where: query,
		attributes: ["fileMime", "fileData"],
	});
	
	if (!packageScreenshotObj || !packageScreenshotObj.fileData) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package screenshot"
		}
	});

	res.header("Content-Type", packageScreenshotObj.fileMime);
	res.write(packageScreenshotObj.fileData, "binary");
	return res.end(undefined, "binary");
});

/**
 * DELETE /packages//screenshot
 * 
 * Deletes the metadata of a specific Screenshot associated to a specified Package
 */
router.delete("/screenshot", async (req, res) => {
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
	
	let query = (req.query.screenshot || {}).filter(["id", "identifier", "name"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No screenshot specified"
		}
	});
	
	const { Package, PackageScreenshot, LogItem } = req.models;
	
	let packageScreenshotObj = await PackageScreenshot.findOne({
		where: query
	});
	
	if (!packageScreenshotObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package screenshots"
		}
	});
	
	let packageObj = await Package.findOne({
		where: {
			id: packageScreenshotObj.packageId
		}
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
	
	return packageScreenshotObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.PACKAGE_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> deleted screenshot ${packageScreenshotObj.id} from package ${packageObj.identifier} <${packageObj.id}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Package screenshot successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;