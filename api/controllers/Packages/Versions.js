const fs = require("fs");
const path = require("path");

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");
const ArchiveParser = require("../../helpers/ArchiveParser");

Object.fromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));

/**
 * GET /packages/:packageId/versions
 * 
 * Gets a list of available (visible) Versions of a specified Package
 */
router.get("/:packageId/versions", async (req, res) => {
	const { Package, PackageVersion } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			[Sequelize.Op.and]: req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			}
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageVersionList = await PackageVersion.findAll({
		where: {
			packageId: packageObj.id,
			visible: { [Sequelize.Op.gte]: req.developer === undefined },
		},
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "DESC"]]
	});

	if (!packageVersionList || !packageVersionList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: "Package does not have any versions"
	});

	return res.status(httpStatus.OK).send(packageVersionList);
});

/**
 * GET /packages/:packageId/versions/latest
 * 
 * Gets the metadata for the latest Version of a specified Package
 */
router.get("/:packageId/versions/latest", async (req, res) => {
	const { Package, PackageVersion } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			visible: true
		},
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "DESC"]]
	});

	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any versions`
	});

	return res.status(httpStatus.OK).send(packageVersionObj);
});

/**
 * GET /packages/:packageId/versions/latest/file
 * 
 * Gets the binary file for the latest Version of a specified Package
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
			message: `No package with identifier ${req.params.packageId} found`
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
			message: `Package ${req.params.packageId} does not have any versions`
		});
		
		if (!fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
			return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package file not found`
			});
		}
		
		let fileData = fs.readFileSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename));
		
		res.header("Content-Type", packageVersionObj.fileMime);
		res.write(fileData, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/:packageId/versions/new
 * 
 * Creates a new Package Version by parsing file contents
 * Supported package files are .deb (DPKG packages), .zip and (.tar).gz
 */
router.post("/:packageId/versions/new", async (req, res) => {
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

	const { Package, PackageVersion, LogItem } = req.models;

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

	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	if (!req.files || !req.files.file) return res.status(httpStatus.BAD_REQUEST).send({
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

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			version: archiveData.version
		}
	});
	
	if (packageVersionObj) return res.status(httpStatus.CONFLICT).send({
		name: httpStatus[httpStatus.CONFLICT],
		code: httpStatus.CONFLICT,
		message: `Package ${req.params.packageId} already has a version ${archiveData.version || versionData.version}`
	});

	return PackageVersion.create(Object.assign(archiveData, {
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
		installedSize: archiveData.installedSize || -1
	})).then(packageVersionObj => {
		delete packageVersionObj.dataValues.fileData;

		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> created version ${packageVersionObj.version} <${packageVersionObj.id}> for package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});
		
		packageFile.mv(path.join(path.dirname(require.main.filename), "../", "files", packageFile.name));

		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/version/:versionId
 * 
 * Gets the metadata for a specific Version of a specified Package
 */
router.get("/:packageId/versions/:versionId", async (req, res) => {
	const { Package, PackageVersion } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			[Sequelize.Op.and]: req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			}
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			[Sequelize.Op.or]: {
				id: req.params.versionId,
				version: req.params.versionId
			},
			visible: { [Sequelize.Op.gte]: req.developer === undefined }
		},
		attributes: { exclude: ["fileData"] }
	});

	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have a version ${req.params.versionId}`
	});

	return res.status(httpStatus.OK).send(packageVersionObj);
});

/**
 * GET /packages/:packageId/version/:versionId/file
 * 
 * Gets the binary file for a specific Version of a specified Package
 */
router.get("/:packageId/versions/:versionId/file", (req, res) => {
	const { Package, PackageVersion } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
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
			message: `Package ${req.params.packageId} does not have a version ${req.params.versionId}`
		});
		
		if (!fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
			return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package file not found`
			});
		}
		
		let fileData = fs.readFileSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename));
		
		res.header("Content-Type", packageVersionObj.fileMime);
		res.write(fileData, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/versions/:versionId
 * 
 * Updates the metadata for a specific Version of a specified Package
 */
router.put("/:packageId/versions/:versionId", async (req, res) => {
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

	const { Package, PackageVersion, LogItem } = req.models;

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

	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	let packageVersionObj = await PackageVersion.findOne({
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

	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have a version ${req.params.versionId}`
	});

	return packageVersionObj.update(Object.assign(req.body, {
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

		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> edited version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/versions/:versionId/file
 * 
 * Updates the binary file for a specific Version of a specified Package
 */
router.put("/:packageId/versions/:versionId/file", async (req, res) => {
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
	
	const { Package, PackageVersion, LogItem } = req.models;
	
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
	
	if (packageObj.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
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
	
	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			version: archiveData.version
		}
	});
	
	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have a version ${archiveData.version || versionData.version}`
	});
	
	if (fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
		fs.unlinkSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))
	}
	
	return packageVersionObj.update(Object.assign(archiveData, {
		id: packageVersionObj.id,
		packageId: packageVersionObj.packageId,
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
		installedSize: archiveData.installedSize || -1
	})).then(packageVersionObj => {
		delete packageVersionObj.dataValues.fileData;
		
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> updated package file for version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});
		
		packageFile.mv(path.join(path.dirname(require.main.filename), "../", "files", packageFile.name));
		
		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/versions/:versionId
 * 
 * Deletes a sepecific Version of a specified Package
 */
router.delete("/:packageId/versions/:versionId", async (req, res) => {
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

	const { Package, PackageVersion, LogItem } = req.models;

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

	let packageVersionObj = await PackageVersion.findOne({
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
	
	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have a version ${req.params.versionId}`
	});

	return packageVersionObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> deleted version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: 2
		});
		
		if (fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
			fs.unlinkSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))
		}

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;