import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

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
			name: 'home',
			component: Home
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
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