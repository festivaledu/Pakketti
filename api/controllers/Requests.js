const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");

/**
 * GET /requests/
 * 
 * Gets a list of Requests stored in the Database
 * List items are filtered according to the role of the currently signed in User
 */
router.get("/", async (req, res) => {
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

	const { LogItem } = req.models;

	const logItemList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.gte]: LogItemType.REFUND
			}
		},
		raw: true
	}).catch(error => ErrorHandler(req, res, error));

	if (account.role < UserRole.MODERATOR) {
		return res.status(httpStatus.OK).send(logItemList.filter(item => item.type === LogItemType.REFUND));
	} else if ((account.role & UserRole.DEVELOPER) == UserRole.DEVELOPER) {
		return res.status(httpStatus.OK).send(logItemList);
	}

	return res.status(httpStatus.OK).send(logItemList.filter(item => item.type !== LogItemType.REFUND));
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
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { LogItem } = req.models;
	let requestData = req.body;

	if (!requestData || isNaN(requestData.type) || !requestData.detailText.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Missing request information"
	});

	if (requestData.type >= LogItemType.ROLE_DOWNGRADE && account.role < UserRole.DEVELOPER) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	let logItemObj = await LogItem.create(Object.assign(requestData, {
		id: String.prototype.concat(account.id, new Date().getTime(), Math.random()),
		accountId: account.id
	})).catch(error => ErrorHandler(req, res, error));

	return res.status(httpStatus.OK).send(logItemObj);
});

/**
 * PUT /requests/:requestId
 * 
 * Updates the details of a specified Request
 * Can only be used by the Request creator or Users with a Moderator role or higher
 */
router.put("/:requestId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { LogItem } = req.models;
	let requestData = req.body;

	if (!requestData) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Missing request information"
	});

	let logItemObj = await LogItem.find({
		where: {
			id: req.params.requestId
		}
	}).catch(error => ErrorHandler(req, res, error));

	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No request with identifier ${req.params.requestId} found`
	});

	if (logItemObj.accountId != account.id &&
		account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});

	logItemObj.update(Object.assign(requestData, {
		id: logItemObj.id,
		type: logItemObj.type,
		accountId: logItemObj.accountId
	})).then(logItemObj => {
		return res.status(httpStatus.OK).send(logItemObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /requests/:requestId
 * 
 * Deletes a specified Request
 * Can only be used by Users with a Moderator role or higher
 */
router.delete("/:requestId", async (req, res) => {
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

	let logItemObj = await LogItem.find({
		where: {
			id: req.params.requestId
		}
	}).catch(error => ErrorHandler(req, res, error));

	if (!logItemObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No request with identifier ${req.params.requestId} found`
	});

	if (logItemObj.accountId != account.id &&
		account.role < UserRole.MODERATOR) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	logItemObj.destroy().then(() => {
		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;