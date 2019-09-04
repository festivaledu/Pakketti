const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType, LogItemStatus } = require("../../helpers/Enumerations");



/**
 * GET /packages/reviews
 * 
 * Gets a list of all Package Reviews, limited to own Reviews (User), Reviews of owned Packages (Developer) or all Reviews (>= Moderator)
 */
router.get("/reviews", async (req, res) => {
	const { account } = req;
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	let packageList = await Package.findAll({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			where: (req.query.review || {}).filter(["id"]),
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
				as: "device",
				attributes: {
					exclude: ["id", "udid", "variant", "capacity"]
				}
			}]
		}]
	});
	
	if (!packageList || !packageList.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	let packageReviewData = packageList.map(packageObj => packageObj.reviews).reduce((list, obj) => list.concat(obj), []);
	
	if (account) {
		if (account.role < UserRole.DEVELOPER) {
			packageReviewData = packageReviewList.filter(packageReviewObj => packageReviewObj.accountId == account.id);
		} else if (account.role < UserRole.MODERATOR) {
			let _packageList = packageList.filter(packageObj => packageObj.accountId == account.id);
			
			packageReviewData = packageReviewList.filter(packageReviewObj => {
				return packageReviewObj.accountId == account.id || _packageList.map(packageObj => packageObj.id).includes(packageReviewObj.packageId);
			});
		}
	}
	
	res.status(200).send(packageReviewData);
});

/**
 * POST /packages/reviews/new
 * 
 * Creates a new Review and associates it to a specified Package
 */
