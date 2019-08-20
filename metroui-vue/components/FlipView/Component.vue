<template>
	<div class="flip-view">
		<div class="scrolling-host">
			<div class="scroll-content" :style="`transform: translate3d(-${this.page * 100}%, 0, 0)`" ref="scroll-content">
				
					<div class="flip-view-item">
						<div class="item" style="width: 400px; height: 270px; background-color: #f0f">1</div>
					</div>
					<div class="flip-view-item">
						<div class="item" style="width: 400px; height: 270px; background-color: #f0f">2</div>
					</div>
					<div class="flip-view-item">
						<div class="item" style="width: 400px; height: 270px; background-color: #f0f">3</div>
					</div>
					<div class="flip-view-item">
						<div class="item" style="width: 400px; height: 270px; background-color: #f0f">4</div>
					</div>
					<div class="flip-view-item">
						<div class="item" style="width: 400px; height: 270px; background-color: #f0f">5</div>
					</div>

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
			itemCount: this.$refs["scroll-content"]
		}
	},
	mounted() {
		this.itemCount = this.$refs["scroll-content"].querySelectorAll(".flip-view-item").length;
	},
	methods: {
		previousPage() {
			this.page = Math.max(this.page - 1, 0);
		},
		nextPage() {
			this.page = Math.min(this.page + 1, this.itemCount - 1);
		}
	}
}
</script>