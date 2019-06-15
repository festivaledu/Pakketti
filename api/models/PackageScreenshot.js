'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const PackageScreenshot = sequelize.define('PackageScreenshot', {
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		packageId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		screenClass: {
			type: DataTypes.STRING,
			allowNull: false
		},
		width: DataTypes.INTEGER,
		height: DataTypes.INTEGER,
		// fileData: {
		// 	type: DataTypes.BLOB,
		// 	allowNull: false
		// },
		fileMime: {
			type: DataTypes.STRING,
			allowNull: false
		},
		sha256: { 
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		}
	}, {
		hooks: {
			beforeBulkCreate: (packageScreenshotList, options) => {
				packageScreenshotList.forEach(packageScreenshotObj => {
					packageScreenshotObj.dataValues.id = crypto.SHA256(packageScreenshotObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				});
				
				return packageScreenshotList;
			},
			beforeCreate: (packageScreenshotObj, options) => {
				packageScreenshotObj.dataValues.id = crypto.SHA256(packageScreenshotObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageScreenshotObj;
			}
		}
	});
	
	PackageScreenshot.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageScreenshot;
};