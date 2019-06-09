'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const PackageVersion = sequelize.define('PackageVersion', {
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
		packageType: { // full, combo, delta
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "full"
		},
		version: {
			type: DataTypes.STRING,
			allowNull: false
		},
		changeText: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: "Initial release"
		},
		visible: DataTypes.BOOLEAN,
		downloadCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		depends: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: []
		},
		conflicts: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: []
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// fileData: {
		// 	type: DataTypes.BLOB,
		// 	allowNull: false
		// },
		fileMime: {
			type: DataTypes.STRING,
			allowNull: false
		},
		md5sum: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		sha1: {
			type: DataTypes.STRING,
			allowNull: false
		},
		sha256: {
			type: DataTypes.STRING,
			allowNull: false
		},
		section: {
			type: DataTypes.STRING,
		},
		size: {
			type: DataTypes.INTEGER
		},
		installedSize: {
			type: DataTypes.INTEGER
		}
	}, {
		hooks: {
			beforeCreate: (packageVersionObj, options) => {
				packageVersionObj.dataValues.id = crypto.SHA256(packageVersionObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageVersionObj;
			}
		}
	});
	
	PackageVersion.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageVersion;
};