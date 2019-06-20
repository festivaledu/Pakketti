/**
 * The PackageReview model defines the internal structure of Package reviews.
 * 
 * @class		PackageReview
 * @file 		This file defines the PackageReview model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

 'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageReview = Sequelize.define("PackageReview", {
		/**
		 * The internal unique Review ID 
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
		 * The associated PackageVersion instance
		 */
		packageVersionId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The title of the review
		 */
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		
		/**
		 * The Review creator's Account ID
		 */
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The associated Device instance, if existing
		 */
		deviceId: {
			type: DataTypes.STRING(32)
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} reviewObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (reviewObj, options) => {
				reviewObj.dataValues.id = crypto.SHA256(reviewObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);

				return reviewObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	PackageReview.associate = ({ Device, PackageReviewMessage, PackageRating }) => {
		// A Package Review belongs to a single Device, while a Device can have many associated Reviews (n-1)
		PackageReview.belongsTo(Device, {
			foreignKey: "deviceId",
			as: "device",
			onDelete: "CASCADE"
		});
		
		// A Package Review can have many Review Messages (1-n)
		PackageReview.hasMany(PackageReviewMessage, {
			foreignKey: "packageReviewId",
			as: "messages",
			onDelete: "CASCADE"
		});
		
		// A Package Review can only have a single Rating (1-1)
		PackageReview.hasOne(PackageRating, {
			foreignKey: "packageReviewId",
			as: "rating",
			onDelete: "CASCADE"
		});
	}
	
	return PackageReview;
}