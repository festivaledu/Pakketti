<template>
	<MetroPage page-id="root">
		<MetroNavigationView pane-display-mode="top" pane-title="Team FESTIVAL" ref="navigation-view" :settings-visible="false">
			<template slot="menu-items">
				<MetroNavigationViewItem content="Start" />
				<MetroNavigationViewItem content="Apps" />
				<MetroNavigationViewItem content="Tweaks" />
			</template>
			
			<template slot="auto-suggest-box">
				<MetroTextBox placeholder-text="Search" />
			</template>
			
			<template slot="pane-footer">
				<MetroNavigationViewItem icon="add-friend" content="Sign in" />
				<MetroNavigationViewItem icon="more" content="Sign in" />
			</template>
		</MetroNavigationView>
	</MetroPage>
</template>

<style lang="less">
.page[data-page-id="root"] {
	
	@media all and (min-width: 641px) {
		.navigation-view {
			& > .pane-content {
				background-color: var(--alt-high);
			}
		}
	}
}
</style>

<script>
export default {
	name: "Root",
	data() {
		return {
			resizeEventListener: null
		}
	},
	mounted() {
		if (!this.resizeEventListener) {
			this.resizeEventListener = window.addEventListener("resize", () => {
				if (window.innerWidth <= 640 && this.$refs["navigation-view"]._paneDisplayMode !== "left-minimal") {
					this.$refs["navigation-view"].setPaneDisplayMode("left-minimal");
				} else if (window.innerWidth > 640 && this.$refs["navigation-view"]._paneDisplayMode !== "top") {
					this.$refs["navigation-view"].setPaneDisplayMode("top");
				}
			});
		}
	}
}
</script>