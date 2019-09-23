<template>
	<div class="radio-button" :disabled="disabled">
		<input type="radio" :name="groupName" :id="uuid" :checked="checked" :value="name" @change="_onChange" />
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
			e.target.dispatchEvent(new Event("input"));
		}
	},
	computed: {
		checked() {
			return this.value === this.name;
		}
	}
}
</script>

