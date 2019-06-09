'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const Request = Sequelize.define("Request", {
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		type: {
			type: DataTypes.INTEGER,
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
		status: {
			// -1: Not reviewed
			// 0: Accepted
			// 1: Rejected
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
			beforeCreate: (requestObj, options) => {
				requestObj.dataValues.id = crypto.SHA256(requestObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return requestObj;
			}
		}
	});
	
	Request.associate = ({}) => {
		// associations can be defined here
	};
	
	return Request;
}