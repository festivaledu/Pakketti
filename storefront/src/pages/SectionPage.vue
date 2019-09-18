<template>
	<MetroPage page-id="section">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<MetroTextBlock text-style="sub-header" style="font-size: 24px; font-weight: 500; margin-top: 12px">{{ $t(`section.${$route.params.sectionId}`) }}</MetroTextBlock>
			
			<template v-if="packageData && !packageData.length">
				<MetroTextBlock text-style="sub-title" >{{ $t('developer.no_results') }}</MetroTextBlock>
			</template>
			
			<template v-if="packageData && packageData.length">
				<div class="lockup-collection-view">
					<router-link tag="div" :to="`/package/${packageObj.identifier}`" class="lockup-collection-cell" v-for="(packageObj, index) in packageData" :key="index">
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
		packageData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			"package.section": to.params.sectionId,
			include: "ratings,versions"
		});
		
		next(vm => {
			vm.packageData = _packageData;
			
			vm.$parent.setHeader(vm.$t(`section.${to.params.sectionId}`));
			vm.$parent.setSelectedMenuItem(to.params.sectionId.toLowerCase());
		});
	},
	async beforeRouteUpdate(to, from, next) {
		this.packageData = await PackageAPI.getPackages({
			"package.section": to.params.sectionId,
			include: "ratings,versions"
		});

		this.$parent.setHeader(this.$t(`section.${to.params.sectionId}`));
		this.$parent.setSelectedMenuItem(to.params.sectionId.toLowerCase());
		
		next();
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