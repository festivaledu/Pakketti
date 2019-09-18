import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'start',
			component: () => import(/* webpackChunkName: "StartPage" */ './pages/StartPage.vue')
		},
		{
			path: '/package/:packageId',
			name: 'package',
			component: () => import(/* webpackChunkName: "PackagePage" */ './pages/PackagePage.vue')
		},
		{
			path: '/developer/:developerId',
			name: 'developer',
			component: () => import(/* webpackChunkName: "DeveloperPage" */ './pages/DeveloperPage.vue')
		},
		{
			path: '/*',
			name: 'error',
			component: () => import(/* webpackChunkName: "ErrorPage" */ './pages/ErrorPage.vue')
		},
	]
})
