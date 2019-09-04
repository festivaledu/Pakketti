const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../helpers/Enumerations");



/**
 * GET /log
 * 
 * Gets a list of Moderation Log items
 * Can only be used by Users with a Moderator role or higher
 */
router.get("/", async (req, res) => {
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
	
	const { LogItem } = req.models;
	
	const logItemList = await LogItem.findAll({
		where: Object.assign((req.query.logitem || {}).filter(["id", "type"]), {
			status: LogItemStatus.LOG_USAGE
		}),
		raw: true
	});
	
	return res.status(httpStatus.OK).send(logItemList);
});

/**
 * PUT /log
 * 
 * Updates the details of a specific Moderation Log item
 * Can only be used by Users with a Moderator role or higher
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
	
	let query = (req.query.logitem || {}).filter(["id", "type"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem specified"
		}
	});
	
	const { LogItem } = req.models;
	let logItemData = req.body;
	
	if (!logItemData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem data specified"
		}
	});
	
	const logItemObj = await LogItem.findAll({
		where: Object.assign((req.query.logitem || {}).filter(["id", "type"]), {
			status: LogItemStatus.LOG_USAGE
		})
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any LogItem"
		}
	});
	
	return logItemObj.update(Object.assign(logItemData, {
		id: logItemObj.id,
		type: logItemObj.type,
		accountId: logItemObj.accountId
	})).then(logItemObj => {
		return res.status(httpStatus.OK).send(logItemObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /log
 * 
 * Deletes a specific Moderation Log item
 * Can only be used by Users with a Moderator role or higher
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
	
	let query = (req.query.logitem || {}).filter(["id", "type"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem specified"
		}
	});
	
	const { LogItem } = req.models;
	let logItemData = req.body;
	
	if (!logItemData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem data specified"
		}
	});
	
	const logItemObj = await LogItem.findOne({
		where: Object.assign((req.query.logitem || {}).filter(["id", "type"]), {
			status: LogItemStatus.LOG_USAGE
		})
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any LogItem"
		}
	});

	return logItemObj.destroy().then(() => {
		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "LogItem successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;