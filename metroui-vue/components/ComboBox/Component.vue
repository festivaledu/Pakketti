<template>
	<div class="combo-box" :disabled="disabled">
		<label v-if="header">{{ header }}</label>
		<!-- TODO: Add select element -->
		<select :name="name" ref="select">
			<option v-for="(value, key) in items" :key="key" :value="key" :selected="$data._value === key">{{ value }}</option>
		</select>
		
		<div class="combo-box-content" @click="_openDropDown($event)" ref="content">
			<MetroTextBlock v-if="placeholderText && !this.$data._value">{{ placeholderText }}</MetroTextBlock>
			<MetroTextBlock v-if="this.$data._value">{{ items[this.$data._value] }}</MetroTextBlock>
			
			<div class="drop-down-glyph"></div>
		</div>
		
		<div class="combo-box-popup" v-show="dropDownOpen" ref="popup">
			<div class="combo-box-items">
				<div class="combo-box-item" :class="{'selected': $data._value === key}" v-for="(value, key) in items " :key="key" @click="_closeDropDown($event, key)">{{ value }}</div>
			</div>
		</div>
	</div>
</template>

<script>
var cumulativeOffset = (element) => {
	var top = 0, left = 0, width = element.clientWidth, height = element.clientHeight;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element && element.style.position.match(/relative|absolute/));

	return {
		top: top,
		left: left,
		width: width,
		height: height
	};
};

export default {
	name: "MetroComboBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		itemsSource: null,
		disabled: Boolean,
		value: null,
	},
	data() {
		return {
			dropDownOpen: false,
			selectedIndex: -1,
			_value: this.$props.value,
			eventListener: null
		}
	},
	mounted() {
		this.$nextTick(function () {
			Object.assign(this.$refs["popup"].style, {
				minWidth: `${this.$refs["content"].clientWidth}px`
			});
		});
	},
	methods: {
		_openDropDown(event) {
			this.dropDownOpen = true;
			
			this.$refs["popup"].parentElement.removeChild(this.$refs["popup"]);
			document.body.appendChild(this.$refs["popup"]);
			
			this.$nextTick(() => {
				const width = this.$refs["popup"].clientWidth;
				const height = this.$refs["popup"].clientHeight;
				let offset = this.$refs["content"].getBoundingClientRect();
				let selectionOffset = Math.max(this.selectedIndex, 0) * -32

				Object.assign(this.$refs["popup"].style, {
					top: `${Math.max(Math.min(window.innerHeight - (height + 1), offset.top - 4 + selectionOffset), 0)}px`,
					left: `${Math.max(Math.min(window.innerWidth - (width + 1), offset.left), 0)}px`,
					minWidth: `${this.$refs["content"].clientWidth}px`
					// transform: `translate3d(0, ${selectionOffset}px, 0)`
				});
			});
			
			event.stopPropagation();
			
			this.eventListener = this._closeDropDown_internal.bind(this);
			document.addEventListener("click", this.eventListener, true);
		},
		_closeDropDown_internal(event) {
			if (!event.target.parentNodeOfClass("combo-box-popup")) {
				event.preventDefault();
				event.stopPropagation();

				this._closeDropDown();
			}
		},
		_closeDropDown(event, item) {
			this.dropDownOpen = false;
			document.removeEventListener("click", this.eventListener, true);
			
			event.stopPropagation();
			
			if (!item) return;
			
			this.$data._value = item;
			
			if (this.itemsSource instanceof Array) {
				this.selectedIndex = this.itemsSource.indexOf(item);
			} else {
				this.selectedIndex = Object.keys(this.itemsSource).indexOf(item);
			}
			this.$refs["select"].value = item;
			
			this.$emit("input", this.$data._value);
		}
	},
	computed: {
		items() {
			if (this.itemsSource instanceof Array) {
				return this.itemsSource.reduce((out, item) => ({
					...out,
					[item]: item
				}), {});
			} else if (this.itemsSource instanceof Object) {
				return this.itemsSource;
			}
		}
	}
}
</script>
