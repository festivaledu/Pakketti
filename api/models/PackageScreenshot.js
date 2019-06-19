/**
 * The PackageScreenshot model defines the internal structure of Package Screenshot metadata objects. Actual screenshot files are served via Apache
 * 
 * @class		Account
 * @file 		This file defines the Account model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const PackageScreenshot = sequelize.define('PackageScreenshot', {
		/**
		 * The internal unique Screenshot ID 
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The associated Package instance
		 */
		packageId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The Screen Class of a Screenshot, generated from width and height at 1x resolution (eg 375w-736h)
		 * The Screen Class is used to display appropriate Screenshots on a screen of the same or equal class (eg. same aspect ratio)
		 */
		screenClass: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The physical image width of the Screenshot
		 */
		width: DataTypes.INTEGER,
		
		/**
		 * The physical image height of the Screenshot
		 */
		height: DataTypes.INTEGER,
		
		/**
		 * The MIME type of a Screenshot
		 * The MIME type is used when requesting a Screenshot and is then added to the Content-Type response header
		 */
		fileMime: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The SHA256 checksum of a Screenshot, used to differentiate created and existing Screenshots after creation
		 */
		sha256: { 
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		}
	}, {
		hooks: {
			/**
			 * Iterate through a list of instances and hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} packageScreenshotList A list of instances to iterate through
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeBulkCreate: (packageScreenshotList, options) => {
				packageScreenshotList.forEach(packageScreenshotObj => {
					packageScreenshotObj.dataValues.id = crypto.SHA256(packageScreenshotObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				});
				
				return packageScreenshotList;
			},
			
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} packageScreenshotObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (packageScreenshotObj, options) => {
				packageScreenshotObj.dataValues.id = crypto.SHA256(packageScreenshotObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageScreenshotObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	PackageScreenshot.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageScreenshot;
};