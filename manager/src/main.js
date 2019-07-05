import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueCookies from "vue-cookies";
Vue.use(VueCookies);

import metroUI from "metroui-vue";
Vue.use(metroUI);

import Vuelidate from "vuelidate";
Vue.use(Vuelidate)

import vueHeadful from "vue-headful";
Vue.component("vue-headful", vueHeadful);

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

Vue.config.productionTip = false

import { SocketService } from "@/scripts/SocketService";
(async () => {
	await SocketService.connect("ws://localhost:62486");
	
	new Vue({
		router,
		store,
		i18n,
		render: h => h(App)
	}).$mount('#app')
})()