<template>
	<div class="navigation-view-item-header">
		<MetroTextBlock textStyle="base" :text="content" />
	</div>
</template>

<script>
export default {
	name: "MetroNavigationViewItemHeader",
	props: {
		content: String
	}
}
</script>
