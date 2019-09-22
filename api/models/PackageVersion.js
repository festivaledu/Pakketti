/**
 * The PackageVersion model defines the internal structure of Package Versions.
 * 
 * @class		PackageVersion
 * @file 		This file defines the PackageVersion model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

 'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const PackageVersion = sequelize.define('PackageVersion', {
		/**
		 * The internal unique Pacakge Version ID 
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
		 * The Package creator's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The type of this version. Can be "full", "combo" or "delta". Only "full" packages are shown in the storefront
		 */
		packageType: { // full, combo, delta
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "full"
		},
		
		/**
		 * The Version number (eg. 1.3)
		 */
		version: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * This text explains what changed in this Version. Release versions always display "Initial release"
		 */
		changeText: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: "Initial release"
		},
		
		/**
		 * Controls the visibility (downloadability) of this Version
		 */
		visible: DataTypes.BOOLEAN,
		
		/**
		 * The number of times this Version has been downloaded
		 */
		downloadCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		
		/**
		 * A list of dependencies for this Version. Dependencies are only important for the APT (DPKG) aspect of this repo, but can also be used for other platforms
		 */
		depends: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {}
		},
		
		/**
		 * A list of conflicts for this Version. Conflicts are only important for the APT (DPKG) aspect of this repo, but can also be used for other platforms
		 */
		conflicts: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {}
		},
		
		/**
		 * The name of the file to download
		 */
		filename: {
			type: DataTypes.STRING,
			allowNull: false
		},

		/**
		 * The MIME type of the downloadable file
		 * The MIME type is used when requesting a file and is then added to the Content-Type response header
		 */
		fileMime: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The MD5 Checksum of the downloadable file
		 */
		md5sum: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		
		/**
		 * The SHA1 Checksum of the downloadable file
		 */
		sha1: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The SHA256 Checksum of the downloadable file
		 */
		sha256: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The size of the downloadable file
		 */
		size: {
			type: DataTypes.INTEGER
		},
		
		/**
		 * The size of the extracted file contents
		 */
		installedSize: {
			type: DataTypes.INTEGER
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} packageVersionObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (packageVersionObj, options) => {
				packageVersionObj.dataValues.id = crypto.SHA256(packageVersionObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageVersionObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	PackageVersion.associate = ({ Account, PackageReview, PackageRating }) => {
		PackageVersion.belongsTo(Account, {
			foreignKey: "accountId",
			onDelete: "CASCADE"
		});
		
		// A Package can have many Reviews (1-n)
		PackageVersion.hasMany(PackageReview, {
			as: "reviews",
			foreignKey: "packageVersionId",
			onDelete: "CASCADE",
		});
		
		// A Package can have many Ratings (1-n=
		PackageVersion.hasMany(PackageRating, {
			as: "ratings",
			foreignKey: "packageVersionId",
			onDelete: "CASCADE"
		});
	};
	
	return PackageVersion;
};