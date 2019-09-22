const fs = require("fs");
const path = require("path");

const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const cryptoBuiltin = require("crypto");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");
const ArchiveParser = require("../../helpers/ArchiveParser");


/**
 * GET /packages/versions
 * 
 * Returns a list of Versions associated to a Package, or a specific Version using GET parameters
 */
router.get("/versions", async (req, res) => {
	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageVersion } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			},
		),
		include: [{
			model: PackageVersion,
			as: "versions",
			where: Object.assign((req.query.version || {}).filter(["id", "version"]), 
				req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					visible: true
				}
			),
			separate: true,
			order: [["createdAt", "DESC"]],
			include: req.includes
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	res.status(httpStatus.OK).send(packageObj.versions);
});

/**
 * GET /packages/versions/file
 * 
 * Retrieves the file of a Version associated to a Package, if existing
 */
router.get("/versions/file", async (req, res) => {
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!packageQuery || !Object.keys(packageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	let versionQuery = (req.query.version || {}).filter(["id", "version"]);
	if (!versionQuery || !Object.keys(versionQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package version specified"
		}
	});
	
	const { Package, PackageVersion, LogItem } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign(packageQuery || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				[Sequelize.Op.or]: (() => JSON.parse(JSON.stringify({
						visible: true,
						accountId: req.developer !== undefined ? req.developer.id : undefined
					}))
				)()
			},
		),
		include: [{
			model: PackageVersion,
			as: "versions",
			where: Object.assign((versionQuery || {}).filter(["id", "version"]), {
				visible: true
			}),
			separate: true,
			order: [["createdAt", "DESC"]],
			attributes: [ "filename" ]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	let packageVersionObj = packageObj.versions[0];
	
	if (!fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
		return res.status(httpStatus.NOT_FOUND).send({
			error: {
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: "Package file not found"
			}
		});
	}
	
	let fileData = fs.readFileSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename));
		
	LogItem.create({
		id: String.prototype.concat(new Date().getTime, Math.random()),
		type: LogItemType.VERSION_DOWNLOADED,
		accountId: packageObj.accountId,
		affectedPackageId: packageObj.id,
		detailText: `Package ${packageObj.identifier} <${packageObj.id}>, version ${packageVersionObj.version} <${packageVersionObj.id}> has been downloaded`,
		status: LogItemStatus.LOG_USAGE
	});
	
	res.header("Content-Type", packageVersionObj.fileMime);
	res.write(fileData, "binary");
	return res.end(undefined, "binary");
});

/**
 * POST /packages/versions/new
 * 
 * Creates a new Package Version by parsing file contents
 * Supported package files are .deb (DPKG packages), .zip and (.tar).gz
 */
