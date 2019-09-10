<template>
	<MetroPage page-id="start" @navigatedTo.native="onNavigatedTo">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<MetroFlipView class="promo-flip-view" v-show="featuredPackages.length">
				<template v-for="(packageObj, index) in featuredPackages">
					<MetroFlipViewItem :key="index">
						<router-link tag="div" :to="`/package/${packageObj.identifier}`" class="editorial-item-container" :style="`background-image: url(http://localhost:3000/media/hero/${packageObj.id})`">
							<MetroStackPanel horizontal-alignment="center" vertical-alignment="bottom">
								<MetroTextBlock text-style="sub-title">{{ packageObj.name }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ packageObj.shortDescription }}</MetroTextBlock>
							</MetroStackPanel>
						</router-link>
					</MetroFlipViewItem>
				</template>
			</MetroFlipView>
			
			<AppPresentation :app-data="mostDownloadedPackages" title="Most Downloaded" />
			<AppPresentation :app-data="recentlyUpdatedPackages" title="Recently Updated" />
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
			padding-bottom: 24px !important;
		}
		
		.promo-flip-view {
			height: 300px;
		}
	}
	@media all and (min-width: 1008px) {
		& > .page-content {
			padding-left: 48px !important;
			padding-right: 48px !important;
			padding-bottom: 48px !important;
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
			background: linear-gradient(to bottom, rgba(0,0,0,0) 60%,rgba(0,0,0,0.6) 100%);
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
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import AppPresentation from '@/components/AppPresentationComponent'
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
		AppPresentation,
		CurrentRating
	},
	data() {
		return {
			packageData: null
		}
	},
	async mounted() {
		this.packageData = await PackageAPI.getPackages({
			include: "ratings"
		});
	},
	methods: {
		async onNavigatedTo() {
			this.$parent.setHeader("Start");
		}
	},
	computed: {
		featuredPackages() {
			let _packageData = [...this.packageData].filter(_ => _.headerImageMime !== null);
			return shuffle(_packageData).splice(0,5);
		},
		mostDownloadedPackages() {
			let _packageData = [...this.packageData];
			return _packageData.sort((a, b) => b.downloadCount - a.downloadCount).splice(0, 12);
		},
		recentlyUpdatedPackages() {
			let _packageData = [...this.packageData];
			return _packageData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).splice(0, 12);
		}
	}
}
</script>