const { UserRole } = require("./Enumerations");

module.exports = (req, res, next) => {
	const { Device, PackageRating, PackageReview, PackageReviewMessage, PackageScreenshot, PackageVersion } = req.models;

	// Define various includes that the user can embed using the "include" GET parameter
	const includes = {
		ratings: {
			model: PackageRating,
			as: "ratings",
			where: (req.query.rating || {}).filter(["id"]),
			separate: true
		},
		reviews: {
			model: PackageReview,
			as: "reviews",
			where: (req.query.review || {}).filter(["id"]),
			separate: true,
			attributes: { exclude: ["deviceId"] },
			order: [["createdAt", "DESC"]],
			include: [{
				model: PackageReviewMessage,
				as: "messages",
				separate: true,
				order: [["createdAt", "ASC"]]
			}, {
				model: PackageRating,
				as: "rating"
			}, {
				model: Device,
				as: "device",
				attributes: {
					exclude: ["id", "udid", "variant", "capacity"]
				}
			}]
		},
		screenshots: {
			model: PackageScreenshot,
			as: "screenshots",
			where: (req.query.screenshot || {}).filter(["id","screenClass","width","height"]),
			separate: true,
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "ASC"]]
		},
		versions: {
			model: PackageVersion,
			as: "versions",
			where: Object.assign((req.query.version || {}).filter(["id", "version"]), 
				req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					visible: true
				}
			),
			separate: true,
			order: [["createdAt", "DESC"]]
		}
	};

	if (req.query && req.query.include) {
		req.includes = req.query.include.split(",").map(include => includes[include.toLowerCase()]).filter(Boolean);
	} else {
		req.includes = [];
	}

	return next();
}