import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Root',
      component: () => import(/* webpackChunkName: "Root" */ './views/Root.vue')
    },
  ]
})
