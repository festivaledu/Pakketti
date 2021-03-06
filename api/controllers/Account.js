const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../helpers/Enumerations");

const bcrypt = require("bcryptjs");



/**
 * GET /account/me
 * 
 * Gets information about the currently signed in User
 */
router.get("/me", (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	return res.status(httpStatus.OK).send(account);
});

/**
 * PUT /account/me
 * 
 * Updates information for the currently signed in User
 */
router.put("/me", async (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	let { Account, LogItem } = req.models;

	if (req.body.username || req.body.email) {
		let existing = await Account.findOne({
			where: Object.assign(JSON.parse(JSON.stringify({
				username: req.body.username || undefined,
				email: req.body.email || undefined,
			})), {
				id: {
					[Sequelize.Op.ne]: account.id,
				}
			})
		});

		if (existing) return res.status(httpStatus.CONFLICT).send({
			error: {
				name: httpStatus[httpStatus.CONFLICT],
				code: httpStatus.CONFLICT,
				message: "Username or E-Mail address already in use"
			}
		});
	}
	
	if (req.body.password) {
		const salt = bcrypt.genSaltSync(10);
		req.body.password = bcrypt.hashSync(req.body.password, salt);
	}

	return account.update(Object.assign(req.body, {
		id: account.id,
		role: account.role,
		profileImage: account.profileImage,
		profileImageMime: account.profileImageMime,
		lastLogin: account.lastLogin,
		createdAt: account.createdAt,
		updatedAt: account.updatedAt
	})).then(accountObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_EDITED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> has been edited`,
			status: LogItemStatus.LOG_USAGE
		});
		return res.status(httpStatus.OK).send({
			id: accountObj.id,
			username: accountObj.username,
			email: accountObj.email,
			role: accountObj.role,
			lastLogin: accountObj.lastLogin,
			createdAt: accountObj.createdAt
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /account/me
 * 
 * Deletes the currently signed in User, if no packages are associated
 */
router.delete("/me", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	const { Package, LogItem } = req.models;

	let packageObj = await Package.findOne({
		where: {
			accountId: account.id
		}
	});
	
	if (packageObj) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "One or more packages are associated to your account. You may request your deletion in the User Control Panel."
		}
	});

	return account.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_DELETED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> has been deleted`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /account/me/avatar
 * 
 * Gets the binary file for the Avatar of the currently signed in User
 */
router.get("/me/avatar", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	const { Account } = req.models;

	let accountObj = await Account.findOne({
		where: {
			id: account.id
		},
		attributes: ["profileImage", "profileImageMime"]
	});
	
	if (!accountObj.profileImage) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User does not have any profile image"
		}
	});

	res.header("Content-Type", accountObj.profileImageMime);
	res.write(accountObj.profileImage, "binary");
	return res.end(undefined, "binary");
});

/**
 * PUT /account/me/avatar
 * 
 * Updates the Avatar of the currently signed in User
 */
router.put("/me/avatar", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});

	const { Account, LogItem } = req.models;
	let avatarFile = req.files.file;

	if (!avatarFile) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No avatar file specified"
		}
	});

	let accountObj = await Account.findOne({
		where: {
			id: account.id
		},
	});

	return accountObj.update({
		profileImage: avatarFile.data,
		profileImageMime: avatarFile.mimetype
	}).then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_EDITED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> has received a new avatar`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: "OK",
				code: httpStatus.OK,
				message: "Account successfully updated"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /account/me/avatar
 * 
 * Deletes the Avatar of the currently signed in User
 */
router.delete("/me/avatar", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Account, LogItem } = req.models;

	let accountObj = await Account.findOne({
		where: {
			id: account.id
		},
	});
	
	return accountObj.update({
		profileImage: null,
		profileImageMime: null
	}).then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_EDITED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> has deleted their avatar`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			name: "OK",
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /account/all
 * 
 * root-only route to get all users at once.
 * Used for managing users, moderators and administrators
 */
router.get("/all", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	if (account.role < UserRole.ROOT) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	const { Account } = req.models;

	let accountList = await Account.findAll({
		where: (req.query.account || {}).filter(["id", "username", "email"]),
		attributes: ["id", "username", "email", "profileImageMime", "role", "lastLogin", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send(accountList);
});



/**
 * GET /account
 * 
 * Gets public information about a specified User
 */
router.get("/", async (req, res) => {
	let query = (req.query.account || {}).filter(["id", "username", "email"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No account specified"
		}
	});
	
	const { Account } = req.models;

	let accountObj = await Account.findOne({
		where: query,
		attributes: ["id", "username", "profileImageMime", "role", "createdAt"]
	});
	
	if (!accountObj || !Object.keys(accountObj).length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		}
	});

	return res.status(httpStatus.OK).send(accountObj);
});

/**
 * PUT /account
 * 
 * Updates a specified user
 * Restricted to Moderators and Administrators
 * Restricted to Users with a role lower than the own role
 */
router.put("/", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	let query = (req.query.account || {}).filter(["id", "username", "email"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No account specified"
		}
	});
	
	const { Account, LogItem } = req.models;
	
	let accountObj = await Account.findOne({
		where: query
	});
	
	if (!accountObj || !Object.keys(accountObj).length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		}
	});
	
	if (accountObj.id == account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You cannot edit your acount via PUT /account. Please update your account using PUT /account/me"
		}
	});
	
	if (accountObj.role > account.role || accountObj.role == UserRole.MIGRATE) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return accountObj.update((req.body || {}).filter([
		"role"
	])).then(accountObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_EDITED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> has been edited by ${account.username}`,
			status: LogItemStatus.LOG_USAGE
		});
		return res.status(httpStatus.OK).send({
			id: accountObj.id,
			username: accountObj.username,
			email: accountObj.email,
			role: accountObj.role,
			lastLogin: accountObj.lastLogin,
			createdAt: accountObj.createdAt
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /account
 * 
 * Deletes a specified User
 * Users can only be deleted by Users with a Moderator role or higher
 * Users cannot be deleted if their role is equal or higher than the currently signed in User
 */
router.delete("/", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	let query = (req.query.account || {}).filter(["id", "username", "email"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No account specified"
		}
	});
	
	const { Account, LogItem } = req.models;
	
	let accountObj = await Account.findOne({
		where: query
	});
	
	if (!accountObj || !Object.keys(accountObj).length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		}
	});
	
	if (accountObj.id == account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You cannot delete your acount via DELETE /account. Please check if you can delete your account using DELETE /account/me"
		}
	});
	
	if (accountObj.role >= account.role || accountObj.role == UserRole.MIGRATE) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return accountObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.USER_DELETED,
			accountId: account.id,
			affectedAccountId: accountObj.id,
			detailText: `User ${accountObj.username} <${accountObj.email}> was deleted by ${account.username}`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "User successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /account/avatar
 * 
 * Gets the binary file for the Avatar of a specified User
 */
router.get("/avatar", async (req, res) => {
	let query = (req.query.account || {}).filter(["id", "username", "email"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No account specified"
		}
	});
	
	const { Account } = req.models;

	let accountObj = await Account.findOne({
		where: query,
		attributes: ["profileImage", "profileImageMime"]
	});
	
	if (!accountObj || !Object.keys(accountObj).length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		}
	});
	
	if (!accountObj.profileImage) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User does not have any profile image"
		}
	});

	res.header("Content-Type", accountObj.profileImageMime);
	res.write(accountObj.profileImage, "binary");
	return res.end(undefined, "binary");
});



module.exports = router;