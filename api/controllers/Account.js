const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");

/**
 * GET /account/me
 */
router.get("/me", (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	return res.status(httpStatus.OK).send(account);
});

/**
 * PUT /account/me
 */
router.put("/me", async (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	let { Account, LogItem } = req.models;
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
		name: httpStatus[httpStatus.CONFLICT],
		code: httpStatus.CONFLICT,
		message: "Username or E-Mail address already in use"
	});
	
	account.update(Object.assign(req.body, {
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
			status: 2
		});
		return res.status(httpStatus.OK).json({
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
 */
router.delete("/me", (req, res) => {
	const { account } = req;
	const { Package, LogItem } = req.models;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	Package.findOne({
		where: {
			accountId: account.id
		}
	}).then(packageObj => {
		if (packageObj) return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "One or more packages are associated to your account. You may request your deletion in the User Control Panel."
		});
		
		account.destroy().then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.USER_DELETED,
				accountId: account.id,
				affectedAccountId: accountObj.id,
				detailText: `User ${accountObj.username} <${accountObj.email}> has been deleted`,
				status: 2
			});
			
			return res.status(httpStatus.OK).send({
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	});
});



/**
 * GET /account/me/avatar
 */
router.get("/me/avatar", (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Account } = req.models;
	
	Account.findOne({
		where: {
			id: account.id
		},
		attributes: ["profileImage", "profileImageMime"]
	}).then(accountObj => {
		if (!accountObj.profileImage) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User does not have any profile image"
		});
		
		res.header("Content-Type", accountObj.profileImageMime);
		res.write(accountObj.profileImage, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /account/me/avatar
 */
router.put("/me/avatar", (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Account, LogItem } = req.models;
	
	if (!req.files || !req.files.file) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No avatar file specified"
	});
	let avatarFile = req.files.file;
	
	Account.findOne({
		where: {
			id: account.id
		},
	}).then(accountObj => {
		accountObj.update({
			profileImage: avatarFile.data,
			profileImageMime: avatarFile.mimetype
		}).then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.USER_EDITED,
				accountId: account.id,
				affectedAccountId: accountObj.id,
				detailText: `User ${accountObj.username} <${accountObj.email}> has received a new avatar`,
				status: 2
			});
			
			return res.status(httpStatus.OK).send({
				name: "OK",
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /account/me/avatar
 */
router.delete("/me/avatar", (req, res) => {
	const { account } = req;
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Account } = req.models;
	
	Account.findOne({
		where: {
			id: account.id
		},
	}).then(accountObj => {
		accountObj.update({
			profileImage: null,
			profileImageMime: null
		}).then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.USER_EDITED,
				accountId: account.id,
				affectedAccountId: accountObj.id,
				detailText: `User ${accountObj.username} <${accountObj.email}> has deleted their avatar`,
				status: 2
			});
			
			return res.status(httpStatus.OK).send({
				name: "OK",
				code: httpStatus.OK
			});
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /account/:userId
 */
router.get("/:userId", (req, res) => {
	const { Account } = req.models;
	
	Account.findOne({
		where: {
			id: req.params.userId
		},
		attributes: ["id", "username", [Sequelize.fn("COUNT", Sequelize.col('profileImage')), "profileImage"], "role", "createdAt"]
	}).then(accountObj => {
		if (!accountObj || !accountObj.id) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		});
		
		return res.status(httpStatus.OK).send(accountObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /account/:userId
 */
router.delete("/:userId", (req, res) => {
	const { account } = req;
	const { Account } = req.models;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	if (account.id == req.params.userId) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You cannot delete your acount via DELETE /account/:userId. Please check if you can delete your account using DELETE /account/me"
	});
	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});
	
	Account.findOne({
		where: {
			id: req.params.userId
		}
	}).then(accountObj => {
		if (!accountObj || !accountObj.id) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		});
		
		if (accountObj.role >= account.role || accountObj.role == 1) return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
		
		accountObj.destroy().then(() => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.USER_DELETED,
				accountId: account.id,
				affectedAccountId: accountObj.id,
				detailText: `User ${accountObj.username} <${accountObj.email}> was deleted by ${account.username}`,
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
 * GET /account/:userId/avatar
 */
router.get("/:userId/avatar", (req, res) => {
	const { Account } = req.models;
	
	Account.findOne({
		where: {
			id: req.params.userId
		},
		attributes: ["profileImage", "profileImageMime"]
	}).then(accountObj => {
		if (!accountObj || accountObj.id) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User not found"
		});
		
		if (!accountObj.profileImage) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "User does not have any profile image"
		});
		
		res.header("Content-Type", accountObj.profileImageMime);
		res.write(accountObj.profileImage, "binary");
		return res.end(undefined, "binary");
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;