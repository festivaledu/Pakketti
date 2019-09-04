const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");
const moment = require("moment");

const ErrorHandler = require("../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../helpers/Enumerations");

const keys = ["USER_REGISTRATION", "USER_LOGIN", "PACKAGE_CREATED", "VERSION_CREATED", "VERSION_DOWNLOADED", "REVIEW_CREATED"];

/**
 * GET /statistics/day
 * 
 * Gets the Statistics values for the current day until now
 */
router.get("/day", async (req, res) => {
	let now = moment().utc();
	let boundingDate = moment(now).startOf("day");
	let items = [];
	
	for (var i = 0; i <= (now.hour() - boundingDate.hour()); i++) {
		let _d = moment(now).subtract(i, "hours");
		items.push({
			hour: _d.hour(),
			date: _d.date(),
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).hour() == item.hour).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/week
 * 
 * Gets the Statistics values for the current week until today
 */
router.get("/week", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(1, "weeks");
	let items = [];
	
	for (var i = 0; i < 7; i++) {
		let _d = moment(now).subtract(i, "days");
		items.push({
			date: _d.date(),
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).date() == item.date).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/month
 * 
 * Gets the Statistics values for the previous month until today
 */
router.get("/month", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(1, "months");
	let items = [];
	
	for (var i = 0; i < 4; i++) {
		let _d = moment(now).subtract(i, "weeks");
		items.push({
			week: _d.isoWeek(),
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).isoWeek() == item.week).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/3month
 * 
 * Gets the Statistics values for the previous 3 months until today
 */
router.get("/3month", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(3, "months");
	let items = [];
	
	for (var i = 0; i < 12; i++) {
		let _d = moment(now).subtract(i, "weeks");
		items.push({
			week: _d.isoWeek(),
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).isoWeek() == item.week).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/6month
 * 
 * Gets the Statistics values for the previous 6 months until today
 */
router.get("/6month", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(6, "months");
	let items = [];
	
	for (var i = 0; i < 24; i++) {
		let _d = moment(now).subtract(i, "weeks");
		items.push({
			week: _d.isoWeek(),
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).isoWeek() == item.week).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/year
 * 
 * Gets the Statistics values for the previous year until today
 */
router.get("/year", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(1, "years");
	let items = [];
	
	for (var i = 0; i < 12; i++) {
		let _d = moment(now).subtract(i, "months");
		items.push({
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).month() == item.month).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

/**
 * GET /statistics/2year
 * 
 * Gets the Statistics values for the previous 2 years until today
 */
router.get("/2year", async (req, res) => {
	let now = moment().utc().startOf("day");
	let boundingDate = moment(now).subtract(2, "years");
	let items = [];
	
	for (var i = 0; i < 24; i++) {
		let _d = moment(now).subtract(i, "months");
		items.push({
			month: _d.month(),
			year: _d.year(),
		});
	}
	items = items.reverse();
	
	const { LogItem } = req.models;
	
	let statisticsList = await LogItem.findAll({
		where: {
			type: {
				[Sequelize.Op.in]: keys.map(key => LogItemType[key])
			},
			createdAt: {
				[Sequelize.Op.gte]: boundingDate.toDate()
			}
		},
		raw: true,
		attributes: ["type", "createdAt"]
	});
	
	items = items.map(item => ({
		...item,
		...keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(statisticsObj => LogItemType[key] === statisticsObj.type && moment(new Date(statisticsObj.createdAt)).month() == item.month).length
		}), {})
	}))
	
	return res.status(httpStatus.OK).send({
		items: items,
		total: keys.reduce((obj, key) => ({
			...obj,
			[key.toLowerCase().replace(/_\w/g, (m) => m[1].toUpperCase())]: statisticsList.filter(item => LogItemType[key] === item.type).length
		}), {})
	});
});

module.exports = router;