<template>
	<MetroPage page-id="developer">
		<vue-headful :title="`${$t('root.header.developer')} – ${$t('app.name')}`" />
		
		<template v-if="!developerData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="developerData">
			<MetroTextBlock text-style="sub-header" style="font-size: 24px; font-weight: 500; margin-top: 12px">{{ $t('developer.published_by', { username: developerData.username }) }}</MetroTextBlock>
			
			<template v-if="packageData && !packageData.length">
				<MetroTextBlock text-style="sub-title" >{{ $t('developer.no_results') }}</MetroTextBlock>
			</template>
			
			<template v-if="packageData && packageData.length">
				<div class="lockup-collection-view">
					<router-link tag="div" :to="`/package/${packageObj.identifier}`" class="lockup-collection-cell" v-for="(packageObj, index) in packageData" :key="index">
						<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" class="icon-container">
							<img :src="`/media/icon/${packageObj.id}`" v-if="packageObj.iconMime" />
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
	name: "DeveloperPage",
	components: {
		AppPresentationCell,
		CurrentRating,
	},
	data: () => ({
		developerData: null,
		packageData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _developerData = await AccountAPI.getUser({
			"account.username": to.params.developerId,
		});
		
		let _packageData = (!Object.keys(_developerData).length || _developerData.error) ? null : await PackageAPI.getPackages({
			"package.accountId": _developerData.id,
			include: "ratings"
		});
		
		next(vm => {
			if (!Object.keys(_developerData).length || _developerData.error) {
				vm.developerData = {};
			} else {
				vm.developerData = _developerData;
			}
			
			vm.packageData = _packageData;
			
			vm.$parent.setHeader(vm.$t('root.header.start'));
			vm.$parent.setSelectedMenuItem("start");
		});
	}
}
</script>

<style lang="less">
.page[data-page-id="developer"] {
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