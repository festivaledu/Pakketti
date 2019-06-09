'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const Package = sequelize.define('Package', {
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		identifier: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		shortDescription: {
			type: DataTypes.STRING,
			allowNull: false
		},
		detailedDescription: {
			type: DataTypes.STRING,
			allowNull: false
		},
		platform: {
			type: DataTypes.STRING,
			allowNull: false
		},
		architecture: {
			type: DataTypes.STRING,
			allowNull: false
		},
		minOSVersion: {
			type: DataTypes.STRING,
			allowNull: false
		},
		maxOSVersion: {
			type: DataTypes.STRING
		},
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		visible: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		icon: {
			type: DataTypes.BLOB,
			// allowNull: false
		},
		iconMime: {
			type: DataTypes.STRING
		},
		// screenshots: {
		// 	type: DataTypes.JSON,
		// 	allowNull: false,
		// 	defaultValue: {}
		// },
		issueURL: {
			type: DataTypes.TEXT
		}
	}, {
		hooks: {
			beforeCreate: (packageObj, options) => {
				packageObj.dataValues.id = crypto.SHA256(packageObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageObj;
			}
		}
	});
	
	Package.associate = ({ Account, PackageVersion, PackageScreenshot }) => {
		Package.belongsTo(Account, {
			foreignKey: "accountId",
			onDelete: "CASCADE"
		});
		
		Package.hasMany(PackageVersion, {
			foreignKey: "packageId",
			as: "versions",
			onDelete: "CASCADE"
		});
		
		Package.hasMany(PackageScreenshot, {
			foreignKey: "packageId",
			as: "screenshots",
			onDelete: "CASCADE"
		});
	};
	
	return Package;
};