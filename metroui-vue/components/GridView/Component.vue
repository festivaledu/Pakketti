<template>
	<div :class="`grid-view ${flowDirection}`">
		<div class="grid-view-item" :class="{'selected': selectedItems.indexOf(index) >= 0}" v-for="(item, index) in itemsSource" :key="index" @click="_selectItem($event, index)">
			<div class="grid-view-item-content">
				<slot name="item-template" :local="item" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroGridView",
	props: {
		itemsSource: Array,
		flowDirection: {
			type: String,
			default: "left-to-right",
			validator: value => {
				return ["left-to-right", "right-to-left"].indexOf(value) >= 0
			}
		},
		selectionMode: {
			type: String,
			default: "none",
			validator: value => {
				return ["none", "single", "multiple"].indexOf(value) >= 0
			}
		}
	},
	data() {
		return {
			selectedItems: []
		}
	},
	methods: {
		_selectItem(event, index) {
			switch (this.selectionMode) {
				case "none": return;
				case "single":
					if ((navigator.userAgent.match(/windows|linux/i) && event.ctrlKey) || (navigator.userAgent.match(/macintosh/i) && event.metaKey) || "ontouchend" in window) {
						if (this.selectedItems.indexOf(index) >= 0) {
							this.selectedItems = [];
						} else {
							this.selectedItems = [index];
						}
					} else {
						if (this.selectedItems.indexOf(index) >= 0) return;
						this.selectedItems = [index];
					}
					break;
				case "multiple":
					if ((navigator.userAgent.match(/windows|linux/i) && event.ctrlKey) || (navigator.userAgent.match(/macintosh/i) && event.metaKey) || "ontouchend" in window) {
						if (this.selectedItems.indexOf(index) >= 0) {
							this.selectedItems.splice(this.selectedItems.indexOf(index), 1);
						} else {
							this.selectedItems.push(index);
						}
					} else {
						this.selectedItems = [index];
					}
					break;
				default: return;
			}
			
			this.$emit("selectionChanged", this, {});
		}
	}
}
</script>
