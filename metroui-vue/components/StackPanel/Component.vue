<template>
	<div :class="`stack-panel ${orientation} x-${horizontalAlignment} y-${verticalAlignment}`">
		<slot />
	</div>
</template>

<script>
export default {
	name: "MetroStackPanel",
	props: {
		orientation: {
			type: String,
			default: "vertical",
			validator: value => {
				return ["horizontal", "vertical"].indexOf(value) >= 0;
			}
		},
		horizontalAlignment: {
			type: String,
			default: "stretch",
			validator: value => {
				return ["left", "center", "right", "stretch"].indexOf(value) >= 0;
			}
		},
		verticalAlignment: {
			type: String,
			default: "stretch",
			validator: value => {
				return ["top", "center", "bottom", "stretch"].indexOf(value) >= 0;
			}
		}
	}
}
</script>
