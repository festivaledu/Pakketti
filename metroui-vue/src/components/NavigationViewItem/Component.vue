<template>
	<div class="navigation-view-item" :class="{'icon': icon || this.$slots.icon}" :data-page-id="pageId" :disabled="disabled">
		<div class="navigation-view-item-inner">
			<div class="navigation-view-item-icon" v-if="icon || this.$slots.icon">
				<slot name="icon" />
				<MetroSymbolIcon v-if="icon && !this.$slots.icon" :symbol="icon" />
			</div>
			
			<div class="navigation-view-item-content">
				<slot name="default" />
				<MetroTextBlock v-if="!this.$slots.default" :text="content" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroNavigationViewItem",
	props: {
		icon: String,
		content: String,
		pageId: String,
		disabled: Boolean,
		selected: Boolean
	}
}
</script>
