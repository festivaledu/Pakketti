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
 * 
 * Gets the Statistics values starting the first day of the current month
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
 * 
 * Gets the Statistics values for the current day
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
 * 
 * Gets the Statistics values for the current week
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
 * GET /statistics/year
 * 
 * Gets the Statistics values for the current year
 */
router.get("/year", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("year").toDate()
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
 * 
 * Gets the Statistics values starting from the current day 2 months ago
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
 * 
 * Gets the Statistics values starting fron the current day 2 years ago
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