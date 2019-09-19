const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const httpStatus = require("http-status");
const plist = require("plist");
const axios = require("axios");

const ErrorHandler = require("../helpers/ErrorHandler");

const { BASE_URL } = process.env;



/**
 * GET /link
 * 
 * Redirects to a configuration profile to enroll an iOS device
 */
router.get("/", async (req, res) => {
	const { account } = req;

	if (!account) return res.status(httpStatus.UNAUTHORIZED).send({
		error: {
			name: httpStatus[httpStatus.UNAUTHORIZED],
			code: httpStatus.UNAUTHORIZED,
			message: "Invalid authorization token"
		}
	});
	
	const { DeviceLinkNonce, LogItem } = req.models;
	const linkNonceObj = await DeviceLinkNonce.findOrCreate({
		where: {
			accountId: req.account.id
		},
		defaults: {
			id: String.prototype.concat(req.account.id, new Date().getTime()),
		}
	}).spread(linkNonceObj => linkNonceObj);
	
	if (!linkNonceObj) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
		error: {
			name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
			code: httpStatus.INTERNAL_SERVER_ERROR
		}
	});
	
	const propertyList = plist.build({
		PayloadContent: {
			URL: `${BASE_URL}/api/link/${linkNonceObj.id}`,
			DeviceAttributes: [
				"UDID",
				"PRODUCT",
				"VERSION"
			]
		},
		PayloadDisplayName: "Team FESTIVAL Device Enrollment",
		PayloadOrganization: "Team FESTIVAL",
		PayloadDescription: "This temporary profile will securely transmit your device UDID, product identifier (eg. iPhone8,2) and iOS build number to add your device to the Team FESTIVAL Cydia Repository. Your product identifier and iOS build number will also be sent to ipsw.me to get information about your current iOS. For more information, please refer to the FESTIVAL and ipsw.me privacy policies.",
		PayloadVersion: 1,
		PayloadIdentifier: "ml.festival.device-enrollment",
		PayloadUUID: "6FDD9C1A-BD51-4F1E-B087-EBC2A9203E0F",
		PayloadType: "Profile Service"
	});
	
	res.set("Content-Type", "application/x-apple-aspen-config");
	return res.status(httpStatus.OK).send(propertyList);
});

router.post("/:nonce", async (req, res) => {
	if (!req.params.nonce) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "No nonce specified"
		}
	});
	
	const { DeviceLinkNonce, Device } = req.models;
	const nonceObj = await DeviceLinkNonce.findOne({
		where: {
			id: req.params.nonce
		}
	});

	if (!nonceObj) return res.status(httpStatus.BAD_REQUEST).send({
		error: {
			name: httpStatus[httpStatus.BAD_REQUEST],
			code: httpStatus.BAD_REQUEST,
			message: "Invalid nonce specified"
		}
	});
	
	let data = "";
	req.setEncoding("utf8");

	req.on("data", (chunk) => {
		data += chunk;
	});
	
	req.on("end", async () => {
		req.body = plist.parse(data, {
			errorHandler: null
		});
		
		if (!req.body) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
			error: {
				name: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
				code: httpStatus.INTERNAL_SERVER_ERROR,
			}
		});
		
		let deviceObj = await Device.findOne({
			where: {
				udid: req.body["UDID"]
			}
		});
		
		if (deviceObj) {
			nonceObj.destroy();
			
			return res.status(httpStatus.CONFLICT).send({
				error: {
					name: httpStatus[httpStatus.CONFLICT],
					code: httpStatus.CONFLICT,
					message: "Device with this UDID is already registered"
				}
			});
		}
		
		await axios.get(`https://api.ipsw.me/v4/ipsw/${req.body["PRODUCT"]}/${req.body["VERSION"]}`).then(response => {
			if (!response) return res.status(httpStatus.NOT_FOUND).send({
				error: {
					name: httpStatus[httpStatus.NOT_FOUND],
					code: httpStatus.NOT_FOUND,
					messsage: `Could not find details for device ${req.body["PRODUCT"]}, build ${req.body["VERSION"]}`
				}
			});
			
			Device.create({
				id: String.prototype.concat(req.body["UDID"], new Date().getTime()),
				product: req.body["PRODUCT"],
				platform: "iphoneos",
				version: response.data.version,
				udid: req.body["UDID"],
				accountId: nonceObj.accountId
			});
			
			nonceObj.destroy();
			
			res.set('Location', `${BASE_URL}/api/link/done`);
			return res.redirect(301, `${BASE_URL}/api/link/done`);
		}).catch(error => ErrorHandler(req, res, error));
	});
});

router.get("/done", (req, res) => {
	// TODO: Complete redirect
	return res.status(200).send({
		name: "OK",
		code: 200
	});
});



module.exports = router;