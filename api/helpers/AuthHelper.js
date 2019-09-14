const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");

const { UserRole } = require("./Enumerations");
const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
	const { Account } = req.models;
	
	let promise = new Promise(async (resolve, reject) => {
		const developerHeader = req.headers["x-pakketti-developer"];
		let developerToken = developerHeader ? developerHeader.split(" ")[1] : undefined;
		
		if (developerToken) {
			let developerAccountObj = await Account.findOne({
				where: {
					id: developerToken,
					role: {
						[Sequelize.Op.gte]: UserRole.DEVELOPER
					}
				}
			});
			
			if (developerAccountObj) {
				req.developer = developerAccountObj;
			}
		}
		
		const authHeader = req.headers["authorization"];
		let authToken = authHeader ? authHeader.split(" ")[1] : undefined;
		
		if ((!authToken || typeof authToken === "undefined") && req.cookies["authToken"]) {
			authToken = req.cookies["authToken"];
		}
		
		if (!authToken) return resolve(next());
	
	
		jwt.verify(authToken, JWT_SECRET, async (error, decoded) => {
			if (error|| !decoded) return resolve(next());
			
			let accountObj = await Account.findOne({
				where: {
					id: String(decoded.userId)
				},
				attributes: ["id", "username", "email", "role", "profileImageMime", "lastLogin", "createdAt"]
			});
			
			if (accountObj && accountObj.id) {
				req.account = accountObj;
			}
			
			return resolve(next());
		});
	});
	return promise;
}