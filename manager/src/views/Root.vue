<template>
	<div class="views transparent" data-page="root">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="root">
					<vue-headful title="Pakketti" />
								
					<!-- Main navigation view, always visible -->
					<metro-navigation-view menuTitle="Team FESTIVAL" :history="false" :showBackButton="true" :startRetracted="true" defaultPage="dashboard" acrylic="acrylic-80" class="fixed-width" ref="mainNavView">

						<!-- Regular navigation items -->
						<template slot="navigation-items">
							<metro-navigation-view-menu-item page="dashboard" icon="home" title="Dashboard" />
							<metro-navigation-view-menu-item page="packages" icon="package" title="Packages" />
							<metro-navigation-view-menu-item page="reviews" icon="chat-bubbles" title="Reviews" :disabled="true" />
							<metro-navigation-view-menu-item page="devices" icon="cell-phone" title="Devices" :disabled="true" />
							<metro-navigation-view-menu-item page="users" icon="people" title="Users" :disabled="true" />
							<metro-navigation-view-menu-item page="log" icon="clipboard-list" title="Moderation Log" :disabled="true" />
							<metro-navigation-view-menu-item page="statistics" icon="area-chart" title="Statistics" :disabled="true" />
						</template>

						<!-- Bottom navigation items -->
						<template slot="bottom-items">
							<metro-navigation-view-menu-item page="profile" icon="contact" title="Profil" :disabled="true" />
							<metro-navigation-view-menu-item page="settings" icon="settings" title="Einstellungen" :disabled="true" />
							<button class="colored" @click="signOut">Test</button>
						</template>

						<!-- Pages stored in this navigation view -->
						<template slot="pages">
							<DashboardPage />
							<PackagesPage />
							
							<PackageEditorPage />
						</template>
					</metro-navigation-view>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less">
	@media all and (max-width: 640px) {
		.row {
			margin-left: 0;
			margin-right: 0;
		}
	}
	@media all and (min-width: 1008px) {
		.navigation-view.fixed-width > .frame {
			width: calc(~"100% - 48px");
		}
		
	}
</style>

<script>
import DashboardPage from '@/components/DashboardPage'
import PackagesPage from '@/components/PackagesPage'
import PackageEditorPage from '@/components/PackageEditorPage'

export default {
	name: "root",
	components: {
		DashboardPage,
		PackagesPage,
		PackageEditorPage
	},
	methods: {
		signOut() {
			window.$cookies.remove("authToken");
			this.$router.replace("/login");
		}
	}
}
</script>