router.post("/versions/new", async (req, res) => {
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
	
	const { Package, PackageVersion, LogItem } = req.models;
	let packageFile = req.files.file;
	let versionData = req.body;
	
	if (!packageFile) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package file specified"
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

	let archiveData = await ArchiveParser.parseArchive(packageFile, packageObj.identifier, packageObj.name, packageObj.architecture);

	if (!archiveData) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		error: {
			name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
			code: httpStatus.INTERNAL_SERVER_ERROR,
			message: "Failed to parse archive data"
		}
	});
	
	// Parsing the archive data resulted in an error, so we send that error as a response
	if (archiveData.code) {
		return res.status(archiveData.code).send({ error: archiveData });
	}

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			version: archiveData.version
		}
	});
	
	if (packageVersionObj) return res.status(httpStatus.CONFLICT).send({
		error: {
			name: httpStatus[httpStatus.CONFLICT],
			code: httpStatus.CONFLICT,
			message: `Package ${packageObj.id} already has a version ${archiveData.version || versionData.version}`
		}
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
		fileMime: packageFile.mimetype,
		md5sum: cryptoBuiltin.createHash("md5").update(packageFile.data).digest("hex"),
		sha1: cryptoBuiltin.createHash("sha1").update(packageFile.data).digest("hex"),
		sha256: cryptoBuiltin.createHash("sha256").update(packageFile.data).digest("hex"),
		size: packageFile.size,
		installedSize: archiveData.installedSize || -1
	})).then(packageVersionObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> created version ${packageVersionObj.version} <${packageVersionObj.id}> for package ${packageObj.identifier} <${packageObj.id}>`,
			status: LogItemStatus.LOG_USAGE
		});
		
		packageFile.mv(path.join(path.dirname(require.main.filename), "../", "files", packageFile.name));

		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/versions
 * 
 * Updates the metadata for a specific Version associated to a Package
 */
router.put("/versions", async (req, res) => {
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
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!packageQuery || !Object.keys(packageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	let versionQuery = (req.query.version || {}).filter(["id", "version"]);
	if (!versionQuery || !Object.keys(versionQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package version specified"
		}
	});
	
	const { Package, PackageVersion, LogItem } = req.models;
	const versionData = req.body;

	if (!versionData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No version data specified"
		}
	});
	
	let packageObj = await Package.findOne({
		where: packageQuery,
		include: [{
			model: PackageVersion,
			as: "versions",
			where: versionQuery,
			order: [["createdAt", "DESC"]],
		}]
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
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	let packageVersionObj = packageObj.versions[0];
	
	return packageVersionObj.update(versionData.filter([
		"packageType",
		"changeText",
		"visible"
	])).then(packageVersionObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> edited version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/versions/file
 * 
 * Updates the binary file for a specific Version associated to a Package
 */
router.put("/versions/file", async (req, res) => {
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
	
	const { Package, PackageVersion, LogItem } = req.models;
	const packageFile = req.files.file
	const versionData = req.body;

	if (!packageFile) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package file specified"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!packageQuery || !Object.keys(packageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	let versionQuery = (req.query.version || {}).filter(["id", "version"]);
	if (!versionQuery || !Object.keys(versionQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package version specified"
		}
	});
	
	let packageObj = await Package.findOne({
		where: packageQuery,
		include: [{
			model: PackageVersion,
			as: "versions",
			where: versionQuery,
			order: [["createdAt", "DESC"]],
		}]
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
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	let archiveData = await ArchiveParser.parseArchive(packageFile, packageObj.identifier, packageObj.name, packageObj.architecture);

	if (!archiveData) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		error: {
			name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
			code: httpStatus.INTERNAL_SERVER_ERROR,
			message: "Failed to parse archive data"
		}
	});
	
	// Parsing the archive data resulted in an error, so we send that error as a response
	if (archiveData.code) {
		return res.status(archiveData.code).send({ error: archiveData });
	}
	
	let packageVersionObj = packageObj.versions[0];
	
	if (!packageVersionObj) return res.status(httpStatus.CONFLICT).send({
		error: {
			name: httpStatus[httpStatus.CONFLICT],
			code: httpStatus.CONFLICT,
			message: `Package ${packageObj.id} does not have a version ${archiveData.version || versionData.version}`
		}
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
		fileMime: packageFile.mimetype,
		md5sum: cryptoBuiltin.createHash("md5").update(packageFile.data).digest("hex"),
		sha1: cryptoBuiltin.createHash("sha1").update(packageFile.data).digest("hex"),
		sha256: cryptoBuiltin.createHash("sha256").update(packageFile.data).digest("hex"),
		size: packageFile.size,
		installedSize: archiveData.installedSize || -1
	})).then(packageVersionObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> updated package file for version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: LogItemStatus.LOG_USAGE
		});
		
		packageFile.mv(path.join(path.dirname(require.main.filename), "../", "files", packageFile.name));
		
		return res.status(httpStatus.OK).send(packageVersionObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/versions/
 * 
 * Deletes a specific Version associated to a Package, if existing
 */
router.delete("/versions", async (req, res) => {
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
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!packageQuery || !Object.keys(packageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	let versionQuery = (req.query.version || {}).filter(["id", "version"]);
	if (!versionQuery || !Object.keys(versionQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package version specified"
		}
	});
	
	const { Package, PackageVersion, LogItem } = req.models;
	
	let packageObj = await Package.findOne({
		where: packageQuery,
		include: [{
			model: PackageVersion,
			as: "versions",
			where: versionQuery,
			order: [["createdAt", "DESC"]],
		}]
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
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	let packageVersionObj = packageObj.versions[0];

	return packageVersionObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.VERSION_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			detailText: `User ${account.username} <${account.email}> deleted version ${packageVersionObj.version} <${packageVersionObj.id}> of package ${packageObj.identifier} <${packageObj.id}>`,
			status: LogItemStatus.LOG_USAGE
		});

		if (fs.existsSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))) {
			fs.unlinkSync(path.join(path.dirname(require.main.filename), "../", packageVersionObj.filename))
		}
		
		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Package Version successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;