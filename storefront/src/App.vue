<template>
	<router-view />
</template>

<style lang="less">
a {
	color: var(--system-accent-color);
	
	&:hover:not(:active) {
		color: var(--base-medium);
	}
	
	&:active {
		color: var(--base-medium-low);
	}
	
	&[disabled] {
		pointer-events: none;
		color: var(--base-medium-low);
	}
}
</style>