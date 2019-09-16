<template>
	<div class="font-icon">
		<p :style="{'font-family': fontFamily, 'font-size': fontSize, 'font-style': fontStyle}" v-html="glyph" />
	</div>
</template>

<script>
export default {
	name: "MetroFontIcon",
	props: {
		fontFamily: {
			type: String,
			default: "Segoe MDL2 Assets"
		},
		fontSize: {
			type: String,
			default: "20px"
		},
		fontStyle: {
			type: String,
			default: "normal"
		},
		glyph: String
	}
}
</script>