const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");
const camelcase = require("camelcase");

const ErrorHandler = require("../../helpers/ErrorHandler");
const UserRole = require("../../helpers/Enumerations");
const ArchiveParser = require("../../helpers/ArchiveParser");

Object.fromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({[k]: v}) ));

/**
 * GET /packages/:packageId/versions
 */
router.get("/:packageId/versions", (req, res) => {
	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		return PackageVersion.findAll({
			where: {
				packageId: packageObj.id,
				visible: true
			},
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionList => {
		if (!packageVersionList || !packageVersionList.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Package does not have any versions"
		});
		
		return res.status(httpStatus.OK).send(packageVersionList);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/versions/latest
 */
router.get("/:packageId/versions/latest", (req, res) => {
	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				visible: true
			},
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Package does not have any versions"
		});
		
		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/versions/latest/file
 */
router.get("/:packageId/versions/latest/file", (req, res) => {
	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				visible: true
			},
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Package does not have any versions"
		});
		
		res.header("Content-Type", packageVersionObj.fileMime);
		res.write(packageVersionObj.fileData, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/:packageId/versions/new
 */
router.post("/:packageId/versions/new", async (req, res) => {
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
		message: "Package not found"
	});
	
	if (packageObj.accountId != account.id) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "You are not allowed to perform this action"
	});
	
	if (!req.files || !req.files.file) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No package file specified"
	});
	
	let packageFile = req.files.file;
	let versionData = req.body;
	
	let archiveData = await ArchiveParser.parseArchive(packageFile, packageObj.identifier, packageObj.name, packageObj.architecture);
	
	if (!archiveData) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
		code: httpStatus.INTERNAL_SERVER_ERROR,
		message: "Failed to parse archive data"
	});
	
	// Parsing the archive data resulted in an error, so we send that error as a response
	if (archiveData.code) {
		return res.status(archiveData.code).send(archiveData);
	}
	
	PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			version: controlData.version
		}
	}).then(packageVersionObj => {
		if (packageVersionObj) return res.status(httpStatus.CONFLICT).send({
			name: httpStatus[httpStatus.CONFLICT],
			code: httpStatus.CONFLICT,
			message: `Package already has a version ${archiveData.version || versionData.version}`
		});
		
		PackageVersion.create(Object.assign(archiveData, {
			id: String.prototype.concat(packageObj.id, account.id, new Date().getTime()),
			packageId: packageObj.id,
			version: archiveData["version"] || versionData.version,
			changeText: versionData.changeText,
			visible: versionData.visible,
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
			size: packageFile.size,
			installedSize: controlData.installedSize || -1
		})).then(packageVersionObj => {
			delete packageVersionObj.dataValues.fileData;
			
			return res.status(httpStatus.OK).send(packageVersionObj);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/version/:versionId
 */
router.get("/:packageId/versions/:versionId", (req, res) => {
	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				[Sequelize.Op.or]: {
					id: req.params.versionId,
					version: req.params.versionId
				},
				visible: true
			},
			attributes: { exclude: ["fileData"] }
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package does not have a version ${req.params.versionId}`
		});
		
		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/version/:versionId/file
 */
router.get("/:packageId/versions/:versionId/file", (req, res) => {
	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				[Sequelize.Op.or]: {
					id: req.params.versionId,
					version: req.params.versionId
				},
				visible: true
			}
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package does not have a version ${req.params.versionId}`
		});
		
		res.header("Content-Type", packageVersionObj.fileMime);
		res.write(packageVersionObj.fileData, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/versions/:versionId
 */
router.put("/:packageId/versions/:versionId", (req, res) => {
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
			message: "Package not found"
		});
		
		if (packageObj.accountId != account.id) return res.status(httpStatus.UNAUTHORIZED).send({
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "You are not allowed to perform this action"
		});
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				[Sequelize.Op.or]: {
					id: req.params.versionId,
					version: req.params.versionId
				},
				visible: true
			},
			attributes: { exclude: ["fileData"] }
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package does not have a version ${req.params.versionId}`
		});
		
		packageVersionObj.update(Object.assign(req.body, {
			id: packageVersionObj.id,
			packageId: packageVersionObj.packageId,
			version: packageVersionObj.version,
			downloadCount: packageVersionObj.downloadCount,
			depends: packageVersionObj.depends,
			conflicts: packageVersionObj.conflicts,
			filename: packageVersionObj.filename,
			fileData: packageVersionObj.fileData,
			fileMime: packageVersionObj.fileMime,
			md5sum: packageVersionObj.md5sum,
			sha1: packageVersionObj.sha1,
			sha256: packageVersionObj.sha256,
			section: packageVersionObj.section,
			size: packageVersionObj.size,
			installedSize: packageVersionObj.installedSize,
			createdAt: packageVersionObj.createdAt,
			updatedAt: packageVersionObj.updatedAt
		})).then(packageVersionObj => {
			delete packageVersionObj.fileData;
			
			return res.status(httpStatus.OK).send(packageVersionObj);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/versions/:versionId/file
 */
router.put("/:packageId/versions/:versionId/file", async (req, res) => {
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
		message: "Package not found"
	});
	
	if (packageObj.accountId != account.id) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "You are not allowed to perform this action"
	});
	
	if (!req.files || !req.files.file) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No package file specified"
	});
	
	let packageFile = req.files.file;
	let versionData = req.body;
	let controlData = {};
	
	switch (packageFile.mimetype) {
		case "application/x-debian-package":
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
			
			if (controlData["package"] !== packageObj.identifier ||
				controlData["name"] !== packageObj.name ||
				controlData["architecture"] !== packageObj.architecture) return res.status(httpStatus.CONFLICT).send({
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
	}
	
	PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			version: controlData.version
		}
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package does not have a version ${controlData.version || versionData.version}`
		});
		
		packageVersionObj.update({
			depends: [],
			conflicts: [],
			filename: `/files/${packageFile.name}`,
			fileData: packageFile.data,
			fileMime: packageFile.mimetype,
			md5sum: cryptoBuiltin.createHash("md5").update(packageFile.data).digest("hex"),
			sha1: cryptoBuiltin.createHash("sha1").update(packageFile.data).digest("hex"),
			sha256: cryptoBuiltin.createHash("sha256").update(packageFile.data).digest("hex"),
			size: packageFile.size,
			installedSize: controlData.installedSize || -1
		}).then(packageVersionObj => {
			delete packageVersionObj.dataValues.fileData;
			
			return res.status(httpStatus.OK).send(packageVersionObj);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/versions/:versionId
 */
router.delete("/:packageId/versions/:versionId", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	if (account.role < UserRole.DEVELOPER) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "You are not allowed to perform this action"
	});

	const { Package, PackageVersion } = req.models;

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
			message: "Package not found"
		});
		
		if (((account.role & UserRole.DEVELOPER) == UserRole.DEVELOPER &&
			(account.role & UserRole.MODERATOR) == 0 &&
			(account.role & UserRole.ADMINISTRATOR) == 0) &&
			packageObj.accountId != account.id) {
			return res.status(httpStatus.UNAUTHORIZED).send({
				name: httpStatus[httpStatus.UNAUTHORIZED],
				code: httpStatus.UNAUTHORIZED,
				message: "You are not allowed to perform this action"
			});
		}
		
		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				[Sequelize.Op.or]: {
					id: req.params.versionId,
					version: req.params.versionId
				},
				visible: true
			},
			attributes: { exclude: ["fileData"] }
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package does not have a version ${req.params.versionId}`
		});
		
		packageVersionObj.destroy().then(() => {
			return res.status(httpStatus.OK).send({
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;