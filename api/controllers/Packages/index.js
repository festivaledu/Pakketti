const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole } = require("../../helpers/Enumerations");
const ArchiveParser = require("../../helpers/ArchiveParser");

Object.fromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({[k]: v}) ));

/**
 * GET /packages
 */
router.get("/", (req, res) => {
	const { Package, PackageVersion, PackageScreenshot } = req.models;
	
	Package.findAll({
		where: { visible: true },
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
	}).then(packageList => {
		if (!packageList || !packageList.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "No packages found"
		});
		
		packageList.forEach(packageObj => {
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
		});
		
		return res.status(httpStatus.OK).send(packageList);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/new
 */
router.post("/new", async (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "You are not allowed to perform this action"
	});
	
	const { Package, PackageVersion } = req.models;
	let packageData = req.body;
	
	let packageObj = await Package.findOne({
		where: { identifier: packageData.identifier }
	});
	if (packageObj) return res.status(httpStatus.CONFLICT).send({
		name: httpStatus[httpStatus.CONFLICT],
		code: httpStatus.CONFLICT,
		message: `Package with identifier ${packageData.identifier} already exists`
	});
	
	if (!req.files || !req.files.file) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No package file specified"
	});
	
	let packageFile = req.files.file;
	let iconFile = req.files.icon;
	
	let archiveData = await ArchiveParser.parseArchive(packageFile, req.body.identifier, req.body.name, req.body.architecture);

	if (!archiveData) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
		code: httpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to parse archive data"
	});
	
	// Parsing the archive data resulted in an error, so we send that error as a response
	if (archiveData.code) {
		return res.status(archiveData.code).send(archiveData);
	}

	Package.create(Object.assign(packageData, {
		id: String.prototype.concat(packageData.name, packageData.identifier, new Date().getTime()),
		accountId: account.id,
		icon: iconFile ? iconFile.data : null,
		screenshots: {},
	})).then(packageObj => {
		PackageVersion.create(Object.assign(archiveData, {
			id: String.prototype.concat(packageObj.id, account.id, new Date().getTime()),
			packageId: packageObj.id,
			version: archiveData["version"] || packageData.version,
			changeText: packageData.releaseText,
			visible: true,
			depends: (() => {
				if (!archiveData || !archiveData.depends) return {};
				return archiveData.depends.split(", ").map(item => {
					let match = item.match(/(^\S*)(?:.\((.+)\))?/);
					return { [match[1]]: match[2] };
				}).reduce((obj, item) => (obj[Object.keys(item)[0]] = item[Object.keys(item)[0]] || true, obj), {});
			})(),
			conflicts: (() => {
				if (!archiveData || !archiveData.conflicts) return {};
				return archiveData.conflicts.split(", ").map(item => {
					let match = item.match(/(^\S*)(?:.\((.+)\))?/);
					return { [match[1]]: match[2] };
				}).reduce((obj, item) => (obj[Object.keys(item)[0]] = item[Object.keys(item)[0]] || true, obj), {});
			})(),
			filename: `/files/${packageFile.name}`,
			//fileData: packageFile.data,
			fileMime: packageFile.mimetype,
			md5sum: cryptoBuiltin.createHash("md5").update(packageFile.data).digest("hex"),
			sha1: cryptoBuiltin.createHash("sha1").update(packageFile.data).digest("hex"),
			sha256: cryptoBuiltin.createHash("sha256").update(packageFile.data).digest("hex"),
			size: packageFile.size
		})).then(packageVersionObj => {
			delete packageObj.dataValues.icon;
			delete packageVersionObj.dataValues.fileData;
			
			return res.status(httpStatus.OK).send({
				package: packageObj,
				packageVersion: packageVersionObj
			});
		}).catch(error => ErrorHandler(req, res, error));
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
	.forEach(file => {
		router.use("/", require(path.join(__dirname, file)));
	});

module.exports = router;