import { SocketService } from "@/scripts/SocketService";


export class AccountAPI {}

export class AuthAPI {
	static async register(data) {
		return await SocketService.send({
			method: "POST",
			path: "auth/register",
			body: data
		});
	}
	
	static async login(data) {
		return await SocketService.send({
			method: "POST",
			path: "auth/login",
			body: data
		});
	}
	
	static async verify() {
		return await SocketService.send({
			method: "GET",
			path: "auth/verify",
			headers: {
				"authorization": window.$cookies.get("authToken") ? `Bearer ${window.$cookies.get("authToken")}` : undefined
			}
		});
	}
}