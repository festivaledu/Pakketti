<template>
	<div class="app-bar-button" :disabled="disabled" @click="emit('click')">
		<slot name="icon" v-if="!icon" />
		
		<i v-if="icon" :class="`icon ${icon}`" />
		<label>{{ label }}</label>
	</div>
</template>

<script>
export default {
	name: "MetroAppBarButton",
	props: {
		icon: String,
		label: String,
		disabled: Boolean
	},
	methods: {
		emit(eventName) {
			this.$emit(eventName);
		}
	}
}
</script>