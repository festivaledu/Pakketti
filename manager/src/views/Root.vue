<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="root">
			<vue-headful title="Pakketti" />
			
			<MetroNavigationView :pane-title="$t('root.pane_title')" pane-display-mode="left-compact" :settings-visible="false" ref="navigation-view">
				<template slot="menu-items">
					<MetroNavigationViewItem :content="$t('root.item_dashboard')" page-id="dashboard">
						<template slot="icon">
							<MetroSymbolIcon icon="home" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_packages')" page-id="packages">
						<template slot="icon">
							<MetroSymbolIcon icon="package" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_reviews')" page-id="reviews">
						<template slot="icon">
							<MetroSymbolIcon icon="chat-bubbles" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_devices')" page-id="devices" :disabled="true">
						<template slot="icon">
							<MetroSymbolIcon icon="cell-phone" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_users')" page-id="users" :disabled="true">
						<template slot="icon">
							<MetroSymbolIcon icon="people" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_requests')" page-id="requests" :disabled="true">
						<template slot="icon">
							<MetroSymbolIcon icon="report-hacked" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_moderation_log')" page-id="logs" :disabled="true">
						<template slot="icon">
							<MetroSymbolIcon icon="clipboard-list" />
						</template>
					</MetroNavigationViewItem>
					<MetroNavigationViewItem :content="$t('root.item_statistics')" page-id="statistics" :disabled="true">
						<template slot="icon">
							<MetroSymbolIcon icon="area-chart" />
						</template>
					</MetroNavigationViewItem>
				</template>
				
				<template slot="pane-footer">
					<MetroNavigationViewItem icon="contact" :content="$t('root.item_profile')" page-id="profile" :disabled="true" />
					<MetroNavigationViewItem icon="setting" :content="$t('root.item_settings')" page-id="settings" :disabled="true" />
					<MetroButton class="system-accent-color" @click="signOut">
						<MetroSymbolIcon icon="ethernet-error" />
					</MetroButton>
				</template>
				
				<DashboardPage />
				<PackagesPage />
				<ReviewThreadsPage />
				
				<PackageEditorPage />
			</MetroNavigationView>
		</MetroPage>
	</MetroView>
</template>

<style lang="less">
.page[data-page-id="root"] {
	@media all and (min-width: 641px) {
		.navigation-view {
			& > .pane-content {
				position: static;
				flex-shrink: 0;
			}
			
			& > .content-root {
				width: calc(~"100% - 40px");
				flex: 1 0 auto;
				margin-left: 0;
				
				& > .content-frame > .page > .page-content {
					padding: 24px;
				}
			}
		}
	}
	
	.row.no-margin {
		margin-left: 0;
		margin-right: 0;
	}
	
	.text-block {
		&.header {
			margin-bottom: 16px;
		}
		
		&.sub-header {
			margin-bottom: 12px;
		}
		
		&.title {
			font-size: 24px;
			font-weight: 300;
			margin-bottom: 5px;
		}
		
		&.sub-title {
			margin: 15px 0;
		}
	}
}
</style>


<script>
import DashboardPage from "@/components/DashboardPage"
import PackagesPage from "@/components/PackagesPage"
import ReviewThreadsPage from "@/components/ReviewThreadsPage"

import PackageEditorPage from "@/components/PackageEditorPage"

export default {
	name: "root",
	components: {
		DashboardPage,
		PackagesPage,
		ReviewThreadsPage,
		PackageEditorPage
	},
	mounted() {
		this.$refs["navigation-view"].navigate("dashboard");
	},
	methods: {
		signOut() {
			window.$cookies.remove("authToken");
			this.$router.replace("/login");
		}
	}
}
</script>