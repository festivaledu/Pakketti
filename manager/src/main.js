import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import metroUI from "metroui-vue";
Vue.use(metroUI);

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

import vueHeadful from 'vue-headful'
Vue.component("vue-headful", vueHeadful);

Vue.config.productionTip = false

import { SocketService } from "@/scripts/SocketService";
(async () => {
	await SocketService.connect("ws://localhost:62486");
	
new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
})()