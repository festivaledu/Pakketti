<template>
	<div class="checkbox" :disabled="disabled">
		<input type="checkbox" :name="name" :id="uuid" :checked="value" @change="_onChange" />
		<label :for="uuid">{{ content }}</label>
	</div>
</template>

<script>
import uuid from 'uuid/v4'

export default {
	name: "MetroCheckbox",
	props: {
		name: String,
		content: String,
		disabled: Boolean,
		value: Boolean
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
			
			this.$emit("input", e.target.checked);
		}
	}
}
</script>

