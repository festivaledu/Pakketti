/**
 * The DeviceLinkNonce model represents keys (otherwise referenced as "nonces") that are automatically generated when a user links an iOS device. This is required so device links can be differentiated and devices can initiate only one link process at a time.
 * This implementation is inspired by Packix, created by Andrew Wiik
 * 
 * @class		DeviceLinkNonce
 * @file 		This file defines the DeviceLinkNonce model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const DeviceLinkNonce = Sequelize.define("DeviceLinkNonce", {
		/**
		 * The internal unique DeviceLinkNonce ID 
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The device owner's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} deviceLinkObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (deviceLinkObj, options) => {
				deviceLinkObj.dataValues.id = crypto.SHA256(deviceLinkObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);

				return deviceLinkObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	DeviceLinkNonce.associate = ({ Account }) => {
		// A Package belongs to a single Account (n-1)
		DeviceLinkNonce.belongsTo(Account, {
			foreignKey: "accountId",
			onDelete: "CASCADE"
		});
	};
	
	return DeviceLinkNonce;
}