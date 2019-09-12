<template>
	<router-view />
</template>

<style lang="less">
body[data-theme="light"] {
	--store-background: #F7F3F7;
	--package-header-background: #FFFFFF;
}
body[data-theme="dark"] {
	--store-background: #292C29;
	--package-header-background: #292C29;
}


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

.page-content {
	background-color: var(--store-background);
}
</style>