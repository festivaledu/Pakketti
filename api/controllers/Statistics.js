const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const moment = require("moment");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../helpers/Enumerations");
const keys = ["USER_REGISTRATION", "USER_LOGIN", "PACKAGE_CREATED", "VERSION_CREATED", "VERSION_DOWNLOADED", "REVIEW_CREATED"];

const groupedStatistics = (statisticsList, format = "week") => {
	statisticsList = statisticsList.map(item => {
		let _date = moment(new Date(item.createdAt));


		switch (format) {
			case "hour":
				return {
					...item,
					hour: _date.format("HH"),
				};
			case "day":
				return {
					...item,
					day: _date.format("DD"),
					month: _date.format("MM"),
					year: _date.format("YYYY")
				}
			case "week":
				return {
					...item,
					week: _date.format("WW"),
					month: _date.format("MM"),
					year: _date.format("YYYY")
				};
			case "month":
				return {
					...item,
					month: _date.format("MM"),
					year: _date.format("YYYY")
				};
			default: break;
		}
	}).reduce((obj, item) => {
		return {
			...obj,
			[item[format]]: (obj[item[format]] || []).concat(item)
		}
	}, {});
	
	return Object.keys(statisticsList).map(formatKey => {
		return keys.reduce((obj, key) => ({
			...obj,
			...statisticsList[formatKey][0],
			type: undefined,
			createdAt: undefined,
			[key]: statisticsList[formatKey].filter(item => LogItemType[key] === item.type).length
		}), {});
	});
}

const totalStatistics = (statisticsList) => {
	return keys.reduce((obj, key) => ({
		...obj,
		[key]: statisticsList.filter(item => LogItemType[key] === item.type).length
	}), {})
}

/**
 * GET /statistics/day
 * 
 * Gets the Statistics values for the current day until now
 */
router.get("/day", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList, "hour"),
		total: totalStatistics(statisticsList)
	});
});

/**
 * GET /statistics/week
 * 
 * Gets the Statistics values for the current week until today
 */
router.get("/week", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(1, "weeks").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList, "day"),
		total: totalStatistics(statisticsList)
	});
});

/**
 * GET /statistics/month
 * 
 * Gets the Statistics values for the previous month until today
 */
router.get("/month", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(1, "months").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList),
		total: totalStatistics(statisticsList)
	});
});

/**
 * GET /statistics/3month
 * 
 * Gets the Statistics values for the previous 3 months until today
 */
router.get("/3month", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(3, "months").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList),
		total: totalStatistics(statisticsList)
	});
});

/**
 * GET /statistics/year
 * 
 * Gets the Statistics values for the previous year until today
 */
router.get("/year", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(1, "years").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList, "month"),
		total: totalStatistics(statisticsList)
	});
});

/**
 * GET /statistics/2year
 * 
 * Gets the Statistics values for the previous 2 years until today
 */
router.get("/2year", async (req, res) => {
	const { LogItem } = req.models;

	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: moment().utc().startOf("day").subtract(2, "years").toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	return res.status(httpStatus.OK).send({
		items: groupedStatistics(statisticsList, "month"),
		total: totalStatistics(statisticsList)
	});
});

module.exports = router;