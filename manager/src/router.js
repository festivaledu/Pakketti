import Vue from 'vue'
import Router from 'vue-router'

import { AuthAPI } from "@/scripts/ApiUtil";
import { SocketService } from "@/scripts/SocketService";

Vue.use(Router)

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import(/* webpackChunkName: "Login" */ './pages/Login.vue'),
			meta: {
				noAuth: true
			}
		},
		{
			path: '/',
			name: 'dashboard',
			component: () => import(/* webpackChunkName: "Dashboard" */ './pages/Dashboard.vue')
		},
		{
			path: '/packages',
			name: 'packages',
			component: () => import(/* webpackChunkName: "PackagesList" */ './pages/PackagesList.vue')
		},
		{
			path: '/package/new',
			name: 'package-creator',
			component: () => import(/* webpackChunkName: "PackageCreator" */ './pages/PackageCreator.vue')
		},
		{
			path: '/package/:packageId',
			name: 'package-editor',
			component: () => import(/* webpackChunkName: "PackageEditor" */ './pages/PackageEditor.vue')
		},
		{
			path: '/reviews/:reviewId?',
			name: 'reviews',
			component: () => import(/* webpackChunkName: "ReviewThreads" */ './pages/ReviewThreads.vue')
		}
	]
});

router.beforeEach(async (to, from, next) => {
	if (!SocketService.socket && to.path !== "/login") {
		return next({
			path: "/login",
			replace: true
		});
	}
	
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