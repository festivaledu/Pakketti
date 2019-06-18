const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");

/**
 * GET /log/
 */
router.get("/", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});
	
	const { LogItem } = req.models;
	
	const logItemList = await LogItem.findAll({
		where: {
			status: {
				[Sequelize.Op.lt]: 2
			}
		},
		raw: true
	});
	
	return res.status(httpStatus.OK).send(logItemList);
});

/**
 * GET /log/:logItemId
 */
router.get("/:logItemId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});
	
	const { LogItem } = req.models;
	
	const logItemObj = await LogItem.findOne({
		id: req.params.logItemId,
		where: {
			status: {
				[Sequelize.Op.lt]: 2
			}
		},
		raw: true
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No log item with identifier ${req.params.logItemId} found`
	});
	
	return res.status(httpStatus.OK).send(logItemObj);
});

/**
 * PUT /log/:logItemId
 */
router.put("/:logItemId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});
	
	const { LogItem } = req.models;
	let logItemData = req.body;

	if (!logItemData) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Missing log item information"
	});
	
	const logItemObj = await LogItem.findOne({
		where: {
			id: req.params.logItemId,
			status: {
				[Sequelize.Op.lt]: 2
			}
		}
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No log item with identifier ${req.params.logItemId} found`
	});
	
	logItemObj.update(Object.assign(logItemData, {
		id: logItemObj.id,
		type: logItemObj.type,
		accountId: logItemObj.accountId
	})).then(logItemObj => {
		return res.status(httpStatus.OK).send(logItemObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /log/:logItemId
 */
router.delete("/:logItemId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	if (account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});
	
	const { LogItem } = req.models;
	
	const logItemObj = await LogItem.findOne({
		where: {
			id: req.params.logItemId,
			status: {
				[Sequelize.Op.lt]: 2
			}
		}
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No log item with identifier ${req.params.logItemId} found`
	});
	
	logItemObj.destroy().then(() => {
		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;