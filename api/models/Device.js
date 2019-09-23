/**
 * The Device model is the database representation of iOS (and probably other) devices a user linked to his account. It contains attributes like device identifier, OS version and even chassis color
 * 
 * @class		Device
 * @file 		This file defines the Device model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const Device = Sequelize.define("Device", {
		/**
		 * The internal unique Device ID 
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The device's assigned name, if available
		 */
		name: {
			type: DataTypes.STRING
		},
		
		/**
		 * The device's product identifier (eg. in case of Apple devices: iPhone8,1) or a device's marketing name, if available
		 */
		product: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/** The Platform a device belongs to, eg. iphoneos-arm or win32_x64 */
		platform: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		
		/**
		 * The OS version (build number) a device was running at the time of enrollment, which can be edited later on.
		 */
		version: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The device's serial number or UDID. Originally only used for iOS devices (hence the "UDID" name), the Device model can also contain devices of other platforms.
		 */
		udid: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		
		/** 
		 * The Variant attribute defines which artwork to use for linked iOS devices. Other platforms currently do not support variants.
		 */
		variant: {
			type: DataTypes.STRING
		},
		
		/** 
		 * The capacity of a linked mobile device.
		 */
		capacity: {
			type: DataTypes.INTEGER
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
			 * @param {Object} deviceObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (deviceObj, options) => {
				deviceObj.dataValues.id = crypto.SHA256(deviceObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);

				return deviceObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	Device.associate = ({ Account }) => {
		Device.belongsTo(Account, {
			foreignKey: "accountId",
			onDelete: "CASCADE"
		});
	};
	
	return Device;
}