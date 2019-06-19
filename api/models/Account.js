/**
 * The Account model stores every important aspect of a user's account in the database, like username, hashed password or even the profile picture.
 * 
 * @class		Account
 * @file 		This file defines the Account model.
 * @author 		Janik Schmidt
 * @copyright 	Copyright 2017-2019 Team FESTIVAL
 */

'use strict';

const crypto = require("crypto-js");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
	const Account = sequelize.define('Account', {
		/**
		 * The internal unique Account ID 
		 */
		id: {
			type: DataTypes.STRING(32),
			primaryKey: true,
			unique: true,
			allowNull: false,
		},
		
		/**
		 * The username is displayed publically on Packages, Reviews etc
		 */
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The E-Mail address is solely used for authentication purposes
		 */
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false
		},
		
		/**
		 * The bcrypt-encrypted SHA512 hash of the password the user used at registration
		 */
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		
		/**
		 * The access level of a user
		 * @see Enumerations The available user roles are defined as an enumeration
		 */
		role: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		
		/**
		 * The binary data of a user's profile image
		 */
		profileImage: {
			type: DataTypes.BLOB
		},
		
		/**
		 * The MIME type of a user's profile image
		 * The MIME type is used when requesting a user's profile image and is then added to the Content-Type response header
		 */
		profileImageMime: {
			type: DataTypes.STRING
		},
		
		/**
		 * The last login date of a user.
		 * This may have been used for statistics once, but now it's a remnant of a distant past.
		 */
		lastLogin: {
			type: DataTypes.DATE
		}
	}, {
		hooks: {
			/**
			 * Hash the concatenated string to generate the instance id
			 * 
			 * @param {Object} accountObj The instance to hook before writing to the database
			 * @param {Object} options An object containing options to create this instance
			 */
			beforeCreate: (accountObj, options) => {
				accountObj.dataValues.id = crypto.SHA256(accountObj.dataValues.id).toString(crypto.enc.Hex).substr(0, 32);
				return accountObj;
			}
		}
	});
	
	/**
	 * Define this model's association to other models
	 */
	Account.associate = ({}) => {
		// associations can be defined here
	};
	
	/**
	 * Check if the supplied username is equal to the instance's username attribute
	 */
	Account.prototype.usernameValid = function(_username) {
		return this.username === _username;
	}
	
	/**
	 * Check if the supplied E-Mail address is equal to the instance's email attribute
	 */
	Account.prototype.emailValid = function(_email) {
		return this.email === _email;
	}
	
	/**
	 * Check if the supplied password matches the instance's password attribute
	 */
	Account.prototype.passwordValid = function(_password) {
		return bcrypt.compareSync(_password, this.password);
	}
	
	return Account;
};