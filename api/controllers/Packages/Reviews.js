const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");

/**
 * GET /packages/reviews
 * 
 * Gets a list of all Package Reviews, limited to own Reviews (User), Reviews of owned Packages (Developer) or all Reviews (>= Moderator)
 */
router.get("/reviews", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;

	let packageReviewList = await PackageReview.findAll({
		attributes: {
			exclude: ["deviceId"]
		},
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
			attributes: {
				exclude: ["id", "udid", "variant", "capacity"]
			},
			as: "device"
		}]
	});
	
	if (!packageReviewList || !packageReviewList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: "Could not find any reviews"
	});

	let packageReviewData = packageReviewList;

	if (account.role < UserRole.DEVELOPER) {
		packageReviewData = packageReviewList.filter(packageReviewObj => packageReviewObj.accountId == account.id);
	} else if (account.role < UserRole.MODERATOR) {
		let packageList = await Package.findAll({
			where: {
				accountId: account.id
			}
		});

		packageReviewData = packageReviewList.filter(packageReviewObj => {
			return packageReviewObj.accountId == account.id || packageList.map(packageObj => packageObj.id).includes(packageReviewObj.packageId);
		});
	}

	if (!packageReviewData || !packageReviewData.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: "Could not find any reviews"
	});

	return res.status(httpStatus.OK).send(packageReviewData);
});



/**
 * GET /packages/:packageId/reviews
 * 
 * Gets a list of every Review associated to a specified Package
 */
router.get("/:packageId/reviews", async (req, res) => {
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewList = await PackageReview.findAll({
		where: {
			packageId: packageObj.id
		},
		attributes: {
			exclude: ["deviceId"]
		},
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
			attributes: {
				exclude: ["id", "udid", "variant", "capacity"]
			},
			as: "device"
		}]
	});
		
	if (!packageReviewList || !packageReviewList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any reviews`
	});

	return res.status(httpStatus.OK).send(packageReviewList);
});

/**
 * POST /packages/:packageId/reviews/new
 * 
 * Creates a new Review and associates it to a specified Package
 */
router.post("/:packageId/reviews/new", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageVersion, PackageReview, PackageReviewMessage, PackageRating, LogItem } = req.models;

	const reviewData = req.body;

	if (!reviewData.title || !reviewData.text || !reviewData.value) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "Review title, text or rating value missing"
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	if (packageObj.accountId == account.id) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "Package developers cannot add a review to their own package"
	});

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			visible: true
		},
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "DESC"]]
	});
		
	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any versions`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			accountId: account.id
		}
	});
			
	if (packageReviewObj) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "User did already review this package"
	});

	return PackageReview.create(Object.assign(reviewData, {
		id: String.prototype.concat(packageVersionObj.packageId, packageVersionObj.id, new Date().getTime()),
		packageId: packageVersionObj.packageId,
		packageVersionId: packageVersionObj.id,
		accountId: account.id
	})).then(packageReviewObj => {
		PackageReviewMessage.create(Object.assign(reviewData, {
			id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.packageVersionId, packageReviewObj.id, Math.random(), new Date().getTime()),
			packageId: packageReviewObj.packageId,
			packageVersionId: packageReviewObj.packageVersionId,
			packageReviewId: packageReviewObj.id,
			fromDeveloper: account.id == packageVersionObj.accountId,
			accountId: account.id
		}));

		PackageRating.create(Object.assign(reviewData, {
			id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.packageVersionId, packageReviewObj.id, Math.random(), new Date().getTime()),
			packageId: packageReviewObj.packageId,
			packageVersionId: packageReviewObj.packageVersionId,
			packageReviewId: packageReviewObj.id,
			accountId: account.id
		}));

		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewObj.id,
			detailText: `User ${account.username} <${account.email}> created review ${packageReviewObj.id}`,
			status: 2
		});

		return res.status(httpStatus.OK).send(packageReviewObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/reviews/:reviewId
 * 
 * Gets a specific Review of a specified Package
 */
router.get("/:packageId/reviews/:reviewId", async (req, res) => {
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		},
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			id: req.params.reviewId,
			packageId: packageObj.id
		},
		attributes: {
			exclude: ["deviceId"]
		},
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
			attributes: {
				exclude: ["id", "udid", "variant", "capacity"]
			},
			as: "device"
		}]
	});
		
	if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
	});

	return res.status(httpStatus.OK).send(packageReviewObj);
});

/**
 * DELETE /packages/:packageId/reviews/:reviewId
 * 
 * Deletes a specific Review associated to a specified Package
 * Reviews can only be deleted by their creator, the Package Developer or a User with a Moderator role or higher
 */
router.delete("/:packageId/reviews/:reviewId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, LogItem } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			id: req.params.reviewId,
			packageId: packageObj.id,
		}
	});
		
	if (account.id != packageObj.accountId &&	// Developer
		account.id != packageReviewObj.accountId &&	// Review Author
		account.role < UserRole.MODERATOR) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	return packageReviewObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewObj.id,
			detailText: `User ${account.username} <${account.email}> deleted review ${packageReviewObj.id}`,
			status: 2
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * POST /packages/:packageId/reviews/:reviewId/message
 * 
 * Adds a new Message to a specific Review associated to a specified Package
 * Messages can only be added by the Review creator or the Package Developer
 */
