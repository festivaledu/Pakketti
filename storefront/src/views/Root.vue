<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="root">
			<MetroNavigationView pane-display-mode="top" pane-title="Team FESTIVAL" header="FUKC TIHS SIHT" ref="navigation-view" :settings-visible="false">
				<template slot="header" slot-scope="{ local }">
					<MetroStackPanel orientation="vertical" vertical-alignment="center" style="height: 40px; margin-top: -5px">
						<MetroTextBlock text-style="base" :text="local" />
					</MetroStackPanel>
				</template>
				<template slot="menu-items">
					<MetroNavigationViewItem content="Start" page-id="start" />
					<MetroNavigationViewItem content="Apps" />
					<MetroNavigationViewItem content="Tweaks" />
					
					<template v-if="windowWidth <= 640">
						<MetroNavigationViewItemSeparator />
						
						<MetroNavigationViewItem content="Item" />
						<MetroNavigationViewItem content="Item" />
						<MetroNavigationViewItem content="Item" />
					</template>
				</template>
				
				<template slot="auto-suggest-box">
					<MetroTextBox placeholder-text="Search" />
				</template>
				
				<template slot="pane-footer">
					<MetroNavigationViewItem icon="add-friend" content="Sign in" />
					
					<template v-if="windowWidth > 640">
						<MetroNavigationViewItem icon="more" />
					</template>
				</template>
				
				<StartPage />
			</MetroNavigationView>
		</MetroPage>
	</MetroView>
</template>

<style lang="less">
.page[data-page-id="root"] {
	
	@media all and (max-width: 640px) {
		.navigation-view {
			& > .content-root > .header-content {
				p.text-block.base {
					font-weight: 700;
					font-size: 14px;
					text-transform: uppercase;
				}
			}
		}
	}
	
	@media all and (min-width: 641px) {
		.navigation-view {
			& > .pane-content {
				background-color: var(--alt-high);
			}
			
			& > .content-root > .header-content {
				display: none;
			}
		}
	}
}
</style>

<script>
import StartPage from'@/components/StartPage.vue'

export default {
	name: "Root",
	components: {
		StartPage
	},
	data() {
		return {
			resizeEventListener: null,
			windowWidth: 0
		}
	},
	mounted() {
		this.$refs["navigation-view"].navigate("start");
		
		if (!this.resizeEventListener) {
			this.resizeEventListener = window.addEventListener("resize", () => {
				this.windowWidth = window.innerWidth;
				
				if (this.$refs["navigation-view"]) {
					if (window.innerWidth <= 640 && this.$refs["navigation-view"]._paneDisplayMode !== "left-minimal") {
						this.$refs["navigation-view"].setPaneDisplayMode("left-minimal");
					} else if (window.innerWidth > 640 && this.$refs["navigation-view"]._paneDisplayMode !== "top") {
						this.$refs["navigation-view"].setPaneDisplayMode("top");
					}
				}
			});
		}
		
		this.$nextTick(() => {
			window.dispatchEvent(new Event("resize"));
		});
	}
}
</script>