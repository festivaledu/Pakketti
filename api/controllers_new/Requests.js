const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../helpers/Enumerations");



/**
 * GET /requests/
 * 
 * Gets a list of Requests stored in the Database
 * List items are filtered according to the role of the currently signed in User
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
		where: Object.assign((req.query.request || {}).filter(["id", "type"]), {
			status: { [Sequelize.Op.ne]: LogItemStatus.LOG_USAGE }
		}),
		raw: true
	});
	
	if (account.role < UserRole.MODERATOR) {
		return res.status(httpStatus.OK).send(logItemList.filter(item => item.type === LogItemType.REFUND));
	} else if ((account.role & UserRole.DEVELOPER) != UserRole.DEVELOPER) {
		return res.status(httpStatus.OK).send(logItemList.filter(item => item.type !== LogItemType.REFUND));
	}

	return res.status(httpStatus.OK).send(logItemList);
});

/**
 * PUT /requests
 * 
 * Updates the details of a specified Request
 * Can only be used by the Request creator or Users with a Moderator role or higher
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
	
	let query = (req.query.request || {}).filter(["id", "type"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem specified"
		}
	});
	
	const { LogItem } = req.models;
	let requestData = req.body;

	if (!requestData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No Request data specified"
		}
	});
	
	const logItemObj = await LogItem.findOne({
		where: Object.assign(query, {
			status: { [Sequelize.Op.ne]: LogItemStatus.LOG_USAGE }
		})
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any LogItem"
		}
	});
	
	if (logItemObj.accountId != account.id &&
		account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return logItemObj.update(Object.assign(requestData, {
		id: logItemObj.id,
		type: logItemObj.type,
		accountId: logItemObj.accountId
	})).then(logItemObj => {
		return res.status(httpStatus.OK).send(logItemObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /requests
 * 
 * Deletes a specified Request
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
	
	let query = (req.query.request || {}).filter(["id", "type"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No LogItem specified"
		}
	});
	
	const { LogItem } = req.models;
	
	const logItemObj = await LogItem.findOne({
		where: Object.assign(query, {
			status: { [Sequelize.Op.ne]: LogItemStatus.LOG_USAGE }
		})
	});
	
	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any LogItem"
		}
	});
	
	if (logItemObj.accountId != account.id &&
		account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return logItemObj.destroy().then(logItemObj => {
		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Request successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /requests/new
 * 
 * Create a new Request
 * Users can only create Refunds, User Reports and Developer/Moderator applications
 */
router.post("/new", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	const { LogItem } = req.models;
	let requestData = req.body;

	if (!requestData || isNaN(requestData.type) || !requestData.detailText.length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Request type or detail text missing",
			detail: {
				type: isNaN(requestData.type),
				detailText: !requestData.detailText.length
			}
		}
	});
	
	if ((requestData.type < LogItemType.REFUND) ||
		(requestData.type >= LogItemType.ROLE_DOWNGRADE && account.role < UserRole.DEVELOPER)) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return LogItem.create(Object.assign(requestData, {
		id: String.prototype.concat(account.id, new Date().getTime(), Math.random()),
		accountId: account.id
	})).then(logItemObj => {
		return res.status(httpStatus.OK).send(logItemObj);
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;