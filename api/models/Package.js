/**
 * The Package model stores every important aspect of a packaget in the database, like bundle identifier or the display name.
 * 
 * @class		Package
 * @file 		This file defines the Package model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (sequelize, DataTypes) => {
	const Package = sequelize.define('Package', {
		/**
		 * The internal unique Package ID
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The publically visible display name of this Package
		 */
		name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The bundle identifier of this Package, which should be using the Reverse Domain Name notation
		 */
		identifier: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The Short Description is used on the storefront and inside Cydia as a subtitle
		 */
		shortDescription: {
			type: DataTypes.STRING,
			// allowNull: false,
			defaultValue: ""
		},
		
		/**
		 * The Detailed Description explains a Package's purpose in detail. Can also support HTML and Markdown
		 */
		detailedDescription: {
			type: DataTypes.TEXT,
			// allowNull: false
			defaultValue: ""
		},
		
		/**
		 * The platform this Package is designed for
		 */
		platform: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		
		/**
		 * The architecture this Package was designed for
		 */
		architecture: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		
		/**
		 * The minimum required operating system version
		 */
		minOSVersion: {
			type: DataTypes.STRING
		},
		
		/**
		 * The maximum supported operating system version
		 */
		maxOSVersion: {
			type: DataTypes.STRING
		},
		
		/**
		 * The category to sort this Package in
		 */
		section: {
			type: DataTypes.STRING,
		},
		
		/**
		 * The device families this Package supports
		 * 1: Phone
		 * 2: Tablet
		 * 4: Desktop
		 * 8: TV
		 */
		deviceFamilies: {
			type: DataTypes.INTEGER
		},
		
		/**
		 * The Package creator's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The visibility (downloadability) of this Package
		 */
		visible: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		
		/**
		 * The current status of this Package. Represents the progress of the submission process
		 */
		status: {
			// 0: Submission incomplete
			// 1: Submission complete
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		
		/**
		 * The binary data of a Package's icon
		 */
		icon: {
			type: DataTypes.BLOB,
			// allowNull: false
		},
		
		/**
		 * The MIME type of a Package's icon.
		 * The MIME type is used when requesting a Packages's icon and is then added to the Content-Type response header.
		 */
		iconMime: {
			type: DataTypes.STRING
		},
		
		/**
		 * The binary data of a Package's header image
		 * Header images should be 1920x1080
		 */
		headerImage: {
			type: DataTypes.BLOB
		},
		
		/**
		 * The MIME type of a Package's header image.
		 * The MIME type is used when requesting a Packages's header image and is then added to the Content-Type response header.
		 */
		headerImageMime: {
			type: DataTypes.STRING
		},
		
		/**
		 * The URL people should report issues to (eg. a GitHub repository)
		 */
		issueURL: {
			type: DataTypes.TEXT
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} packageObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (packageObj, options) => {
				packageObj.dataValues.id = crypto.SHA256(packageObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return packageObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	Package.associate = ({ Account, PackageRating, PackageReview, PackageVersion, PackageScreenshot }) => {
		// A Package belongs to a single Account (n-1)
		Package.belongsTo(Account, {
			foreignKey: "accountId",
			onDelete: "CASCADE"
		});
		
		Package.hasMany(PackageRating, {
			as: "ratings",
			foreignKey: "packageId",
			onDelete: "CASCADE",
		});
		
		Package.hasMany(PackageReview, {
			as: "reviews",
			foreignKey: "packageId",
			onDelete: "CASCADE",
		});
		
		// A Package can have many Versions (1-n)
		Package.hasMany(PackageVersion, {
			foreignKey: "packageId",
			as: "versions",
			onDelete: "CASCADE"
		});
		
		// A Package can have many Screenshots (1-n)
		Package.hasMany(PackageScreenshot, {
			foreignKey: "packageId",
			as: "screenshots",
			onDelete: "CASCADE"
		});
	};
	
	return Package;
};