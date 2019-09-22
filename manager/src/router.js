import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import { AuthAPI } from "@/scripts/ApiUtil";
import { SocketService } from "@/scripts/SocketService";
import { UserRole } from '@/scripts/Enumerations'

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
			component: () => import(/* webpackChunkName: "PackagesList" */ './pages/PackagesList.vue'),
			meta: {
				minimumRole: UserRole.DEVELOPER
			}
		},
		{
			path: '/packages/new',
			name: 'package-creator',
			component: () => import(/* webpackChunkName: "PackageCreator" */ './pages/PackageCreator.vue'),
			meta: {
				minimumRole: UserRole.DEVELOPER
			}
		},
		{
			path: '/package/:packageId',
			name: 'package-editor',
			component: () => import(/* webpackChunkName: "PackageEditor" */ './pages/PackageEditor.vue'),
			meta: {
				minimumRole: UserRole.DEVELOPER
			}
		},
		{
			path: '/reviews/:reviewId?',
			name: 'reviews',
			component: () => import(/* webpackChunkName: "ReviewThreads" */ './pages/ReviewThreads.vue')
		},
		{
			path: '/devices/:deviceId?',
			name: 'devices',
			component: () => import(/* webpackChunkName: "Devices" */ './pages/Devices.vue')
		},
		{
			path: '/requests/:requestId?',
			name: 'requests',
			component: () => import(/* webpackChunkName: "Requests" */ './pages/Requests.vue')
		},
		{
			path: '/logs',
			name: 'logs',
			component: () => import(/* webpackChunkName: "ModerationLog" */ './pages/ModerationLog.vue'),
			meta: {
				minimumRole: UserRole.MODERATOR
			}
		},
		
		{
			path: '/profile',
			name: 'profile',
			component: () => import(/* webpackChunkName: "Profile" */ './pages/Profile.vue')
		},
		
		{
			path: '/error/:error?',
			name: 'error',
			component: () => import(/* webpackChunkName: "ErrorPage" */ './pages/ErrorPage.vue')
		},
		{ path: '*', redirect: '/error/404' }
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
	
	if (to.matched.some(_ => _.meta.minimumRole)) {
		let minimumRole = to.matched.map(_ => _.meta.minimumRole)[0];
		
		if ((store.getters.role & minimumRole) != minimumRole) {
			return next({
				path: "/error/403",
				replace: true
			})
		}
	}
	
	next();
});

export default router;