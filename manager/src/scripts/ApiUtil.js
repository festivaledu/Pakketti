import { SocketService } from "@/scripts/SocketService";
import { get, post, put, delete as _delete } from "axios";

// const apiUrl = `${window.location.origin}/api`
const apiUrl = `http://${window.location.hostname}:3000/api`

const flattenObject = (obj) => {
	var returnObj = {};
	
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		
		if ((typeof obj[i]) == 'object') {
			var flatObject = flattenObject(obj[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				
				returnObj[i + '.' + x] = flatObject[x];
			}
		} else {
			returnObj[i] = obj[i];
		}
	}
	
	return returnObj;
};

const parseUrlFromObject = (obj) => {
	return Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');
}

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

	static async getUser(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.get(`/account?${query}`);
	}

	static async deleteUser(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/account?${query}`, {
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
	static async getDevices(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.get(`/devices?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateDevice(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.put(`/devices?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteDevice(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/devices?${query}`, {
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
}

export class LogAPI {
	static async getLogItems(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.get(`/log?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateLogItem(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.put(`/log?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteLogItem(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/log?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
}

export class PackageAPI {
	// - General
	static async getPackages(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.get(`/packages?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async updatePackage(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.put(`/packages?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async deletePackage(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/packages?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
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
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async updatePackageIcon(parameters, file) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/packages/icon?${query}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async deletePackageIcon(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/packages/icon?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}
	
	static async updatePackageHero(parameters, file) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/packages/hero?${query}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async deletePackageHero(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.delete(`/packages/hero?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}
	
	// - Ratings
	static async getPackageRatings(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.get(`/packages/ratings?${query}`);
	}
	
	static async updatePackageRating(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters));
		
		return await SocketService.put(`/packages/rating?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	// - Reviews
	static async getReviews(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.get(`/packages/reviews?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async createPackageReview(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.post(`/packages/reviews/new?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deletePackageReview(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.delete(`/packages/review${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	static async addPackageReviewMessage(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.post(`/packages/review/message?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			},
			body: data
		});
	}

	static async updatePackageReviewMessage(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.put(`/packages/review?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			},
			body: data
		});
	}

	static async deletePackageReviewMessage(parameters) {
		return await SocketService.delete(`/packages/review?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`,
				"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
			}
		});
	}

	// - Screenshots

	static async getPackageScreenshots(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.get(`/packages/screenshots?${query}`);
	}
	
	static async createPackageScreenshots(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.post(`/packages/screenshots?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async uploadPackageScreenshots(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});
		
		return await post(`${apiUrl}/packages/screenshots/files?${query}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async deletePackageScreenshot(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.delete(`/packages/screenshot?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	// - Versions
	
	static async getPackageVersions(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.get(`/packages/versions?${query}`, {
			"authorization": `Bearer ${window.$cookies.get("authToken")}`,
			"x-pakketti-developer": localStorage.getItem("vuex") ? `Developer ${JSON.parse(localStorage.getItem("vuex"))["accountId"]}` : undefined
		});
	}
	
	static async createPackageVersion(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		const formData = new FormData();
		Object.keys(data).forEach(key => {
			formData.append(key, data[key]);
		});
		
		return await post(`${apiUrl}/packages/versions/new?${query}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async updatePackageVersion(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.put(`/packages/versions?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async updatePackageVersionFile(parameters, file) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		const formData = new FormData();
		formData.append("file", file);

		return await put(`${apiUrl}/packages/versions/file?${query}`, formData, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}
	
	static async deletePackageVersion(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.delete(`/packages/versions?${query}`);
	}
}

export class RequestAPI {
	static async getRequests(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.get(`/requests?${query}`, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async updateRequest(parameters, data) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.put(`/requests?${query}`, data, {
			headers: {
				"authorization": `Bearer ${window.$cookies.get("authToken")}`
			}
		});
	}

	static async deleteRequest(parameters) {
		const query = parseUrlFromObject(flattenObject(parameters)); 
		
		return await SocketService.delete(`/requests?${query}`, {
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
}

export class StatisticsAPI {
	static async getDay() {
		return await SocketService.get("/statistics/day");
	}

	static async getWeek() {
		return await SocketService.get("/statistics/week");
	}
	
	static async getMonth() {
		return await SocketService.get("/statistics/month");
	}
	
	static async get3Month() {
		return await SocketService.get("/statistics/3month");
	}
	
	static async get6Month() {
		return await SocketService.get("/statistics/6month");
	}

	static async getYear() {
		return await SocketService.get("/statistics/year");
	}

	static async get2Year() {
		return await SocketService.get("/statistics/2year");
	}
}