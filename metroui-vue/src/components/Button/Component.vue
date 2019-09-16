<template>
	<button :disabled="disabled" @click="emit('click', $event)">
		<slot />
		<template v-if="!this.$slots.default">{{ content }}</template>
	</button>
</template>

<script>
export default {
	name: "MetroButton",
	props: {
		content: String,
		disabled: Boolean
	},
	methods: {
		emit(eventName, eventData) {
			this.$emit(eventName, eventData);
		}
	}
}
</script>