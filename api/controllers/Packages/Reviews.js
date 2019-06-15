const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const Sequelize = require("sequelize");

const ErrorHandler = require("../../helpers/ErrorHandler");
const { UserRole, LogItemType } = require("../../helpers/Enumerations");

/**
 * GET /packages/reviews
 */
router.get("/reviews", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	PackageReview.findAll({
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
	}).then(async reviewList => {
		if (!reviewList || !reviewList.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any reviews"
		});
		
		let reviewData = reviewList;
		if (account.role < UserRole.DEVELOPER) {
			reviewData = reviewList.filter(packageReviewObj => packageReviewObj.accountId == account.id);
		} else if (account.role < UserRole.MODERATOR) {
			let packageList = await Package.findAll({
				where: {
					accountId: account.id
				}
			});
			
			reviewData = reviewList.filter(packageReviewObj => {
				return packageReviewObj.accountId == account.id || packageList.map(packageObj => packageObj.id).includes(packageReviewObj.packageId);
			});
		}
		
		if (!reviewData || !reviewData.length) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: "Could not find any reviews"
		});
		
		return res.status(httpStatus.OK).send(reviewData);
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/reviews
 */
router.get("/:packageId/reviews", (req, res) => {
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findAll({
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
		}).then(reviewList => {
			if (!reviewList || !reviewList.length) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any reviews`
			});
			
			return res.status(httpStatus.OK).send(reviewList);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * POST /packages/:packageId/reviews/new
 */
router.post("/:packageId/reviews/new", (req, res) => {
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
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
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
		
		PackageVersion.findOne({
			where: {
				packageId: packageObj.id,
				visible: true
			},
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		}).then(packageVersionObj => {
			if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any versions`
			});
			
			PackageReview.findOne({
				where: {
					accountId: account.id
				}
			}).then(async packageReviewObj => {
				if (packageReviewObj) return res.status(httpStatus.FORBIDDEN).send({
					name: httpStatus[httpStatus.FORBIDDEN],
					code: httpStatus.FORBIDDEN,
					message: "User did already review this package"
				});
				
				PackageReview.create(Object.assign(reviewData, {
					id: String.prototype.concat(packageVersionObj.packageId, packageVersionObj.id, new Date().getTime()),
					packageId: packageVersionObj.packageId,
					packageVersionId: packageVersionObj.id,
					accountId: account.id
				})).then(packageReviewObj => {
					PackageReviewMessage.create(Object.assign(reviewData, {
						id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.versionId, packageReviewObj.id, Math.random(), new Date().getTime()),
						packageId: packageReviewObj.packageId,
						packageVersionId: packageReviewObj.versionId,
						packageReviewId: packageReviewObj.id,
						fromDeveloper: account.id == packageVersionObj.accountId,
						accountId: account.id
					}));
					
					PackageRating.create(Object.assign(reviewData, {
						id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.versionId, packageReviewObj.id, Math.random(), new Date().getTime()),
						packageId: packageReviewObj.packageId,
						packageVersionId: packageReviewObj.versionId,
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
			}).catch(error => ErrorHandler(req, res, error));
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * GET /packages/:packageId/reviews/:reviewId
 */
router.get("/:packageId/reviews/:reviewId", (req, res) => {
	const { Package, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		},
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findOne({
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
		}).then(packageReviewObj => {
			if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
			});
			
			return res.status(httpStatus.OK).send(packageReviewObj);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/reviews/:reviewId
 */
router.delete("/:packageId/reviews/:reviewId", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Package, PackageReview, LogItem } = req.models;
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			}
		}).then(packageReviewObj => {
			if (account.id != packageObj.accountId &&	// Developer
				account.id != packageReviewObj.accountId &&	// Review Author
				(account.role & UserRole.MODERATOR) != UserRole.MODERATOR) {
				return res.status(httpStatus.FORBIDDEN).send({
					name: httpStatus[httpStatus.FORBIDDEN],
					code: httpStatus.FORBIDDEN,
					message: "You are not allowed to perform this action"
				});
			}
			
			packageReviewObj.destroy().then(() => {
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
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * POST /packages/:packageId/reviews/:reviewId/message
 */
router.post("/:packageId/reviews/:reviewId/message", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	const reviewData = req.body;
	
	if (!reviewData || !reviewData.text || !reviewData.text.length) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			}
		}).then(packageReviewObj => {
			if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
			});
			
			if (account.id != packageObj.accountId &&	// Developer
				account.id != packageReviewObj.accountId &&	// Review Author
				(account.role & UserRole.MODERATOR) != UserRole.MODERATOR) {
				return res.status(httpStatus.FORBIDDEN).send({
					name: httpStatus[httpStatus.FORBIDDEN],
					code: httpStatus.FORBIDDEN,
					message: "You are not allowed to perform this action"
				});
			}
			
			PackageReviewMessage.create(Object.assign(reviewData, {
				id: String.prototype.concat(packageReviewObj.packageId, packageReviewObj.versionId, packageReviewObj.id, new Date().getTime()),
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
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * PUT /packages/:packageId/reviews/:reviewId/:messageId
 */
router.put("/:packageId/reviews/:reviewId/:messageId", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Package, PackageReview, PackageReviewMessage } = req.models;
	const reviewData = req.body;
	
	if (!reviewData || !reviewData.text) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			}
		}).then(packageReviewObj => {
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
			
			PackageReviewMessage.findOne({
				where: {
					id: req.params.messageId,
					packageId: packageReviewObj.packageId,
					packageReviewId: packageReviewObj.id
				}
			}).then(reviewMessageObj => {
				if (!reviewMessageObj) return res.status(httpStatus.NOT_FOUND).send({
					name: httpStatus[httpStatus.NOT_FOUND],
					code: httpStatus.NOT_FOUND,
					message: `Review ${req.params.reviewId} does not have any review with identifier ${req.params.messageId}`
				});
				
				reviewMessageObj.update({
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
			}).catch(error => ErrorHandler(req, res, error));
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

/**
 * DELETE /packages/:packageId/reviews/:reviewId/:messageId
 */
router.delete("/:packageId/reviews/:reviewId/:messageId", (req, res) => {
	const { account } = req;
	
	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		name: httpStatus[httpStatus.UNAUTHORIZED],
		code: httpStatus.UNAUTHORIZED,
		message: "Invalid authorization token"
	});
	
	const { Package, PackageReview, PackageReviewMessage, LogItem } = req.models;
	const reviewData = req.body;
	
	if (!reviewData || !reviewData.text) return res.status(httpStatus.NOT_FOUND).send({
		name: httpStatus[httpStatus.BAD_REQUEST],
		code: httpStatus.BAD_REQUEST,
		message: "No review message specified"
	});
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		PackageReview.findOne({
			where: {
				id: req.params.reviewId,
				packageId: packageObj.id,
			}
		}).then(packageReviewObj => {
			if (!packageReviewObj) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any review with identifier ${req.params.reviewId}`
			});
			
			if (account.id != packageObj.accountId &&	// Developer
				account.id != packageReviewObj.accountId &&	// Review Author
				(account.role & UserRole.MODERATOR) != UserRole.MODERATOR) {
				return res.status(httpStatus.FORBIDDEN).send({
					name: httpStatus[httpStatus.FORBIDDEN],
					code: httpStatus.FORBIDDEN,
					message: "You are not allowed to perform this action"
				});
			}
			
			PackageReviewMessage.findOne({
				where: {
					id: req.params.messageId,
					packageId: packageReviewObj.packageId,
					packageReviewId: packageReviewObj.id
				}
			}).then(reviewMessageObj => {
				if (!reviewMessageObj) return res.status(httpStatus.NOT_FOUND).send({
					name: httpStatus[httpStatus.NOT_FOUND],
					code: httpStatus.NOT_FOUND,
					message: `Review ${req.params.reviewId} does not have any review with identifier ${req.params.messageOd}`
				});
				
				reviewMessageObj.destroy().then(() => {
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
			}).catch(error => ErrorHandler(req, res, error));
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/versions/latest/reviews
 */
router.get("/:packageId/versions/latest/reviews", (req, res) => {
	const { Package, PackageVersion, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
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
			attributes: { exclude: ["fileData"] },
			order: [["createdAt", "DESC"]]
		});
	}).then(packageVersionObj => {
		if (!packageVersionObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `Package ${req.params.packageId} does not have any versions`
		});
		
		PackageReview.findOne({
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
		}).then(reviewList => {
			if (!reviewList || !reviewList.length) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any reviews`
			});
			
			return res.status(httpStatus.OK).send(reviewList);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});



/**
 * GET /packages/:packageId/versions/:versionId/reviews
 */
router.get("/:packageId/versions/:versionId/reviews", (req, res) => {
	const { Package, PackageVersion, PackageReview, PackageReviewMessage, PackageRating, Device } = req.models;
	
	Package.findOne({
		where: {
			[Sequelize.Op.or]: {
				id: req.params.packageId,
				identifier: req.params.packageId
			},
			visible: true
		}
	}).then(packageObj => {
		if (!packageObj) return res.status(httpStatus.NOT_FOUND).send({
			name: httpStatus[httpStatus.NOT_FOUND],
			code: httpStatus.NOT_FOUND,
			message: `No package with identifier ${req.params.packageId} found`
		});
		
		return PackageVersion.findOne({
			where: {
				id: req.params.versionId,
				packageId: packageObj.id,
				visible: true
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
		
		PackageReview.findOne({
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
		}).then(reviewList => {
			if (!reviewList || !reviewList.length) return res.status(httpStatus.NOT_FOUND).send({
				name: httpStatus[httpStatus.NOT_FOUND],
				code: httpStatus.NOT_FOUND,
				message: `Package ${req.params.packageId} does not have any reviews`
			});
			
			return res.status(httpStatus.OK).send(reviewList);
		}).catch(error => ErrorHandler(req, res, error));
	}).catch(error => ErrorHandler(req, res, error));
});

module.exports = router;