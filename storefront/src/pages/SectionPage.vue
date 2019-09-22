<template>
	<MetroPage page-id="section">
		<!-- <vue-headful :title="`${$t(`section.${$route.params.sectionId}`)} – ${$t('app.name')}`" /> -->
		
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<MetroTextBlock text-style="sub-header" style="font-size: 24px; font-weight: 500; margin-top: 12px">{{ $t(`start.${this.orderBy}`) }}</MetroTextBlock>
			<div class="row mt-3">
				<div class="col col-12 col-md-6 col-lg-4 col-xl-3">
					<MetroComboBox
						:header="$t('sections.charts')"
						:items-source="{
							'most_popular': $t('start.most_popular'),
							'most_downloaded': $t('start.most_downloaded'),
							'recently_updated': $t('start.recently_updated')
						}"
						v-model="orderBy"
					/>
				</div>
				<div class="col col-12 col-md-6 col-lg-4 col-xl-3">
					<MetroComboBox
						:header="$t('sections.category_title')"
						:placeholder-text="$t('sections.category_placeholder')"
						:items-source="{
							'all': $t('section.all'),
							'Administration': $t('section.Administration'),
							'Apps': $t('section.Apps'),
							'Archiving': $t('section.Archiving'),
							'Development': $t('section.Development'),
							'Fonts': $t('section.Fonts'),
							'Networking': $t('section.Networking'),
							'Packaging': $t('section.Packaging'),
							'Security': $t('section.Security'),
							'System': $t('section.System'),
							'Tweaks': $t('section.Tweaks'),
							'Utilities': $t('section.Utilities'),
							'Wallpaper': $t('section.Wallpaper'),
						}"
						v-model="section"
					/>
				</div>
			</div>
			
			<template v-if="packageData && !filteredData.length">
				<MetroTextBlock text-style="sub-title" class="mt-4">{{ $t('developer.no_results') }}</MetroTextBlock>
			</template>
			
			<template v-if="packageData && filteredData.length">
				<div class="lockup-collection-view">
					<router-link tag="div" :to="`/package/${packageObj.identifier}`" class="lockup-collection-cell" v-for="(packageObj, index) in filteredData" :key="index">
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
				</div>
			</template>
		</template>
	</MetroPage>
</template>

<script>
var shuffle = function(a) {
	for (var i = a.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var t = a[i];
		a[i] = a[j];
		a[j] = t;
	}

	return a;
}

import { AccountAPI, PackageAPI } from '@/scripts/ApiUtil'

import AppPresentationCell from '@/components/AppPresentationCell'
import CurrentRating from '@/components/CurrentRating'

export default {
	name: "SectionPage",
	components: {
		AppPresentationCell,
		CurrentRating,
	},
	data: () => ({
		packageData: null,
		orderBy: "most_popular",
		section: "all"
	}),
	updated() {
		this.$parent.setSelectedMenuItem(this.section.toLowerCase());
	},
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			include: "ratings,versions"
		});
		
		next(vm => {
			vm.packageData = _packageData;
			
			if (to.query.section) {
				vm.section = to.query.section;
			}
			if (to.query.order) {
				vm.orderBy = to.query.order;
			}
			
			vm.$parent.setSelectedMenuItem(to.query.section.toLowerCase());
		});
	},
	async beforeRouteUpdate(to, from, next) {
		this.packageData = await PackageAPI.getPackages({
			include: "ratings,versions"
		});

		// this.$parent.setHeader(this.$t(`section.${to.params.sectionId}`));
		this.$parent.setSelectedMenuItem(to.query.section.toLowerCase());
		
		if (to.query.section) {
			this.section = to.query.section;
		}
		if (to.query.order) {
			this.orderBy = to.query.order;
		}
		
		next();
	},
	computed: {
		filteredData() {
			let _packageData = [...this.packageData].filter(packageObj => this.section == "all" ? true : packageObj.section == this.section);
			
			switch (this.orderBy) {
				case "most_popular":
					return shuffle(_packageData);
				case "most_downloaded":
					return _packageData.sort((a, b) => b.downloadCount - a.downloadCount);
				case "recently_updated":
					return _packageData.sort((a, b) => new Date(b.versions.length ? b.versions[0].createdAt : b.updatedAt).getTime() - new Date(a.versions.length ? a.versions[0].createdAt : a.updatedAt).getTime());
				default: break;
			}
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="section"] {
	.lockup-collection-view {
		display: flex;
		flex-wrap: wrap;
		margin-top: 24px;
		
		.lockup-collection-cell {
			margin-bottom: 12px;
		}
	}
}
</style>