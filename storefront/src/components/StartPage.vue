<template>
	<MetroPage page-id="start">
		<MetroFlipView class="promo-flip-view">
			<MetroFlipViewItem v-for="(index) in Array(4)" :key="index">
				<div class="editorial-item-container" style="background-image: url(http://via.placeholder.com/1920x1080)">
					<MetroStackPanel horizontal-alignment="center" vertical-alignment="bottom">
						<MetroTextBlock text-style="sub-title">Test Application</MetroTextBlock>
						<MetroTextBlock text-style="caption">This is an example description</MetroTextBlock>
					</MetroStackPanel>
				</div>
			</MetroFlipViewItem>
		</MetroFlipView>
		
		<MetroStackPanel style="margin-top: 40px; margin-bottom: 16px">
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center">
				<MetroTextBlock text-style="sub-title">Most Downloaded</MetroTextBlock>
				<MetroHyperlinkButton style="margin-left: 12px">See All: { count }</MetroHyperlinkButton>
			</MetroStackPanel>
		</MetroStackPanel>
		
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left">
			<div class="lockup-collection-cell" v-for="(index) in Array(5)" :key="index">
				<div class="icon-container">
					<img src="http://via.placeholder.com/512x512/0078d7/ffffff?text=App%20Icon" />
				</div>
				
				<MetroStackPanel style="padding: 8px">
					<div>
						<MetroTextBlock text-style="base">App Name</MetroTextBlock>
						<CurrentRating />
					</div>
					
					<MetroTextBlock text-style="caption">Free</MetroTextBlock>
				</MetroStackPanel>
			</div>
		</MetroStackPanel>
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
		background-color: var(--base-low);
		
		&:not(:last-child) {
			margin-right: 12px;
		}
		
		.icon-container {
			width: 162px;
			height: 162px;
			background-color: var(--list-low);
			
			img {
				width: 100%;
				height: 100%;
			}
		}
		
		& > .stack-panel {
			flex: 1;
			justify-content: space-between;
			
			.text-block.base {
				max-height: 38px;
			}
		}
	}
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import CurrentRating from '@/components/CurrentRatingComponent'

export default {
	name: "StartPage",
	components: {
		CurrentRating
	}
}
</script>