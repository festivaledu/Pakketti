<template>
	<router-view/>
</template>

<style src="metroui-vue/metroUI-4.0.css"></style>
<style src="metroui-vue/metroUI-4.0-colors.css"></style>
<style lang="less">
	html {
		background-image: none;
		background-color: var(--alt-high);
		
		::-webkit-scrollbar { 
			display: none; 
		}
	}
		
	.acrylic:not(.notification) {
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	
	.data-grid .toggle-switch {
		margin-bottom: 0;
	}
	
	body[data-theme="light"] {
		.acrylic:not(.notification) {
			&.acrylic-80 {
				background-color: darken(#FFF, 5%) !important;
			}
			&.acrylic-70 {
				background-color: darken(#FFF, 10%) !important;
			}
			&.acrylic-60 {
				background-color: darken(#FFF, 15%) !important;
			}
		}
	}

	body[data-theme="dark"] {
		.acrylic:not(.notification) {
			&.acrylic-80 {
				background-color: lighten(#000, 5%) !important;
			}
			&.acrylic-70 {
				background-color: lighten(#000, 10%) !important;
			}
			&.acrylic-60 {
				background-color: lighten(#000, 15%) !important;
			}
		}
	}
</style>