router.post("/:packageId/reviews/:reviewId/message", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	const reviewData = req.body;

	if (!reviewData || !reviewData.text || !reviewData.text.length) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			id: req.params.reviewId,
			packageId: packageObj.id,
		}
	});
		
	if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
	});

	if (account.id != packageObj.accountId &&	// Developer
		account.id != packageReviewObj.accountId &&	// Review Author
		account.role < UserRole.MODERATOR) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	return PackageReviewMessage.create(Object.assign(reviewData, {
		id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.packageVersionId, packageReviewObj.id, new Date().getTime()),
		packageId: packageReviewObj.packageId,
		packageVersionId: packageReviewObj.packageVersionId,
		packageReviewId: packageReviewObj.id,
		fromDeveloper: account.id == packageObj.accountId,
		accountId: account.id
	})).then(packageReviewObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_MESSAGE_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewObj.id,
			detailText: `User ${account.username} <${account.email}> added message to review ${packageReviewObj.id}`,
			status: 2
		});

		return res.status(httpStatus.OK).send(packageReviewObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/reviews/:reviewId/:messageId
 * 
 * Updates a Message of a specific Review associated to a specified Package
 * Messages can only be updated by their creator
 */
router.put("/:packageId/reviews/:reviewId/:messageId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, PackageReviewMessage } = req.models;
	const reviewData = req.body;

	if (!reviewData || !reviewData.text) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			id: req.params.reviewId,
			packageId: packageObj.id,
		}
	});
		
	if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
	});

	if (account.id != packageReviewObj.accountId) return res.status(httpStatus.FORBIDDEN).send({
		name: httpStatus[httpStatus.FORBIDDEN],
		code: httpStatus.FORBIDDEN,
		message: "You are not allowed to perform this action"
	});

	let reviewMessageObj = await PackageReviewMessage.findOne({
		where: {
			id: req.params.messageId,
			packageId: packageReviewObj.packageId,
			packageReviewId: packageReviewObj.id
		}
	});
			
	if (!reviewMessageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Review ${req.params.reviewId} does not have any review with identifier ${req.params.messageId}`
	});

	return reviewMessageObj.update({
		text: reviewData.text
	}).then(packageReviewObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_MESSAGE_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewObj.id,
			detailText: `User ${account.username} <${account.email}> edited message ${reviewMessageObj.id} of review ${packageReviewObj.id}`,
			status: 2
		});

		return res.status(httpStatus.OK).send(packageReviewObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/reviews/:reviewId/:messageId
 * 
 * Deletes a Message of a specific Review associated to a specified Package
 * Messages can only be deleted by their creator, the Package Developer or a User with a Moderator role or higher
 */
router.delete("/:packageId/reviews/:reviewId/:messageId", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});

	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	const reviewData = req.body;

	if (!reviewData || !reviewData.text) return res.status(httpStatus.BAD_REQUEST).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageReviewObj = await PackageReview.findOne({
		where: {
			id: req.params.reviewId,
			packageId: packageObj.id,
		}
	});
		
	if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
	});

	if (account.id != packageObj.accountId &&	// Developer
		account.id != packageReviewObj.accountId &&	// Review Author
		account.role < UserRole.MODERATOR) {
		return res.status(httpStatus.FORBIDDEN).send({
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		});
	}

	let reviewMessageObj = await PackageReviewMessage.findOne({
		where: {
			id: req.params.messageId,
			packageId: packageReviewObj.packageId,
			packageReviewId: packageReviewObj.id
		}
	});
			
	if (!reviewMessageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Review ${req.params.reviewId} does not have any review with identifier ${req.params.messageOd}`
	});

	return reviewMessageObj.destroy().then(() => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_MESSAGE_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewObj.id,
			detailText: `User ${account.username} <${account.email}> deleted message ${reviewMessageObj.id} of review ${packageReviewObj.id}`,
			status: 2
		});

		return res.status(httpStatus.OK).send({
			name: httpStatus[httpStatus.OK],
			code: httpStatus.OK
		});
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/versions/latest/reviews
 * 
 * Gets a list of every Review associated to the latest Version of a specified Package
 */
router.get("/:packageId/versions/latest/reviews", async (req, res) => {
	const { Package, PackageVersion, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			packageId: packageObj.id,
			visible: true
		},
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "DESC"]]
	});

	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any versions`
	});

	let packageReviewList = await PackageReview.findAll({
		where: {
			packageId: packageVersionObj.packageId,
			packageVersionId: packageVersionObj.id
		},
		attributes: {
			exclude: ["deviceId"]
		},
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
			attributes: {
				exclude: ["id", "udid", "variant", "capacity"]
			},
			as: "device"
		}]
	});
		
	if (!packageReviewList || !packageReviewList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any reviews`
	});

	return res.status(httpStatus.OK).send(packageReviewList);
});

/**
 * GET /packages/:packageId/versions/:versionId/reviews
 * 
 * Gets a list of every Review associated to a specific Version of a specified Package
 */
router.get("/:packageId/versions/:versionId/reviews", async (req, res) => {
	const { Package, PackageVersion, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;

	let packageObj = await Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `No package with identifier ${req.params.packageId} found`
	});

	let packageVersionObj = await PackageVersion.findOne({
		where: {
			id: req.params.versionId,
			packageId: packageObj.id,
			visible: true
		},
		attributes: { exclude: ["fileData"] },
		order: [["createdAt", "DESC"]]
	});

	if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any versions`
	});

	let packageReviewList = await PackageReview.findAll({
		where: {
			packageId: packageVersionObj.packageId,
			packageVersionId: packageVersionObj.id
		},
		attributes: {
			exclude: ["deviceId"]
		},
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
			attributes: {
				exclude: ["id", "udid", "variant", "capacity"]
			},
			as: "device"
		}]
	});
		
	if (!packageReviewList || !packageReviewList.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.NOT_FOUND],
		code: httpStatus.NOT_FOUND,
		message: `Package ${req.params.packageId} does not have any reviews`
	});

	return res.status(httpStatus.OK).send(packageReviewList);
});

module.exports = router;