<template>
	<div>
		<MetroStackPanel style="margin-top: 40px; margin-bottom: 16px">
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="top">
				<MetroTextBlock text-style="sub-title">{{ title }}</MetroTextBlock>
				<router-link :to="`/sections?order=${orderBy}`" class="hyperlink-button" v-if="appData.length > 12 || true" style="margin-left: 12px; white-space: nowrap; line-height: 27px">{{ $t('start.see_all') }}: {{ appData.length >= 100 ? "99+" : appData.length }}</router-link>
			</MetroStackPanel>
		</MetroStackPanel>
		
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left" style="max-width: 100vw; overflow-y: auto; margin: 0 -12px; padding: 0 12px;">
			<router-link tag="div" :to="`/package/${packageObj.identifier}`" class="lockup-collection-cell" v-for="(packageObj, index) in limitedData" :key="index">
				<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" class="icon-container">
					<img :src="`http://localhost:3000/media/icon/${packageObj.id}`" v-if="packageObj.iconMime" />
					<MetroTextBlock class="contrast-text" style="position: relative; width: 32px; height: 32px" v-if="!packageObj.iconMime">
						<MetroFontIcon glyph="&#xE739;" font-size="32px" style="position: absolute" />
						<MetroFontIcon glyph="&#xE894;" font-size="32px" style="position: absolute" />
					</MetroTextBlock>
				</MetroStackPanel>
				
				<MetroStackPanel class="description-container" style="padding: 8px">
					<div>
						<MetroTextBlock text-style="base">{{ packageObj.name }}</MetroTextBlock>
						<CurrentRating :rating-data="packageObj.ratings" />
					</div>
					
					<MetroTextBlock text-style="caption">{{ packageObj.price ? null : $t('package.price_free') }}</MetroTextBlock>
				</MetroStackPanel>
			</router-link>
			
			<router-link tag="div" :to="`/sections?order=${orderBy}`" class="lockup-collection-cell" v-if="appData.length > 12">
				<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" style="height: 100%">
					<MetroFontIcon font-size="12px" glyph="&#xE0E3;" style="margin-bottom: 20px" />
					<MetroTextBlock text-style="base" style="margin-bottom: -39px">{{ $t('start.see_all') }}: {{ appData.length >= 100 ? "99+" : appData.length }}</MetroTextBlock>
				</MetroStackPanel>
			</router-link>
		</MetroStackPanel>
	</div>
</template>

<script>
import CurrentRating from '@/components/CurrentRating'

export default {
	name: "AppPresentation",
	components: {
		CurrentRating
	},
	props: ["appData", "title", "sectionUrl", "orderBy"],
	computed: {
		limitedData() {
			return [...this.appData].splice(0,12);
		}
	}
}
</script>

<style lang="less">
.lockup-collection-cell {
	display: flex;
	flex-direction: column;
	width: 162px;
	height: 272px;
	background-color: var(--list-low);
	
	&:not(:last-child) {
		margin-right: 12px;
	}
	
	&:last-child:after {
		content: '';
		display: block;
		margin-left: 100%;
		width: 12px;
		height: 1px;
		visibility: hidden;
	}
	
	.icon-container {
		width: 162px;
		height: 162px;
		background-color: var(--system-accent-color);
		
		img {
			width: 100%;
			height: 100%;
		}
	}
	
	& > .stack-panel.description-container {
		flex: 1;
		justify-content: space-between;
		
		.text-block.base {
			max-height: 38px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}
</style>