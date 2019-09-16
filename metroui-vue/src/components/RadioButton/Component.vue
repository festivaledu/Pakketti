<template>
	<div class="radio-button" @change="_onChange" :disabled="disabled">
		<input type="radio" :id="uuid" :checked="checked" :name="groupName" :value="name" />
		<label :for="uuid">{{ content }}</label>
	</div>
</template>

<script>
import uuid from 'uuid/v4'

export default {
	name: "MetroRadioButton",
	props: {
		groupName: String,
		name: null,
		content: String,
		disabled: Boolean,
		value: null
	},
	data() {
		return {
			uuid: uuid()
		}
	},
	methods: {
		_onChange(e) {
			if (e.target.checked) {
				this.$emit("checked", e);
			} else {
				this.$emit("unchecked", e);
			}
			
			this.$emit("input", e.target.value);
		}
	},
	computed: {
		checked() {
			return this.value === this.name;
		}
	}
}
</script>

