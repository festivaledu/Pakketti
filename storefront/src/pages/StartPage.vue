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
			
			<AppPresentationCell :app-data="mostDownloadedPackages" title="Most Downloaded" />
			<AppPresentationCell :app-data="recentlyUpdatedPackages" title="Recently Updated" />
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
	@media all and (min-width: 641px) {
		.promo-flip-view {
				&:before {
				content: '';
				display: block;
				padding-top: 37.65%;
			}
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
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import AppPresentationCell from '@/components/AppPresentationCell'
import CurrentRating from '@/components/CurrentRating'

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
		AppPresentationCell,
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