<template>
	<div class="symbol-icon">
		<i :class="`symbol ${symbol}`" v-if="symbol && !icon" />
		<i :class="`icon ${icon}`" v-if="!symbol && icon" />
	</div>
</template>

<script>
export default {
	name: "MetroSymbolIcon",
	props: {
		symbol: String,
		icon: String
	}
}
</script>
