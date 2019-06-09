const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const UserRole = require("../../helpers/Enumerations");
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
	// if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
	// 	name: httpStatus[httpStatus.UNAUTHORIZED],
	// 	code: httpStatus.UNAUTHORIZED,
	// 	message: "Invalid authorization token"
	// });
	// if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER) return res.status(httpStatus.UNAUTHORIZED).send({
	// 	name: httpStatus[httpStatus.UNAUTHORIZED],
	// 	code: httpStatus.UNAUTHORIZED,
	// 	message: "You are not allowed to perform this action"
	// });
	
	const { Package, PackageVersion } = req.models;
	let packageData = req.body;
	
	// let packageObj = await Package.findOne({
	// 	where: { identifier: packageData.identifier }
	// });
	// if (packageObj) return res.status(httpStatus.CONFLICT).send({
	// 	name: httpStatus[httpStatus.CONFLICT],
	// 	code: httpStatus.CONFLICT,
	// 	message: `Package with identifier ${packageData.identifier} already exists`
	// });
	
	// if (!req.files || !req.files.file) return res.status(httpStatus.NOT_FOUND).send({
	// 	name: httpStatus[httpStatus.BAD_REQUEST],
	// 	code: httpStatus.BAD_REQUEST,
	// 	message: "No package file specified"
	// });
	
	let packageFile = req.files.file;
	let iconFile = req.files.icon;
	
	let archiveData = await ArchiveParser.parseArchive(packageFile, req.body.identifier, req.body.name, req.body.architecture);

	if (!archiveData) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
		code: httpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to parse archive data"
	});
	
	if (archiveData.code) {
		return res.status(archiveData.code).send(archiveData);
	}
	
	return res.status(200).send(archiveData);
	/*switch (packageFile.mimetype) {
		case "application/x-debian-package":
		case "application/x-deb":
			// Debian package (APT)
			controlData = await new Promise((resolve, reject) => {
				let archive = new ar.Archive(packageFile.data);
				archive.getFiles().forEach(file => {
					let filename = file.name();

					if (filename.includes("control.tar.gz")) {
						let extractor = tar.extract();

						extractor.on("entry", (header, stream, next) => {
							if (header.name.indexOf("control") !== -1) {
								let controlFile = controlParser(stream);
								controlFile.on("stanza", parsedControl => {
									return resolve(Object.fromEntries(Object.entries(parsedControl).map(([k, v]) => [camelcase(k), v])));
								});
							} else {
								next();
							}
						});

						bufferstream(file.fileData()).pipe(gunzip()).pipe(extractor);
					}
				});
			});
			
			if (!controlData) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.BAD_REQUEST],
				code: httpStatus.BAD_REQUEST,
				message: "Package file does not contain any control file"
			});
			
			if (controlData["package"] !== req.body.identifier ||
				controlData["name"] !== req.body.name ||
				controlData["architecture"] !== req.body.architecture) return res.status(httpStatus.CONFLICT).send({
				name: httpStatus[httpStatus.CONFLICT],
				code: httpStatus.CONFLICT,
				message: "Package file information does not match package data"
			});
			break;
		case "application/zip":
			// Zip package (packed applications)
		case "application/gzip":
			// GNU Zip package (source code))
			break;
		default: return res.status(httpStatus.BAD_REQUEST).send({
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Package file does not have any known format"
		});
	}*/

	Package.create(Object.assign(packageData, {
		id: String.prototype.concat(packageData.name, packageData.identifier, new Date().getTime()),
		accountId: account.id,
		icon: iconFile ? iconFile.data : null,
		screenshots: {},
	})).then(packageObj => {
		PackageVersion.create(Object.assign(controlData, {
			id: String.prototype.concat(packageObj.id, account.id, new Date().getTime()),
			packageId: packageObj.id,
			version: controlData["version"] || packageData.version,
			changeText: packageData.releaseText,
			visible: true,
			// depends: controlData["depends"] ? controlData["depends"].split(", ") : [],
			// conflicts: controlData["conflicts"] ? controlData["conflicts"].split(", ") : [],
			depends: (() => {
				return []
			})(),
			conflicts: (() => {
				return []
			})(),
			filename: `/files/${packageFile.name}`,
			fileData: packageFile.data,
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