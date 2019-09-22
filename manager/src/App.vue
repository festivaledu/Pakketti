<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="root">
			<vue-headful title="Pakketti" />
			<MinimalNavigationView pane-title="Team FESTIVAL" pane-display-mode="left-compact" :settings-visible="false" v-if="routeName !== '/login'">
				<template slot="menu-items">
					<router-link tag="div" to="/">
						<MetroNavigationViewItem :content="$t('root.item_dashboard')" page-id="dashboard">
							<template slot="icon">
								<MetroSymbolIcon icon="home" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
					<router-link tag="div" to="/packages" v-if="isDeveloper || isModerator || isAdministrator">
						<MetroNavigationViewItem :content="$t('root.item_packages')" page-id="packages">
							<template slot="icon">
								<MetroSymbolIcon icon="package" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
					<router-link tag="div" to="/reviews">
						<MetroNavigationViewItem :content="$t('root.item_reviews')" page-id="reviews">
							<template slot="icon">
								<MetroSymbolIcon icon="chat-bubbles" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
					<router-link tag="div" to="/devices">
						<MetroNavigationViewItem :content="$t('root.item_devices')" page-id="devices" :disabled="false">
							<template slot="icon">
								<MetroSymbolIcon icon="cell-phone" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
					<router-link tag="div" to="/requests">
						<MetroNavigationViewItem :content="$t('root.item_requests')" page-id="requests">
							<template slot="icon">
								<MetroSymbolIcon icon="report-hacked" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
					<router-link tag="div" to="/logs" v-if="isModerator || isAdministrator">
						<MetroNavigationViewItem :content="$t('root.item_moderation_log')" page-id="logs">
							<template slot="icon">
								<MetroSymbolIcon icon="clipboard-list" />
							</template>
						</MetroNavigationViewItem>
					</router-link>
				</template>
				
				<template slot="pane-footer">
					<router-link tag="div" to="/profile">
						<MetroNavigationViewItem icon="contact" :content="$t('root.item_profile')" page-id="profile" />
					</router-link>
				</template>
				
				<router-view/>
			</MinimalNavigationView>
			
			<router-view v-else />
		</MetroPage>
	</MetroView>
</template>

<script>
import { UserRole } from "@/scripts/Enumerations"

import MinimalNavigationView from '@/components/MinimalNavigationView'

export default {
	name: "App",
	components: {
		MinimalNavigationView
	},
	computed: {
		routeName() {
			return this.$route.path;
		},
		isDeveloper() {
			return (this.$store.state.role & UserRole.DEVELOPER) == UserRole.DEVELOPER;
		},
		isModerator() {
			return (this.$store.state.role & UserRole.MODERATOR) == UserRole.MODERATOR;
		},
		isAdministrator() {
			return (this.$store.state.role & UserRole.ADMINISTRATOR) == UserRole.ADMINISTRATOR;
		}
	}
}
</script>

<style lang="less">
html {
	background-image: none;
	background-color: var(--alt-high);
	
	::-webkit-scrollbar { 
		display: none; 
	}
}

.notification-center .notification {
	background-color: var(--system-accent-color-dark-1) !important;
}
	
.acrylic:not(.notification) {
	backdrop-filter: none;
	-webkit-backdrop-filter: none;
}

body[data-theme="light"] {
	.acrylic:not(.notification) {
		&.acrylic-80 {
			background-color: darken(#FFF, 5%) !important;
		}
		&.acrylic-70 {
			background-color: darken(#FFF, 10%) !important;
		}
		&.acrylic-60 {
			background-color: darken(#FFF, 15%) !important;
		}
	}
}

body[data-theme="dark"] {
	.acrylic:not(.notification) {
		&.acrylic-80 {
			background-color: lighten(#000, 5%) !important;
		}
		&.acrylic-70 {
			background-color: lighten(#000, 10%) !important;
		}
		&.acrylic-60 {
			background-color: lighten(#000, 15%) !important;
		}
	}
}

.navigation-view.minimal {
	& > .content-root > .content-frame > .page:not(.page-active) {
		display: block;
		
		&.flex-container {
			display: flex;
		}
	}
}

@media all and (min-width: 641px) {
	.navigation-view {
		& > .pane-content {
			position: static !important;
			flex-shrink: 0;
		}
		
		& > .content-root {
			min-width: calc(~"100% - 40px");
			flex: 1 0 auto;
			margin-left: 0 !important;
			
			& > .content-frame > .page > .page-content {
				padding: 24px;
			}
		}
	}
}
</style>
