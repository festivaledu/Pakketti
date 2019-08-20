import View from './View/Component.vue'
import Page from './Page/Component.vue'

import AppBarButton from './AppBarButton/Component.vue'
import AppBarSeparator from './AppBarSeparator/Component.vue'
import Button from './Button/Component.vue'
import CheckBox from './CheckBox/Component.vue'
import ComboBox from './ComboBox/Component.vue'
import CommandBar from './CommandBar/Component.vue'
import DataGrid from './DataGrid/Component.vue'
import FlipView from './FlipView/Component.vue'
import FontIcon from './FontIcon/Component.vue'
import GridView from './GridView/Component.vue'
import HyperlinkButton from './HyperlinkButton/Component.vue'
import Messages from './Messages/Component.vue'
import NavigationView from './NavigationView/Component.vue'
import NavigationViewItem from './NavigationViewItem/Component.vue'
import NavigationViewItemHeader from './NavigationViewItemHeader/Component.vue'
import NavigationViewItemSeparator from './NavigationViewItemSeparator/Component.vue'
import RadioButton from './RadioButton/Component.vue'
import RatingControl from './RatingControl/Component.vue'
import TextBlock from './TextBlock/Component.vue'
import TextBox from './TextBox/Component.vue'
import ToggleSwitch from './ToggleSwitch/Component.vue'
import PasswordBox from './PasswordBox/Component.vue'
import PersonPicture from './PersonPicture/Component.vue'
import Pivot from './Pivot/Component.vue'
import PivotItem from './PivotItem/Component.vue'
import ProgressBar from './ProgressBar/Component.vue'
import ProgressRing from './ProgressRing/Component.vue'

import PathIcon from './PathIcon/Component.vue'
import SymbolIcon from './SymbolIcon/Component.vue'
import StackPanel from './StackPanel/Component.vue'

const components = [
	View,
	Page,
	
	AppBarButton,
	AppBarSeparator,
	Button,
	CheckBox,
	ComboBox,
	CommandBar,
	DataGrid,
	FlipView,
	FontIcon,
	GridView,
	HyperlinkButton,
	Messages,
	NavigationView,
	NavigationViewItem,
	NavigationViewItemHeader,
	NavigationViewItemSeparator,
	RadioButton,
	RatingControl,
	TextBlock,
	TextBox,
	ToggleSwitch,
	PasswordBox,
	PersonPicture,
	Pivot,
	PivotItem,
	ProgressBar,
	ProgressRing,
	
	PathIcon,
	SymbolIcon,
	StackPanel
]

export default Vue => {
	components.forEach(item => Vue.component(item.name, item));
}