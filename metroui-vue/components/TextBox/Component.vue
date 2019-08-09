<template>
	<div class="text-box" :disabled="disabled">
		<label v-if="header">{{ header }}</label>
		<input
			type="text"
			v-if="!textarea"
			:name="name"
			:placeholder="placeholderText"
			:value="value"
			:minlength="minlength"
			:maxlength="maxlength"
			:required="required"
			autocomplete="off"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
			@keydown="onKeyDown"
			@keyup="onKeyUp"
			:readonly="readOnly"
		/>
		
		<textarea
			v-if="textarea"
			:name="name"
			:placeholder="placeholderText"
			:value="value"
			:minlength="minlength"
			:maxlength="maxlength"
			:required="required"
			autocomplete="off"
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
	name: "MetroTextBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		disabled: Boolean,
		readOnly: Boolean,
		value: null,
		
		minlength: {
			type: Number,
			default: 0
		},
		maxlength: {
			type: Number,
			default: -1
		},
		required: false,
		
		textarea: false
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
