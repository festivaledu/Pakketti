import { SocketService } from "@/scripts/SocketService";
import { get, post, put, delete as _delete } from "axios";

// const apiUrl = `${window.location.origin}/api`
const apiUrl = `http://localhost:3000/api`

export class AccountAPI {
	static async getMe() {
		return await SocketService.get("/account/me", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateMe(data) {
		return await SocketService.put("/account/me", data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteMe() {
		return await SocketService.delete("/account/me", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getAvatar() {
		throw new Error("Not implemented");
	}

	static async updateAvatar(file) {
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/account/me/avatar`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteAvatar() {
		return await SocketService.delete("/account/me/avatar", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getUser(userId) {
		return await SocketService.get(`/account/${userId}`);
	}

	static async deleteUser(userId) {
		return await SocketService.delete(`/account/${userId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getUserAvatar(userId) {
		throw new Error("Not implemented");
	}
}

export class AuthAPI {
	static async register(data) {
		return await SocketService.post("/auth/register", data);
	}

	static async login(data) {
		return await SocketService.post("/auth/login", data);
	}

	static async verify() {
		return await SocketService.get("/auth/verify", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
}

export class DeviceAPI {
	static async getDevices() {
		return await SocketService.get("/devices", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async createDevice(data) {
		return await SocketService.post("/devices/new", data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getDevice(deviceId) {
		return await SocketService.get(`/devices/${deviceId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateDevice(deviceId, data) {
		return await SocketService.put(`/devices/${deviceId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteDevice(deviceId) {
		return await SocketService.delete(`/devices/${deviceId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
}

export class LogAPI {
	static async getLogItems() {
		return await SocketService.get("/log", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getLogItem(logItemId) {
		return await SocketService.get(`/log/${logItemId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateLogItem(logItemId, data) {
		return await SocketService.put(`/log/${logItemId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteLogItem(logItemId) {
		return await SocketService.delete(`/log/${logItemId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
}

export class PackageAPI {
	// - General
	static async getPackages() {
		return await SocketService.get("/packages", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}`
			}
		});
	}

	static async createPackage(data) {
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});

		return await post(`${apiUrl}/packages/new`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getPackage(packageId) {
		return await SocketService.get(`/packages/${packageId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}`
			}
		});
	}

	static async updatePackage(packageId, data) {
		return await SocketService.put(`/packages/${packageId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deletePackage(packageId) {
		return await SocketService.delete(`/packages/${packageId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getPackageIcon(packageId) {
		throw new Error("Not implemented");
	}

	static async updatePackageIcon(packageId, file) {
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/packages/${packageId}/icon`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deletePackageIcon(packageId) {
		return await SocketService.delete(`/packages/${packageId}/icon`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	// - Reviews
	static async getReviews() {
		return await SocketService.get("/packages/reviews", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getPackageRatings(packageId) {
		return await SocketService.get(`/packages/${packageId}/ratings`);
	}

	static async getPackageReviews(packageId) {
		return await SocketService.get(`/packages/${packageId}/reviews`);
	}

	static async createPackageReview(packageId, data) {
		return await SocketService.post(`/packages/${packageId}/reviews/new`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getPackageReview(packageId, reviewId) {
		return await SocketService.get(`/packages/${packageId}/reviews/${reviewId}`);
	}

	static async deletePackageReview(packageId, reviewId) {
		return await SocketService.delete(`/packages/${packageId}/reviews/${reviewId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async addPackageReviewMessage(packageId, reviewId, data) {
		return await SocketService.post(`/packages/${packageId}/reviews/${reviewId}/message`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			},
			body: data
		});
	}

	static async updatePackageReviewMessage(packageId, reviewId, messageId) {
		return await SocketService.put(`/packages/${packageId}/reviews/${reviewId}/${messageId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			},
			body: data
		});
	}

	static async deletePackageReviewMessage(packageId, reviewId, messageId) {
		return await SocketService.delete(`/packages/${packageId}/reviews/${reviewId}/${messageId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async getPackageReviewRating(packageId, reviewId) {
		return await SocketService.get(`/packages/${packageId}/reviews/${reviewId}/rating`);
	}

	static async updatePackageReviewRating(packageId, reviewId, data) {
		return await SocketService.put(`/packages/${packageId}/reviews/${reviewId}/rating`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	// - Screenshots

	static async getPackageScreenshots(packageId) {
		return await SocketService.get(`/packages/${packageId}/screenshots`);
	}

	static async createPackageScreenshots(packageId, data) {
		return await SocketService.post(`/packages/${packageId}/screenshots`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async uploadPackageScreenshots(packageId, data) {
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});
		
		return await post(`${apiUrl}/packages/${packageId}/screenshots/files`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getPackageScreenshot(packageId, screenshotId) {
		throw new Error("Not implemented");
	}
	
	static async updatePackageScreenshot(packageId, screenshotId, data) {
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});
		
		return await put(`${apiUrl}/packages/${packageId}/screenshots/${screenshotId}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async deletePackageScreenshot(packageId, screenshotId) {
		return await SocketService.delete(`/packages/${packageId}/screenshots/${screenshotId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	// - Versions
	
	static async getPackageVersions(packageId) {
		return await SocketService.get(`/packages/${packageId}/versions`, {
			"authorization": `Bearer ${window.$cookies.get("authToken")}`,
			"x-pakketti-developer": `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}`
		});
	}
	
	static async createPackageVersion(packageId, data) {
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});
		
		return await post(`${apiUrl}/packages/${packageId}/versions/new`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getPackageLatestVersion(packageId) {
		return await SocketService.get(`/packages/${packageId}/versions/latest`);
	}
	
	static async getPackageLatestVersionFile(packageId) {
		throw new Error("Not implemented");
	}
	
	static async getPackageLatestVersionRatings(packageId) {
		return await SocketService.get(`/packages/${packageId}/versions/latest/ratings`);
	}
	
	static async getPackageLatestVersionReviews(packageId) {
		return await SocketService.get(`/packages/${packageId}/versions/latest/reviews`);
	}
	
	static async getPackageVersion(packageId, versionId) {
		return await SocketService.get(`/packages/${packageId}/versions/${versionId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}`
			}
		});
	}
	
	static async updatePackageVersion(packageId, versionId, data) {
		return await SocketService.put(`/packages/${packageId}/versions/${versionId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async deletePackageVersion(packageId, versionId) {
		return await SocketService.delete(`/packages/${packageId}/versions/${versionId}`);
	}
	
	static async getPackageVersionFile(packageId, versionId) {
		throw new Error("Not implemented");
	}
	
	static async updatePackageVersionFile(packageId, versionId, file) {
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/packages/${packageId}/versions/${versionId}/file`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async getPackageVersionRatings(packageId, versionId) {
		return await SocketService.get(`/packages/${packageId}/versions/${versionId}/ratings`);
	}
	
	static async getPackageVersionReviews(packageId, versionId) {
		return await SocketService.get(`/packages/${packageId}/versions/${versionId}/reviews`);
	}
}

export class RequestAPI {
	static async getRequests() {
		return await SocketService.get("/requests", {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async createRequest(data) {
		return await SocketService.post("/requests/new", data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateRequest(requestId, data) {
		return await SocketService.put(`/requests/${requestId}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteRequest(requestId) {
		return await SocketService.delete(`/requests/${requestId}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
}

export class StatisticAPI {
	static async getStatistics() {
		return await SocketService.get("/statistics");
	}

	static async getCurrentDay() {
		return await SocketService.get("/statistics/day");
	}

	static async getCurrentWeek() {
		return await SocketService.get("/statistics/week");
	}

	static async getCurrentYear() {
		return await SocketService.get("/statistics/year");
	}

	static async getMonthly() {
		return await SocketService.get("/statistics/monthly");
	}

	static async getYearly() {
		return await SocketService.get("/statistics/yearly");
	}
}