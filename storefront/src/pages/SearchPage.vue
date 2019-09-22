<template>
	<MetroPage page-id="search">
		<vue-headful :title="`${$t('root.header.search')} – ${$t('app.name')}`" />
		
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<MetroTextBlock text-style="sub-header" style="font-size: 24px; font-weight: 500; margin-top: 12px">{{ $t('search.results_for', { query: $route.query.query }) }}</MetroTextBlock>
			
			<template v-if="packageData && !Object.keys(filteredData).length">
				<MetroTextBlock text-style="sub-title" >{{ $t('developer.no_results') }}</MetroTextBlock>
			</template>
			
			<template v-if="packageData && Object.keys(filteredData).length">
				<AppPresentationCell v-for="(appData, section, index) in filteredData" :app-data="appData" :title="$t(`section.${section}`)" :key="index" />
			</template>
		</template>
	</MetroPage>
</template>

<script>
import FuzzySearch from 'fuzzy-search'
import { PackageAPI } from '@/scripts/ApiUtil'

import AppPresentationCell from '@/components/AppPresentationCell'
import CurrentRating from '@/components/CurrentRating'

export default {
	name: "SearchPage",
	components: {
		AppPresentationCell,
		CurrentRating,
	},
	data: () => ({
		packageData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			include: "ratings,versions"
		});
		
		next(vm => {
			vm.packageData = _packageData;
			
			vm.$parent.setHeader(vm.$t('root.header.start'));
			vm.$parent.setSelectedMenuItem("start");
		});
	},
	computed: {
		filteredData() {
			const searcher = new FuzzySearch(this.packageData, ["name"], {
				sort: true
			});
			let results = searcher.search(decodeURIComponent(this.$route.query.query));
			
			return results.reduce((obj, item) => {
				return {
					...obj,
					[item.section]: (obj[item["section"]] || []).concat(item)
				}
			}, {});
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="search"] {
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