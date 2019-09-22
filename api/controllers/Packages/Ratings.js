const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");

const emptyRatingsObject = () => {
	let _ratings = {
		ratings: (() => {
			let _ratingContainer = [];
			for (var i = 5; i > 0; i--) {
				_ratingContainer.push({
					stars: i,
					count: 0
				});
			}
			return _ratingContainer;
		})(),
		average: 0,
		total: 0
	}

	return _ratings;
}

const getRatings = (_ratings, rating) => {
	// ratings.forEach(rating => {
		_ratings.ratings[5 - rating.value].count += 1;
		_ratings.total += 1;
	// });

	_ratings.average = 0;
	_ratings.ratings.forEach(rating => {
		_ratings.average += (rating.stars * rating.count);
	});

	if (_ratings.total >= 1) {
		_ratings.average = _ratings.average / _ratings.total;
	}

	return _ratings;
}



/**
 * GET /packages/ratings
 * 
 * Gets the Rating values of a specified Package
 */
router.get("/ratings", async (req, res) => {
	let query = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageRating, PackageReview, PackageVersion } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageVersion,
			as: "versions",
			where: Object.assign((req.query.version || {}).filter(["version"]), 
				req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					visible: true
				}
			),
			separate: true,
			order: [["createdAt", "DESC"]],
			include: [{
				model: PackageReview,
				as: "reviews",
				where: (req.query.review || {}).filter(["id"]),
				separate: true,
				attributes: {
					exclude: ["deviceId"]
				},
				order: [["createdAt", "DESC"]],
				include: [{
					model: PackageRating,
					as: "rating"
				}]
			}]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	if (!packageObj.versions.map(v => v.reviews.length).reduce((t, c) => t += c)) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	let ratings = emptyRatingsObject();
	packageObj.versions.forEach(version => {
		version.reviews.forEach(review => {
			ratings = getRatings(ratings, review.rating);
		});
	});

	return res.status(httpStatus.OK).send(ratings);
});

/**
 * PUT /packages/rating
 * 
 * Updates the Rating value of a specified Review 
 */
router.put("/rating", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name", "platform", "architecture", "section"]);
	if (!packageQuery || !Object.keys(packageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	let reviewQuery = (req.query.review || {}).filter(["id"]);
	if (!reviewQuery || !Object.keys(reviewQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package review specified"
		}
	});
	
	const { Package, PackageRating, PackageReview, PackageVersion, LogItem } = req.models;
	let ratingData = req.body;
	
	if (!ratingData || isNaN(ratingData.value)) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Invalid or no rating data specified"
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign(packageQuery || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageVersion,
			as: "versions",
			where: req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
			},
			separate: true,
			order: [["createdAt", "DESC"]],
			include: [{
				model: PackageReview,
				as: "reviews",
				where: reviewQuery,
				separate: true,
				attributes: {
					exclude: ["deviceId"]
				},
				order: [["createdAt", "DESC"]],
				include: [{
					model: PackageRating,
					as: "rating"
				}]
			}]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (!packageObj.versions.map(v => v.reviews.length).reduce((t, c) => t += c)) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	if (packageObj.versions[0].reviews[0].id.accountId != account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return packageObj.versions[0].reviews[0].rating.update({
		value: ratingData.value
	}).then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_EDITED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageObj.versions[0].reviews[0].id,
			detailText: `User ${account.username} <${account.email}> edited rating value of review ${packageObj.versions[0].reviews[0].id} to ${ratingData.value}`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Rating successfully updated"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;