<template>
	<div class="toggle-switch" :disabled="disabled">
		<label class="header" v-if="header">{{ header }}</label>
		
		<input type="checkbox" :id="uuid" :checked="value" @change="_onChange" />
		<label class="switch-knob" :for="uuid">
			<p class="item-content">{{ checked ? onContent : offContent }}</p>
		</label>
	</div>
</template>

<script>
import uuid from 'uuid/v4'

export default {
	name: "MetroToggleSwitch",
	props: {
		header: String,
		onContent: {
			type: String,
			default: "On",
		},
		offContent: {
			type: String,
			default: "Off",
		},
		disabled: Boolean,
		value: Boolean
	},
	data() {
		return {
			uuid: uuid(),
			checked: this.$props.value
		}
	},
	methods: {
		_onChange(e) {
			this.$data.checked = e.target.checked;
			
			if (e.target.checked) {
				this.$emit("checked", e);
			} else {
				this.$emit("unchecked", e);
			}
			
			this.$emit("toggled", e.target.checked);
			this.$emit("input", e.target.checked);
		}
	}
}
</script>

