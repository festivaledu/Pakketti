const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");

/**
 * GET /devices
 * 
 * Gets a list of Devices associated to the currently signed in User
 */
router.get("/", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Device } = req.models;
	
	const deviceList = await Device.findAll({
		where: {
			accountId: account.id
		},
	});
	
	return res.status(httpStatus.OK).send(deviceList);
});

/**
 * POST /devices/new
 * 
 * Creates a new Device for the currently signed in User
 */
router.post("/new", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Device, LogItem } = req.models;
	let deviceData = req.body;
	
	if (!deviceData) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No device data specified"
	});

	let deviceObj = await Device.findOne({
		where: { udid: req.body.udid }
	});

	if (deviceObj) return res.status(httpStatus.CONFLICT).send({
		name: httpStatus[httpStatus.CONFLICT],
		code: httpStatus.CONFLICT,
		message: `Device with Serial/UDID ${deviceObj.udid} already exists`
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
			status: 2
		});

		return res.status(httpStatus.OK).send(deviceObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /devices/:deviceId
 * 
 * Gets the public details of a specific Device associated to the currently signed in User
 */
router.get("/:deviceId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Device } = req.models;
	
	const deviceObj = await Device.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.deviceId,
				udid: req.params.deviceId
			},
			accountId: account.id
		},
	});
	
	if (!deviceObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No device with identifier or Serial/UDID ${req.params.deviceId} found`
	});
	
	return res.status(httpStatus.OK).send(deviceObj);
});

/**
 * PUT /devices/:deviceId
 * 
 * Updates the public details of a specific Device associated to the currently signed in User
 */
router.put("/:deviceId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Device, LogItem } = req.models;
	let deviceData = req.body;
	
	if (!deviceData) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No device data specified"
	});
	
	const deviceObj = await Device.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.deviceId,
				udid: req.params.deviceId
			},
			accountId: account.id
		},
	});
	
	if (!deviceObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No device with identifier or Serial/UDID ${req.params.deviceId} found`
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
			status: 2
		});

		return res.status(httpStatus.OK).send(deviceObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /devices/:deviceId
 * 
 * Deletes a specific Device associated to the currently signed in User
 */
router.delete("/:deviceId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Device, LogItem } = req.models;
	
	const deviceObj = await Device.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.deviceId,
				udid: req.params.deviceId
			},
			accountId: account.id
		}
	});
	
	if (!deviceObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No device with identifier or Serial/UDID ${req.params.deviceId} found`
	});
	
	return deviceObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.DEVICE_DELETED,
			accountId: account.id,
			affectedDevice: deviceObj.id,
			detailText: `Device ${deviceObj.id} was deleted by ${account.username} <${account.email}>`,
			status: 2
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;