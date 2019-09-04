<template>
	<MetroPage page-id="start">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<MetroFlipView class="promo-flip-view">
				<template v-for="(packageObj, index) in featuredPackages">
					<MetroFlipViewItem :key="index" v-if="packageObj.headerImageMime">
						<div class="editorial-item-container" style="background-image: url(http://via.placeholder.com/1920x1080)">
							<MetroStackPanel horizontal-alignment="center" vertical-alignment="bottom">
								<MetroTextBlock text-style="sub-title">{{ packageObj.name }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ packageObj.shortDescription }}</MetroTextBlock>
							</MetroStackPanel>
						</div>
					</MetroFlipViewItem>
				</template>
			</MetroFlipView>
			
			<MetroStackPanel style="margin-top: 40px; margin-bottom: 16px">
				<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center">
					<MetroTextBlock text-style="sub-title">Most Downloaded</MetroTextBlock>
					<MetroHyperlinkButton style="margin-left: 12px">See All: {{ packageData.length >= 100 ? "99+" : packageData.length }}</MetroHyperlinkButton>
				</MetroStackPanel>
			</MetroStackPanel>
			
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" style="max-width: 100vw; overflow-y: auto; margin: 0 -12px; padding: 0 12px;">
				<div class="lockup-collection-cell" v-for="(packageObj, index) in mostDownloadedPackages" :key="index">
					<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" class="icon-container">
						<img :src="`http://localhost:3000/media/icon/${packageObj.id}`" v-if="packageObj.iconMime" />
						<MetroTextBlock class="contrast-text" style="position: relative; width: 32px; height: 32px">
							<MetroFontIcon glyph="&#xE739;" font-size="32px" style="position: absolute" />
							<MetroFontIcon glyph="&#xE894;" font-size="32px" style="position: absolute" />
						</MetroTextBlock>
					</MetroStackPanel>
					
					<MetroStackPanel style="padding: 8px">
						<div>
							<MetroTextBlock text-style="base">{{ packageObj.name }}</MetroTextBlock>
							<CurrentRating />
						</div>
						
						<MetroTextBlock text-style="caption">Free</MetroTextBlock>
					</MetroStackPanel>
				</div>
			</MetroStackPanel>
		</template>
	</MetroPage>
</template>

<style lang="less">
.page[data-page-id="start"] {
	@media all and (max-width: 640px) {
		.promo-flip-view {
			height: 340px;
		}
	}
	@media all and (min-width: 641px) and (max-width: 1007px) {
		& > .page-content {
			padding-left: 24px !important;
			padding-right: 24px !important;
		}
		
		.promo-flip-view {
			height: 300px;
		}
	}
	@media all and (min-width: 1008px) {
		& > .page-content {
			padding-left: 48px !important;
			padding-right: 48px !important;
		}
		
		.promo-flip-view {
			height: 380px;
		}
	}
	
	.editorial-item-container {
		position: relative;
		width: 100%;
		height: 100%;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		
		.stack-panel {
			position: relative;
			height: 100%;
			padding-bottom: 12px;
			color: #fff;
			z-index: 1;
		}
		
		&:after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 0;
			background: linear-gradient(to bottom, rgba(0,0,0,0) 60%,rgba(0,0,0,0.4) 100%);
		}
	}
	
	.lockup-collection-cell {
		display: flex;
		flex-direction: column;
		width: 162px;
		height: 272px;
		background-color: var(--list-low);
		
		&:not(:last-child) {
			margin-right: 12px;
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
		
		& > .stack-panel:not(.icon-container) {
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
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import CurrentRating from '@/components/CurrentRatingComponent'

var shuffle = function(a) {
	for (var i = a.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var t = a[i];
		a[i] = a[j];
		a[j] = t;
	}

	return a;
}

export default {
	name: "StartPage",
	components: {
		CurrentRating
	},
	data() {
		return {
			packageData: null
		}
	},
	async mounted() {
		this.packageData = await PackageAPI.getPackages();
	},
	computed: {
		featuredPackages() {
			let _packageData = [...this.packageData];
			return shuffle(_packageData).splice(0,5);
		},
		mostDownloadedPackages() {
			let _packageData = [...this.packageData];
			return _packageData.sort((a, b) => b.downloadCount - a.downloadCount).splice(0, 15);
		}
	}
}
</script>