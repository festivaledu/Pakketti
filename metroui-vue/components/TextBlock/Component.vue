<template>
	<p :class="`text-block ${textStyle}`" :style="{'text-align': textAlignment}">
		<slot />
		<template v-if="!this.$slots.default">{{ text }}</template>
	</p>
</template>

<script>
export default {
	name: "MetroTextBlock",
	props: {
		text: null,
		textStyle: {
			type: String,
			default: "body"
		},
		textAlignment: {
			type: String,
			default: "left"
		}
	}
}
</script>
