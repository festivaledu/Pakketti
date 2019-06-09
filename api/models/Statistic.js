'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const Statistic = Sequelize.define("Statistic", {
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		year: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		month: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		week: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		downloads: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		reviews: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		accountCreations: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		packageUploads: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		versionUploads: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
		hooks: {
			beforeCreate: (statistcObj, options) => {
				statistcObj.dataValues.id = crypto.SHA256(statistcObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return statistcObj;
			}
		}
	});
	
	Statistic.associate = ({}) => {
		// associations can be defined here
	};
	
	return Statistic;
}