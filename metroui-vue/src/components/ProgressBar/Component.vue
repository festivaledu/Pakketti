<template>
	<div class="progress-bar">
		<div class="determinate-root" v-show="!indeterminate">
			<div class="progress-bar-indicator" :style="`width: ${indicatorWidth}%`"></div>
		</div>
		<div class="indeterminate-root" v-show="indeterminate">
			<div class="ellipse" v-for="(item, index) in Array(5)" :style="`transform: translate3d(${index * -8}px, 0, 0); animation-delay: ${-3880 + (index * 100)}ms`" :key="index" />
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroProgressBar",
	props: {
		value: 0,
		minimum: {
			type: Number,
			default: 0
		},
		maximum: {
			type: Number,
			default: 100
		},
		indeterminate: Boolean
	},
	computed: {
		indicatorWidth() {
			return Math.min(Math.max(((this.value - this.minimum) * 100) / (this.maximum - this.minimum), 0), 100);
		}
	}
}
</script>
