'use strict';

const crypto = require("crypto-js");

module.exports = (Sequelize, DataTypes) => {
	const PackageReview = Sequelize.define("PackageReview", {
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
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		accountId: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		deviceId: {
			type: DataTypes.STRING(32)
		}
	}, {
		hooks: {
			beforeCreate: (reviewObj, options) => {
				reviewObj.dataValues.id = crypto.SHA256(reviewObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);

				return reviewObj;
			}
		}
	});
	
	PackageReview.associate = ({ Device, PackageReviewMessage, PackageRating }) => {
		PackageReview.belongsTo(Device, {
			foreignKey: "deviceId",
			as: "device",
			onDelete: "CASCADE"
		});
		
		PackageReview.hasMany(PackageReviewMessage, {
			foreignKey: "packageReviewId",
			as: "messages",
			onDelete: "CASCADE"
		});
		
		PackageReview.hasOne(PackageRating, {
			foreignKey: "packageReviewId",
			as: "rating",
			onDelete: "CASCADE"
		});
	}
	
	return PackageReview;
}