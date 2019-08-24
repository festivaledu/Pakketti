<template>
	<div class="flip-view">
		<div class="scrolling-host">
			<div class="scroll-content" :style="`transform: translate3d(-${this.page * 100}%, 0, 0)`" ref="scroll-content">
				<slot />
			</div>
		</div>
		<MetroButton class="previous-button" @click="previousPage" v-show="this.page > 0">
			<MetroFontIcon font-size="12pt" glyph="&#xE0E2;" />
		</MetroButton>
		<MetroButton class="next-button" @click="nextPage" v-show="this.page < this.itemCount - 1">
			<MetroFontIcon font-size="12pt" glyph="&#xE0E3;" />
		</MetroButton>
	</div>
</template>

<script>
export default {
	name: "MetroFlipView",
	data() {
		return {
			page: 0,
			itemCount: -1
		}
	},
	mounted() {
		if (this.$refs["scroll-content"].querySelector(".flip-view-item")) {
			this.itemCount = this.$refs["scroll-content"].querySelectorAll(".flip-view-item").length;
		}
	},
	methods: {
		previousPage() {
			this.page = Math.max(this.page - 1, 0);
		},
		nextPage() {
			this.page = Math.min(this.page + 1, this.itemCount - 1);
		}
	},
	calculated: {
		flipViewItems() {
			return this.$slots.default;
		}
	}
}
</script>