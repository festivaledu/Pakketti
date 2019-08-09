<template>
	<div class="pivot-item" :disabled="disabled">
		<slot />
	</div>
</template>

<script>
export default {
	name: "MetroPivotItem",
	props: {
		header: String,
		disabled: Boolean
	}
}
</script>