router.post("/reviews/new", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let query = (req.query.package || {}).filter(["id", "identifier", "name"]);
	if (!query || !Object.keys(query).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No package specified"
		}
	});
	
	const { Package, PackageRating, PackageReview, PackageReviewMessage, PackageVersion, LogItem } = req.models;
	let reviewData = req.body;
	
	if (!reviewData.title || !reviewData.text || !reviewData.value) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Review title, text or rating value missing",
			detail: {
				title: !reviewData.title,
				text: !reviewData.text,
				value: !reviewData.value
			}
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign(query || {},
			req.account && req.account.role >= UserRole.MODERATOR ? {} : {
				visible: true
			},
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			order: [["createdAt", "DESC"]]
		}, {
			model: PackageVersion,
			as: "versions",
			where: Object.assign((req.query.version || {}).filter(["id", "version"]), 
				req.account && req.account.role >= UserRole.MODERATOR ? {} : {
					visible: true
				}
			),
			order: [["createdAt", "DESC"]]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (packageObj.accountId == account.id) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "Package developers cannot add a review to their own package"
		}
	});
	
	if (!packageObj.versions.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package versions"
		}
	});
	
	let packageVersionObj = packageObj.versions[0];
	
	if (packageObj.reviews.find(packageReviewObj => packageReviewObj.accountId == account.id)) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "User did already review this package"
		}
	});
	
	PackageReview.create(Object.assign(reviewData, {
		id: String.prototype.concat(packageObj.id, packageVersionObj.id, new Date().getTime()),
		packageId: packageObj.id,
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
			status: LogItemStatus.LOG_USAGE
		});
		
		return res.status(httpStatus.OK).send(packageReviewObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/review
 * 
 * Deletes a specific Review associated to a specified Package
 * Reviews can only be deleted by their creator, the Package Developer or a User with a Moderator role or higher
 */
router.delete("/review", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name"]);
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
			message: "No review specified"
		}
	});
	
	const { Package, PackageReview, LogItem } = req.models;
	
	let packageObj = await Package.findOne({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.DEVELOPER ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			where: reviewQuery,
			order: [["createdAt", "DESC"]]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (!packageObj.reviews.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	let packageReviewObj = packageObj.reviews[0];
	
	if (account.id != packageObj.accountId &&		// Developer
		account.id != packageReviewObj.accountId &&	// Review Author
		account.role < UserRole.MODERATOR) {		// Moderator
		return res.status(httpStatus.FORBIDDEN).send({
			error: {
				name: httpStatus[httpStatus.FORBIDDEN],
				code: httpStatus.FORBIDDEN,
				message: "You are not allowed to perform this action"
			}
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
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Review successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/review/message
 * 
 * Adds a new Message to a specific Review associated to a specified Package
 * Messages can only be added by the Review creator or the Package Developer
 */
router.post("/review/message", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name"]);
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
			message: "No review specified"
		}
	});
	
	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	let reviewData = req.body;
	
	if (!reviewData || !reviewData.text || !reviewData.text.length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Review text missing"
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.DEVELOPER ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			where: reviewQuery,
			separate: true,
			order: [["createdAt", "DESC"]]
		}]
	});
	
	if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package"
		}
	});
	
	if (!packageObj.reviews || !packageObj.reviews.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	let packageReviewObj = packageObj.reviews[0];
	
	if (account.id != packageObj.accountId &&		// Developer
		account.id != packageReviewObj.accountId) {	// Review Author
		return res.status(httpStatus.FORBIDDEN).send({
			error: {
				name: httpStatus[httpStatus.FORBIDDEN],
				code: httpStatus.FORBIDDEN,
				message: "You are not allowed to perform this action"
			}
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
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(packageReviewObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/review/message
 * 
 * Updates a Message of a specific Review associated to a specified Package
 * Messages can only be updated by their creator
 */
router.put("/review/message", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name"]);
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
			message: "No review specified"
		}
	});
	
	let messageQuery = (req.query.message || {}).filter(["id"]);
	if (!messageQuery || !Object.keys(messageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No review message specified"
		}
	});
	
	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	let reviewData = req.body;
	
	if (!reviewData || !reviewData.text || !reviewData.text.length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Review text missing",
			detail: {
				title: !reviewData.title,
				text: !reviewData.text,
				value: !reviewData.value
			}
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.DEVELOPER ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			where: reviewQuery,
			separate: true,
			include: [{
				model: PackageReviewMessage,
				as: "messages",
				where: messageQuery,
				separate: true,
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
	
	if (!packageObj.reviews || !packageObj.reviews.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	if (!packageObj.reviews[0].messages || !packageObj.reviews[0].messages.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package review messages"
		}
	});
	
	let packageReviewMessageObj = packageObj.reviews[0].messages[0];
	
	if (account.id != packageReviewMessageObj.accountId) return res.status(httpStatus.FORBIDDEN).send({
		error: {
			name: httpStatus[httpStatus.FORBIDDEN],
			code: httpStatus.FORBIDDEN,
			message: "You are not allowed to perform this action"
		}
	});
	
	return packageReviewMessageObj.update({
		text: reviewData.text
	}).then(packageReviewMessageObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_MESSAGE_CREATED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewMessageObj.packageReviewId,
			detailText: `User ${account.username} <${account.email}> edited message ${packageReviewMessageObj.id} of review ${packageReviewMessageObj.packageReviewId}`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send(packageReviewMessageObj);
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/review/message
 * 
 * Deletes a Message of a specific Review associated to a specified Package
 * Messages can only be deleted by their creator, the Package Developer or a User with a Moderator role or higher
 */
router.delete("/review/message", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	let packageQuery = (req.query.package || {}).filter(["id", "identifier", "name"]);
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
			message: "No review specified"
		}
	});
	
	let messageQuery = (req.query.message || {}).filter(["id"]);
	if (!messageQuery || !Object.keys(messageQuery).length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No review message specified"
		}
	});
	
	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	let reviewData = req.body;
	
	if (!reviewData || !reviewData.text || !reviewData.text.length) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Review text missing",
			detail: {
				title: !reviewData.title,
				text: !reviewData.text,
				value: !reviewData.value
			}
		}
	});
	
	let packageObj = await Package.findOne({
		where: Object.assign((req.query.package || {}).filter(["id", "identifier", "name"]),
			req.account && req.account.role >= UserRole.DEVELOPER ? {} : {
				visible: true
			}
		),
		include: [{
			model: PackageReview,
			as: "reviews",
			where: reviewQuery,
			separate: true,
			include: [{
				model: PackageReviewMessage,
				as: "messages",
				where: messageQuery,
				separate: true,
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
	
	if (!packageObj.reviews || !packageObj.reviews.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package reviews"
		}
	});
	
	if (!packageObj.reviews[0].messages || !packageObj.reviews[0].messages.length) return res.status(httpStatus.NOT_FOUND).send({
		error: {
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any package review messages"
		}
	});
	
	let packageReviewMessageObj = packageObj.reviews[0].messages[0];
	
	if (account.id != packageObj.accountId &&				// Developer
		account.id != packageReviewMessageObj.accountId &&	// Review Author
		account.role < UserRole.MODERATOR) {				// Moderator
		return res.status(httpStatus.FORBIDDEN).send({
			error: {
				name: httpStatus[httpStatus.FORBIDDEN],
				code: httpStatus.FORBIDDEN,
				message: "You are not allowed to perform this action"
			}
		});
	}
	
	packageReviewMessageObj.destroy().then(packageReviewMessageObj => {
		LogItem.create({
			id: String.prototype.concat(new Date().getTime, Math.random()),
			type: LogItemType.REVIEW_MESSAGE_DELETED,
			accountId: account.id,
			affectedPackageId: packageObj.id,
			affectedReviewId: packageReviewMessageObj.packageReviewId,
			detailText: `User ${account.username} <${account.email}> deleted message ${packageReviewMessageObj.id} of review ${packageReviewMessageObj.packageReviewId}`,
			status: LogItemStatus.LOG_USAGE
		});

		return res.status(httpStatus.OK).send({
			success: {
				name: httpStatus[httpStatus.OK],
				code: httpStatus.OK,
				message: "Package Review Message successfully deleted"
			}
		});
	}).catch(error => ErrorHandler(req, res, error));
});



module.exports = router;