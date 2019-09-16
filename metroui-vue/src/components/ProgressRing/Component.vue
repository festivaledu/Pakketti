<template>
	<div class="progress-ring" v-show="active">
		<div class="ellipse" v-for="(item, index) in Array(6)" :style="`animation-delay: ${-4260 + (index * 166)}ms`" :key="index" />
	</div>
</template>

<script>
export default {
	name: "MetroProgressRing",
	props: {
		active: Boolean
	}
}
</script>
