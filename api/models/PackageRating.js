'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageRating = Sequelize.define("PackageRating", {
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
		packageVersionId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		packageReviewId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		value: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
			validate: { min: 1, max: 5 }
		},
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		}
	}, {
		hooks: {
			beforeCreate: (reviewObj, options) => {
				reviewObj.dataValues.id = crypto.SHA256(reviewObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);

				return reviewObj;
			}
		}
	});
	
	PackageRating.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageRating;
}