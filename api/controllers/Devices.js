const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../helpers/Enumerations");


/**
 * GET /devices
 * 
 * Gets a list of Devices associated to the currently signed in User
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
	
	const { Device } = req.models;

	let deviceList = await Device.findAll({
		where: (req.query.device || {}).filter(["id", "udid"])
	});
	
	if (deviceList.length) {
		deviceList = deviceList.filter(deviceObj => deviceObj.accountId === account.id);
	}

	return res.status(httpStatus.OK).send(deviceList);
});

/**
 * PUT /devices
 * 
 * Updates the public details of a specific Device associated to the currently signed in User
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
	
	const { Device, LogItem } = req.models;
	let deviceData = req.body;
	
	if (!deviceData) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No Device data specified"
		}
	});
	
	let query = (req.query.device || {}).filter(["id", "udid"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No Device specified"
		}
	});

	let deviceObj = await Device.findOne({
		where: Object.assign(query, {
			accountId: account.id
		}),
	});
	
	if (!deviceObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any Device"
		}
	});

	return deviceObj.update(Object.assign(deviceData, {
		id: deviceObj.id,
		product: deviceObj.product,
		udid: deviceObj.udid,
		accountId: deviceObj.accountId
	})).then(deviceObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.DEVICE_UPDATED,
			accountId: account.id,
			affectedDevice: deviceObj.id,
			detailText: `Device ${deviceObj.id} was created by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(deviceObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /devices
 * 
 * Deletes a specific Device associated to the currently signed in User
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
	
	const { Device, LogItem } = req.models;
	
	let query = (req.query.device || {}).filter(["id", "udid"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No Device specified"
		}
	});

	let deviceObj = await Device.findOne({
		where: Object.assign(query, {
			accountId: account.id
		}),
	});
	
	if (!deviceObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any Device"
		}
	});

	return deviceObj.destroy().then(deviceObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.DEVICE_DELETED,
			accountId: account.id,
			affectedDevice: deviceObj.id,
			detailText: `Device ${deviceObj.id} was deleted by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Device successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /devices/new
 * 
 * Creates a new Device for the currently signed in User
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
	
	const { Device, LogItem } = req.models;
	let deviceData = req.body;
	
	if (!deviceData || !deviceData.udid) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No Device data specified"
		}
	});
	
	let deviceObj = await Device.findOne({
		where: { udid: deviceData.udid }
	});
	
	if (deviceObj) return res.status(httpStatus.CONFLICT).send({
		error: {
			name: httpStatus[httpStatus.CONFLICT],
			code: httpStatus.CONFLICT,
			message: `Device with Serial/UDID ${deviceObj.udid} already exists`
		}
	});
	
	return Device.create(Object.assign(deviceData, {
		id: String.prototype.concat(deviceData.udid, new Date().getTime(), Math.random()),
		accountId: account.id
	})).then(deviceObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.DEVICE_CREATED,
			accountId: account.id,
			detailText: `Device ${deviceObj.id} was created by ${account.username} <${account.email}>`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(deviceObj);
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;