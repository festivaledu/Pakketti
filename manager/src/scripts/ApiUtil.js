import { SocketService } from "@/scripts/SocketService";


export class AccountAPI {}

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
	
