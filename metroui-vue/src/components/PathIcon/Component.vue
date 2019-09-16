<template>
	<div class="path-icon">
		<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<path :d="data" />
		</svg>
	</div>
</template>

<script>
export default {
	name: "MetroPathIcon",
	props: {
		data: String
	}
}
</script>
