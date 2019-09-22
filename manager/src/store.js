import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
	plugins: [VuexPersistedState()],
	state: {
		accountId: null,
		role: null
	},
	mutations: {
		setAccountId(state, accountId) {
			state.accountId = accountId;
		},
		setRole(state, role) {
			state.role = role;
		}
	},
	getters: {
		accountId: state => state.accountId,
		role: state => state.role
	}
})
