'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const Receipt = Sequelize.define("Receipt", {
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
		packageId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		price: {
			type: DataTypes.DOUBLE,
			defaultValue: 0.0
		},
		status: {
			// 0: Not refunded
			// 1: Refunded
			type: DataTypes.INTEGER
		}
	}, {
		hooks: {
			beforeCreate: (receiptObj, options) => {
				receiptObj.dataValues.id = crypto.SHA256(receiptObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return receiptObj;
			}
		}
	});
	
	Receipt.associate = ({}) => {
		// associations can be defined here
	};
	
	return Receipt;
}