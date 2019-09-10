<template>
	<MetroPage page-id="packages" @navigatedTo.native="onNavigatedTo">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
	</MetroPage>
</template>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

export default {
	name: "PackagePage",
	data() {
		return {
			packageData: null
		}
	},
	methods: {
		async onNavigatedTo(event) {
			this.packageData = null;
			// this.packageData = await PackageAPI.getPackages({
			// 	"package.identifier": event.detail.packageId,
			// 	include: "reviews,screenshots,versions"
			// });
		}
	}
}
</script>