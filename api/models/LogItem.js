/**
 * The LogItem model stores internal events (such as user logins), moderation logs (role downgrades) and user requests (like refunds) in the database.
 * 
 * @class		LogItem
 * @file 		This file defines the LogItem model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const LogItem = Sequelize.define("LogItem", {
		/**
		 * The internal unique LogItem ID
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The type of this Log Item
		 * @see Enumerations The available LogItem types are defined as an enumeration
		 */
		type: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		
		/**
		 * The Log Item creator's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The Account that is affected by this Log Item, if any
		 */
		affectedAccountId: {
			type: DataTypes.STRING(32)
		},
		
		/**
		 * The Package that is affected by this Log Item, if any
		 */
		affectedPackageId: {
			type: DataTypes.STRING(32)
		},
		
		/**
		 * The Package Review that is affected by this Log Item, if any
		 */
		affectedReviewId: {
			type: DataTypes.STRING(32)
		},
		
		/**
		 * The Device that is affected by this Log Item, if any
		 */
		affectedDeviceId: {
			type: DataTypes.STRING(32)
		},
		
		/**
		 * The Detail Text is used to further explain the purpose of this Log Item
		 */
		detailText: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		
		/**
		 * The Status represents the review status of a Log Item. Log Items with status 2 are automatically created by the API as an event Log Item
		 */
		status: {
			// -1: Not reviewed
			// 0: Accepted
			// 1: Rejected
			// 2: Used as log
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		
		/**
		 * The Status Text explains why the manual review accepted or rejected this Log Item
		 */
		statusText: {
			type: DataTypes.TEXT
		},
		
		/**
		 * The reviewer's Account ID
		 */
		reviewedBy: {
			type: DataTypes.STRING(32)
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} logItemObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (logItemObj, options) => {
				logItemObj.dataValues.id = crypto.SHA256(logItemObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return logItemObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	LogItem.associate = ({}) => {
		// associations can be defined here
	};
	
	return LogItem;
}