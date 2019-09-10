<template>
	<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center" class="current-rating" v-if="this.ratingCount">
		<div class="rating-stars">
			<div class="rating-value" :style="{'width': `${ratingPercentage}%`}"></div>
		</div>
		<MetroTextBlock text-style="caption">{{ ratingValue | number }}</MetroTextBlock>
	</MetroStackPanel>
</template>

<style lang="less">
.encoded-svg-mask(@svg) {
	@url: `encodeURIComponent(@{svg})`;
	mask-image: url("data:image/svg+xml;charset=utf-8,@{url}");
}

.current-rating {
	margin-top: 6px;
	
	.rating-stars {
		width: 54px;
		height: 9px;
		background-color: var(--base-low);
		margin-right: 4px;
		
		.encoded-svg-mask("<svg width='54px' height='9px' viewBox='0 0 54 9' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><polygon id='Path' points='6.22265625 5.51074219 9 3.375 5.5546875 3.375 4.5 0 3.4453125 3.375 0 3.375 2.77734375 5.51074219 1.6875 9 4.5 6.83789062 7.3125 9' /><polygon id='Path' points='17.4726562 5.51074219 20.25 3.375 16.8046875 3.375 15.75 0 14.6953125 3.375 11.25 3.375 14.0273438 5.51074219 12.9375 9 15.75 6.83789062 18.5625 9' /><polygon id='Path' points='28.7226562 5.51074219 31.5 3.375 28.0546875 3.375 27 0 25.9453125 3.375 22.5 3.375 25.2773438 5.51074219 24.1875 9 27 6.83789062 29.8125 9' /><polygon id='Path' points='39.9726562 5.51074219 42.75 3.375 39.3046875 3.375 38.25 0 37.1953125 3.375 33.75 3.375 36.5273438 5.51074219 35.4375 9 38.25 6.83789062 41.0625 9' /><polygon id='Path' points='51.2226562 5.51074219 54 3.375 50.5546875 3.375 49.5 0 48.4453125 3.375 45 3.375 47.7773438 5.51074219 46.6875 9 49.5 6.83789062 52.3125 9' /></svg>");
		
		.rating-value {
			height: 100%;
			background-color: var(--base-medium);
		}
		
		& + .text-block.caption {
			color: var(--base-medium-low);
		}
	}
}
</style>

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
			return new Intl.NumberFormat("en-US").format(value)
		}
	}
}
</script>