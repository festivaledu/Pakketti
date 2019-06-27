import Vue from 'vue'
import Router from 'vue-router'

import { AuthAPI } from "@/scripts/ApiUtil";

Vue.use(Router)

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
			meta: {
				noAuth: true
			}
		},
		{
			path: '/',
			name: 'root',
			component: () => import(/* webpackChunkName: "root" */ './views/Root.vue'),
		}
	]
});

router.beforeEach(async (to, from, next) => {
	if (!to.matched.some(_ => _.meta.noAuth)) {
		if (!window.$cookies.get("authToken")) {
			return next({
				path: "/login",
				query: {
					next: to.path != "/" ? to.path : undefined
				},
				replace: true
			});
		} else {
			const authData = await AuthAPI.verify();

			if (!authData.auth) {
				return next({
					path: "/login",
					query: {
						next: to.path != "/" ? to.path : undefined
					},
					replace: true
				});
			}
		}
	}
	
	next();
});

export default router;