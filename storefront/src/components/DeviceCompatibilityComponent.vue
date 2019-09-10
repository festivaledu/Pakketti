<template>
	<div class="device-compat-badge">
		<MetroStackPanel orientation="horizontal" vertical-alignment="center">
			<MetroFontIcon :glyph="glyph" font-size="20px" />
			<MetroTextBlock :text="label" style="margin-left: 8px" />
		</MetroStackPanel>
	</div>
</template>

<style lang="less">
.device-compat-badge {
	display: inline-block;
	height: 30px;
	padding: 0 15px;
	background-color: var(--list-low);
	border-radius: 15px;
	
	.stack-panel {
		height: 100%;
	}
	
	& + .device-compat-badge {
		margin-left: 16px;
	}
}
</style>

<script>
export default {
	name: "DeviceCompatibility",
	props: {
		glyph: String,
		label: String
	}
}
</script>