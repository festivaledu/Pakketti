<template>
	<MetroStackPanel orientation="vertical" horizontal-alignment="left" vertical-alignment="top">
		<MetroTextBlock class="expandable-text" :class="{'expanded': expanded}" ref="text">
			<slot />
		</MetroTextBlock>
		<MetroHyperlinkButton @click="toggle" v-if="expandable" style="text-decoration: none; margin-top: 8px">
			<template v-if="!expanded">
				<MetroTextBlock text-style="base">
					<span>{{ $t('package.description_show_more') }}</span>
					<span style="display: inline-block; font-family: 'Segoe MDL2 Assets'; font-size: 12px; line-height: 19px; padding-left: 8px">&#xE70D;</span>
				</MetroTextBlock>
			</template>
			<template v-if="expanded">
				<MetroTextBlock text-style="base">
					<span>{{ $t('package.description_show_less') }}</span>
					<span style="display: inline-block; font-family: 'Segoe MDL2 Assets'; font-size: 12px; line-height: 19px; padding-left: 8px">&#xE70E;</span>
				</MetroTextBlock>
			</template>
		</MetroHyperlinkButton>
	</MetroStackPanel>
</template>

<style lang="less">
.text-block.expandable-text {
	max-width: 100%;
	
	&:not(.expanded) {
		max-height: 285px;
		overflow: hidden;
	}
	
	& + .hyperlink-button .text-block {
		display: inline-block;
		
		span {
			font-weight: inherit;
		}
	}
}
</style>

<script>
export default {
	name: "ExpandableText",
	props: {
		text: String
	},
	data() {
		return {
			expandable: false,
			expanded: false
		}
	},
	mounted() {
		setTimeout(() => {
			this.expandable = this.$refs["text"].$el.scrollHeight > 285;
		});
	},
	methods: {
		toggle() {
			this.expanded = !this.expanded
		}
	}
}
</script>