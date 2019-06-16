const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { LogItemType } = require("../../helpers/Enumerations");

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

const getRatings = (_ratings, ratings) => {
	ratings.forEach(rating => {
		_ratings.ratings[rating.value - 1].count += 1;
		_ratings.total += 1;
	});

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
 * GET /packages/:packageId/ratings
 */
router.get("/:packageId/ratings", (req, res) => {
	const { Package, PackageVersion, PackageRating } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		},
		include: {
			model: PackageVersion,
			as: "versions",
			where: {
				visible: true
			},
			attributes: { exclude: ["fileData"] },
			include: {
				model: PackageRating,
				as: "ratings"
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any versions`
		});

		let ratings = emptyRatingsObject();
		packageObj.versions.forEach(version => {
			ratings = getRatings(ratings, version.ratings);
		});

		return res.status(httpStatus.OK).send(ratings);
	});
});

/**
 * GET /packages/:packageId/versions/latest/ratings
 */
router.get("/:packageId/versions/latest/ratings", (req, res) => {
	const { Package, PackageVersion, PackageRating } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				visible: true
			},
			include: {
				model: PackageRating,
				as: "ratings"
			},
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any versions`
		});

		let ratings = getRatings(emptyRatingsObject(), packageVersionObj.ratings);

		return res.status(httpStatus.OK).send(ratings);
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/versions/:versionId/ratings
 */
router.get("/:packageId/versions/:versionId/ratings", (req, res) => {
	const { Package, PackageVersion, PackageRating } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		return PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				[Sequelize.Op.or]: {
					id: req.params.versionId,
					version: req.params.versionId
				},
				visible: true
			},
			include: {
				model: PackageRating,
				as: "ratings"
			},
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have a version ${req.params.versionId}`
		});

		let ratings = getRatings(emptyRatingsObject(), packageVersionObj.ratings);

		return res.status(httpStatus.OK).send(ratings);
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/reviews/:reviewId/rating
 */
router.get("/:packageId/reviews/:reviewId/rating", (req, res) => {
	const { Package, PackageReview, PackageRating } = req.models;

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		return PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			},
			include: {
				model: PackageRating,
				as: "rating"
			},
		});
	}).then(packageReviewObj => {
		if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any review with id ${req.params.reviewId}`
		});

		return res.status(httpStatus.OK).send(packageReviewObj.rating);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/reviews/:reviewId/rating
 */
router.put("/:packageId/reviews/:reviewId/rating", (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, PackageRating, LogItem } = req.models;
	const ratingData = req.body;

	if (!ratingData || isNaN(ratingData.value)) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Invalid or no rating data specified"
	});

	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			}
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});

		return PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			},
			include: {
				model: PackageRating,
				as: "rating"
			},
		});
	}).then(packageReviewObj => {
		if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any review with id ${req.params.reviewId}`
		});

		if (packageReviewObj.accountId != account.id) {
			return res.status(httpStatus.FORBIDDEN).send({
				name: httpStatus[httpStatus.FORBIDDEN],
				code: httpStatus.FORBIDDEN,
				message: "You are not allowed to perform this action"
			});
		}

		packageReviewObj.rating.update({
			value: ratingData.value
		}).then(packageRatingObj => {
			LogItem.create({
				id: String.prototype.concat(new Date().getTime, Math.random()),
				type: LogItemType.REVIEW_EDITED,
				accountId: account.id,
				affectedPackageId: packageObj.id,
				affectedReviewId: packageReviewObj.id,
				detailText: `User ${account.username} <${account.email}> edited rating value of review ${packageReviewObj.id} to ${ratingData.value}`,
				status: 2
			});

			return res.status(httpStatus.OK).send(packageRatingObj);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;