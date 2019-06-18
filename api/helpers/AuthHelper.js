const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
	const { Account } = req.models;
	
	const authHeader = req.headers["authorization"];
	let authToken = authHeader ? authHeader.split(" ")[1] : undefined;
	
	if ((!authToken || typeof authToken === "undefined") && req.cookies["authToken"]) {
		authToken = req.cookies["authToken"];
	}
	
	if (!authToken) resolve(next());
	
	let promise = new Promise((resolve, reject) => {
		jwt.verify(authToken, JWT_SECRET, async (error, decoded) => {
			if (error|| !decoded) return resolve(next());
			
			let accountObj = await Account.findOne({
				where: {
					id: String(decoded.userId)
				},
				attributes: ["id", "username", "email", "role", [Sequelize.fn("COUNT", Sequelize.col("profileImage")), "profileImage"], "lastLogin", "createdAt"]
			});
			
			if (accountObj && accountObj.id) {
				req.account = accountObj;
			}
			
			return resolve(next());
		});
	});
	return promise;
}