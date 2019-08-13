/**
 * The Receipt model defines the internal structure of Receipts that are created when a User downloads a Package for the first time, or has purchased a paid Package.
 * 
 * @class		Receipt
 * @file 		This file defines the Receipt model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const Receipt = Sequelize.define("Receipt", {
		/**
		 * The internal unique Receipt ID 
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The recipient's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The downloaded or purchased Package ID
		 */
		packageId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The price a User was charged for purchasing a Package. Price changes won't affect a Receipt's stored price
		 */
		price: {
			type: DataTypes.DOUBLE,
			defaultValue: 0.0
		},
		
		/**
		 * The currency a User was charged a price in
		 */
		currency: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * Reflects the status of a submitted Refund
		 */
		status: {
			// 0: Not refunded
			// 1: Refunded
			type: DataTypes.INTEGER
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} receiptObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (receiptObj, options) => {
				receiptObj.dataValues.id = crypto.SHA256(receiptObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return receiptObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	Receipt.associate = ({}) => {
		// associations can be defined here
	};
	
	return Receipt;
}