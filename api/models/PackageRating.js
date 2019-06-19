/**
 * The PackageRating model defines important attributes for Ratings associated to Package Reviews.
 * 
 * @class		PackageRating
 * @file 		This file defines the PackageRating model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageRating = Sequelize.define("PackageRating", {
		/**
		 * The internal unique Package Rating ID 
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
		 * The associated PackageReview instance
		 */
		packageReviewId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		
		/**
		 * The value of a Rating in stars, ranging from 1-5
		 */
		value: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
			validate: { min: 1, max: 5 }
		},
		
		/**
		 * The Review creator's Account ID
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
	PackageRating.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageRating;
}