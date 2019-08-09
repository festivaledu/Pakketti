import './style'
import * as Classes from './classes'
import * as Components from './components'

window.metroUI = Vue => {
	Object.values(Components).forEach(Component => {
		Vue.use(Component)
	})
}

Object.keys(Classes).forEach(ClassKey => {
	metroUI[ClassKey] = Classes[ClassKey]
})

export default metroUI;