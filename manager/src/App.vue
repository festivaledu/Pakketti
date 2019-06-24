<template>
	<router-view/>
</template>

<style lang="less">
	html {
		background-image: none;
		background-color: var(--alt-high);
		
		::-webkit-scrollbar { 
			display: none; 
		}
	}
		
	.acrylic {
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
</style>