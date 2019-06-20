/**
 * The PackageReviewMessage model defines the internal structure of messages associated to Package reviews.
 * 
 * @class		PackageReviewMessage
 * @file 		This file defines the PackageReviewMessage model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageReviewMessage = Sequelize.define("PackageReviewMessage", {
		/**
		 * The internal unique Review Message ID 
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
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The associated PackageVersionReview instance
		 */
		packageReviewId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The text of this Message. Supports only plain text
		 */
		text: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		
		/** Specifies if this Message comes from the Package Developer */
		fromDeveloper: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		
		/**
		 * The Review Message creator's Account ID
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
	PackageReviewMessage.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageReviewMessage;
}