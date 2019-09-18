<template>
	<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center" class="current-rating" v-if="this.ratingCount">
		<div class="rating-stars">
			<div class="rating-value" :style="{'width': `${ratingPercentage}%`}"></div>
		</div>
		<MetroTextBlock text-style="caption">{{ ratingCount | number }}</MetroTextBlock>
	</MetroStackPanel>
</template>

<script>
export default {
	name: "CurrentRatingComponent",
	props: {
		ratingData: null
	},
	computed: {
		ratingCount() {
			return this.ratingData.length;
			// return 1337;
		},
		ratingValue() {
			return this.ratingData.map(ratingObj => ratingObj.value).reduce((t, c) => t += c) / this.ratingCount;
		},
		ratingPercentage() {
			return (this.ratingValue / 5) * 100;
		}
	},
	filters: {
		number(value) {
			return new Intl.NumberFormat().format(value)
		}
	}
}
</script>

<style lang="less">
.encoded-svg-mask(@svg) {
	@url: `encodeURIComponent(@{svg})`;
	mask-image: url("data:image/svg+xml;charset=utf-8,@{url}");
}

.current-rating {
	margin: 6px 0;
	
	.rating-stars {
		width: 76px;
		height: 12px;
		background-color: var(--base-low);
		margin-right: 8px;
		margin-bottom: 3px;
		
		.encoded-svg-mask("<svg width='76px' height='12px' viewBox='0 0 76 12' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><path d='M8.296875,7.34765625 L12,4.5 L7.40625,4.5 L6,0 L4.59375,4.5 L0,4.5 L3.703125,7.34765625 L2.25,12 L6,9.1171875 L9.75,12 L8.296875,7.34765625 Z M24.296875,7.34765625 L28,4.5 L23.40625,4.5 L22,0 L20.59375,4.5 L16,4.5 L19.703125,7.34765625 L18.25,12 L22,9.1171875 L25.75,12 L24.296875,7.34765625 Z M40.296875,7.34765625 L44,4.5 L39.40625,4.5 L38,0 L36.59375,4.5 L32,4.5 L35.703125,7.34765625 L34.25,12 L38,9.1171875 L41.75,12 L40.296875,7.34765625 Z M56.296875,7.34765625 L60,4.5 L55.40625,4.5 L54,0 L52.59375,4.5 L48,4.5 L51.703125,7.34765625 L50.25,12 L54,9.1171875 L57.75,12 L56.296875,7.34765625 Z M72.296875,7.34765625 L76,4.5 L71.40625,4.5 L70,0 L68.59375,4.5 L64,4.5 L67.703125,7.34765625 L66.25,12 L70,9.1171875 L73.75,12 L72.296875,7.34765625 Z' /></svg>");
		
		.rating-value {
			width: 0;
			height: 100%;
			background-color: var(--base-medium);
		}
		
		& + .text-block.caption {
			color: var(--base-medium-low);
			font-size: inherit;
		}
	}
}
</style>