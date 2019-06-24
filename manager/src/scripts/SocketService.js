import Vue from "vue";
import crypto from "crypto";

export const SocketService = new Vue({
	data: {
		socket: null,
		connectionPromiseResolve: null,
		queue: {}
	},
	methods: {
		connect(url) {
			this.socket = new WebSocket(url);
			this.socket.onopen = this.onOpen;
			this.socket.onclose = this.onClose;
			this.socket.onerror = this.onError;
			this.socket.onmessage = this.onMessage;
			
			return new Promise((resolve) => {
				this.connectionPromiseResolve = resolve;
			});
		},
		onOpen(event) {
			console.info("[WebSocket] WebSocket opened");
			
			this.connectionPromiseResolve(this.socket);
			this.$emit("open", event);
		},
		onClose(event) {
			console.info("[WebSocket] WebSocket closed");
			this.$emit("close", event);
			
			alert("WebSocket has been closed. Please reload the page.")
			window.location.reload(true);
		},
		onError(error) {
			this.$emit("error", error);
		},
		onMessage(event) {
			const data = JSON.parse(event.data);
			if (data._rqid && this.queue[data._rqid]) {
				this.queue[data._rqid].resolve(data.body);
				delete this.queue[data._rqid];
			}
			
			this.$emit("message", JSON.parse(event.data));
		},
		send(data) {
			const rqid = crypto.createHash("sha256").update(String.prototype.concat(new Date().getTime(), Math.random())).digest("hex");
			data._rqid = rqid;
			
			let _resolve = null;
			const promise = new Promise((resolve) => {
				_resolve = resolve;
			});
			
			this.queue[rqid] = {
				promise: promise,
				resolve: _resolve
			};
			
			this.socket.send(JSON.stringify(data));
			return promise;
		}
	}
});