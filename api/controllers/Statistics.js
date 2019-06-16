const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const moment = require("moment");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");
const keys = ["API_STARTUP", "USER_REGISTRATION", "USER_LOGIN", "PACKAGE_CREATED", "VERSION_CREATED", "REVIEW_CREATED"];

/**
 * GET /statistics
 */
router.get("/", async (req, res) => {
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("month").toDate()
			}
		},
		raw: true,
		attributes: ["type"]
	});
	
	return res.status(200).send(keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {}));
});

/**
 * GET /statistics/day
 */
router.get("/day", async (req, res) => {
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").toDate()
			}
		},
		raw: true,
		attributes: ["type"]
	});
	
	return res.status(200).send(keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {}));
});

/**
 * GET /statistics/week
 */
router.get("/week", async (req, res) => {
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("isoWeek").toDate()
			}
		},
		raw: true,
		attributes: ["type"]
	});
	
	return res.status(200).send(keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {}));
});

/**
 * GET /statistics/monthly
 */
router.get("/monthly", async (req, res) => {
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(2, "months").toDate()
			}
		},
		raw: true,
		attributes: ["type"]
	});
	
	return res.status(200).send(keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {}));
});


/**
 * GET /statistics/yearly
 */
router.get("/yearly", async (req, res) => {
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(2, "years").toDate()
			}
		},
		raw: true,
		attributes: ["type"]
	});
	
	return res.status(200).send(keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {}));
});

module.exports = router;