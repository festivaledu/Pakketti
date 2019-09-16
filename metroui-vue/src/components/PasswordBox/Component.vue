<template>
	<div class="password-box" :disabled="disabled">
		<label v-if="header">{{ header }}</label>
		<input
			type="password"
			:name="name"
			:placeholder="placeholderText"
			:value="value"
			:minlength="minLength"
			:maxlength="maxLength"
			:required="required"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
			@keydown="onKeyDown"
			@keyup="onKeyUp"
			:readonly="readOnly"
		/>
	</div>
</template>

<script>
export default {
	name: "MetroPasswordBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		disabled: Boolean,
		readOnly: Boolean,
		value: null,
		
		minLength: 0,
		maxLength: -1,
		required: false
	},
	methods: {
		onInput(e) {
			this.$emit("input", e.target.value);
		},
		onFocus(e) {
			this.$emit("focus", e);
		},
		onBlur(e) {
			this.$emit("blur", e);
		},
		onKeyDown(e) {
			this.$emit("keydown", e);
		},
		onKeyUp(e) {
			this.$emit("keyup", e);
		}
	}
}
</script>
