<template>
	<a class="hyperlink-button" :href="navigateUri ? navigateUri : '#'" :disabled="disabled" @click="onClick">
		<slot />
		<template v-if="!this.$slots.default">{{ content }}</template>
	</a>
</template>

<script>
export default {
	name: "MetroHyperlinkButton",
	props: {
		content: String,
		navigateUri: String,
		disabled: Boolean
	},
	methods: {

		onClick(e) {
			if (!this.navigateUri) e.preventDefault();
			this.$emit("click", e);
		},
	}
}
</script>
