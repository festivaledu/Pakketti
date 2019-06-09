'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageReviewMessage = Sequelize.define("PackageReviewMessage", {
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
			type: DataTypes.STRING,
			allowNull: false
		},
		packageReviewId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		text: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		fromDeveloper: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
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
	
	PackageReviewMessage.associate = ({}) => {
		// associations can be defined here
	};
	
	return PackageReviewMessage;
}