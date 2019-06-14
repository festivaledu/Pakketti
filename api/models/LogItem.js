'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const LogItem = Sequelize.define("LogItem", {
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		type: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		affectedAccountId: {
			type: DataTypes.STRING(32)
		},
		affectedPackageId: {
			type: DataTypes.STRING(32)
		},
		affectedReviewId: {
			type: DataTypes.STRING(32)
		},
		detailText: {
			type: DataTypes.text,
			allowNull: false
		},
		status: {
			// -1: Not reviewed
			// 0: Accepted
			// 1: Rejected
			// 2: Used as log
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		statusText: {
			type: DataTypes.TEXT
		},
		reviewedBy: {
			type: DataTypes.STRING(32)
		}
	}, {
		hooks: {
			beforeCreate: (logItemObj, options) => {
				logItemObj.dataValues.id = crypto.SHA256(logItemObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return logItemObj;
			}
		}
	});
	
	LogItem.associate = ({}) => {
		// associations can be defined here
	};
	
	return LogItem;
}