import Vue from "vue";
import crypto from "crypto";
import SocketIOClient from "socket.io-client";


import VueI18n from 'vue-i18n';
Vue.use(VueI18n);
const i18n = new VueI18n({
	locale: navigator.language,
	fallbackLocale: "en",
	messages: {
		en: require("@/locale/en.json"),
		"en-US": require("@/locale/en.json"),
		de: require("@/locale/de.json"),
		"de-DE": require("@/locale/de.json"),
	}
});

export const SocketService = new Vue({
	i18n,
	data: {
		url: null,
		socket: null,
		connectionPromiseResolve: null,
		queue: {}
	},
	methods: {
		connect(url) {
			if (this.socket && this.socket.connected) return;
			
			this.url = url;
			this.socket = SocketIOClient(url, {
				secure: true,
				multiplex: false,
				"force new connection": true,
				"connect timeout": 5000,
				reconnection: false
			});
			this.socket.on("connect", this.onOpen);
			this.socket.on("disconnect", this.onClose);
			this.socket.on("connect_error", this.onError);
			this.socket.on("message", data => this.onMessage(data));
			
			return new Promise((resolve) => {
				this.connectionPromiseResolve = resolve;
			});
		},
		onOpen(event) {
			console.info("[WebSocket] WebSocket opened");
			
			if (this.connectionPromiseResolve) {
				this.connectionPromiseResolve(this.socket);
			}
			
			this.$emit("open", event);
		},
		onClose(event) {
			console.info("[WebSocket] WebSocket closed");
			this.socket = null;
			
			if (this.connectionPromiseResolve) {
				this.connectionPromiseResolve(null);
			}
			
			this.$emit("close", event);
			
			let notification = new metroUI.Notification({
				payload: {},
				title: this.$t('app.connection_interrupted_title'),
				content: this.$t('app.connection_interrupted_message'),
				icon: "ethernet-error",
				reminder: true,
				dismissAction: (payload) => {
					setTimeout(() => this.connect(this.url), 1000);
				}
			});
			notification.show();
			
			// alert("WebSocket has been closed. Please reload the page.")
			// window.location.reload(true);
		},
		onError(error) {
			console.log(error);
			this.socket = null;
			
			if (this.connectionPromiseResolve) {
				this.connectionPromiseResolve(null);
			}
			
			this.$emit("error", error);
			
			let notification = new metroUI.Notification({
				payload: {},
				title: this.$t('app.connection_failure_title'),
				content: this.$t('app.connection_failure_message'),
				icon: "ethernet-error",
				reminder: true,
				dismissAction: (payload) => {
					setTimeout(() => this.connect(this.url), 1000);
				}
			});
			notification.show();
		},
		onMessage(data) {
			data = JSON.parse(data);
			
			if (data.cookies && Object.keys(data.cookies).length) {
				Object.keys(data.cookies).forEach(cookie => {
					window.$cookies.set(cookie, data.cookies[cookie].value, data.cookies[cookie].options.expiresIn)
				});
			}
			
			if (data._rqid && this.queue[data._rqid]) {
				this.queue[data._rqid].resolve(data.body);
				delete this.queue[data._rqid];
			}
			
			this.$emit("message", data);
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
		},
		
		get(path, options = {}) {
			return this.send(Object.assign(options, {
				method: "GET",
				path: path.split("?")[0],
				query: !path.split("?")[1] ? undefined : path.split("?")[1].split("&").reduce((obj, query, index) => {
					var pair = query.split('=');
					obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
					
					return obj;
				}, {})
			}));
		},
		post(path, data = {}, options = {}) {
			return this.send(Object.assign(options, {
				method: "POST",
				path: path,
				body: data
			}));
		},
		put(path, data = {}, options = {}) {
			return this.send(Object.assign(options, {
				method: "PUT",
				path: path,
				body: data
			}));
		},
		delete(path, options = {}) {
			return this.send(Object.assign(options, {
				method: "DELETE",
				path: path,
			}));
		}
	}
});