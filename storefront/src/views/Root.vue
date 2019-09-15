<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="root">
			<MetroNavigationView pane-display-mode="top" pane-title="Team FESTIVAL" ref="navigation-view" :settings-visible="false">
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
						
						<MetroNavigationViewItem content="Dashboard" />
						<!-- <MetroNavigationViewItem content="Item" />
						<MetroNavigationViewItem content="Item" /> -->
					</template>
				</template>
				
				<template slot="auto-suggest-box">
					<MetroTextBox placeholder-text="Search" />
				</template>
				
				<template slot="pane-footer">
					<MetroNavigationViewItem content="Sign in" @click.native="profileButtonClicked">
						<template slot="icon" v-if="!accountData">
							<MetroSymbolIcon symbol="contact" />
						</template>
						<span v-if="!accountData">Sign in</span>
						
						<template slot="icon" v-if="accountData">
							<MetroPersonPicture v-if="!accountData.profileImageMime" />
							<MetroPersonPicture :profile-picture="`http://localhost:3000/media/avatar/${accountData.id}`" v-if="accountData.profileImageMime" />
						</template>
						<span v-if="accountData">{{ accountData.username }}</span>
					</MetroNavigationViewItem>
					
					<template v-if="windowWidth > 640">
						<MetroNavigationViewItem icon="more" />
					</template>
				</template>
				
				<StartPage />
				
				<PackagePage />
			</MetroNavigationView>
		</MetroPage>
	</MetroView>
</template>

<style lang="less">
.page[data-page-id="root"] {
	@media all and (min-width: 641px) and (max-width: 1007px) {
		.navigation-view .page > .page-content {
			padding-left: 24px !important;
			padding-right: 24px !important;
			padding-bottom: 24px !important;
		}
	}
	@media all and (min-width: 1008px) {
		.navigation-view {
			& > .pane-content {
				position: absolute;
				
				& + .content-root {
					height: 100vh;
				}
			}
			
			.page > .page-content {
				padding: 52px 48px 48px !important;
			}
		}
	}
	
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
			// & > .pane-content {
			// 	background-color: var(--alt-high);
			// }
			
			& > .content-root > .header-content {
				display: none;
			}
		}
	}
	
	.navigation-view-item-icon {
		.person-picture {
			width: 20px;
			height: 20px;
			margin: 10px;
		}
	}
}
</style>

<script>
import { AccountAPI, AuthAPI } from '@/scripts/ApiUtil'

import StartPage from'@/pages/StartPage.vue'
import PackagePage from'@/pages/PackagePage.vue'
import CryptoJS from "crypto-js"

export default {
	name: "Root",
	components: {
		StartPage,
		PackagePage
	},
	data() {
		return {
			resizeEventListener: null,
			windowWidth: 0,
			accountData: null,
			allowRouteMatching: true
		}
	},
	async mounted() {
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
		
		if (this.$store.state.accountId) {
			this.accountData = await AccountAPI.getMe();
		}
		
		// Navigation Stuff
		const old_goBack = this.$refs["navigation-view"].goBack;
		this.$refs["navigation-view"].goBack = () => {
			old_goBack();
			window.history.back();
		}
		
		this.matchRoute(this.$route);
		const self = this;
		window.addEventListener("popstate", () => {
			old_goBack();
		});
	},
	methods: {
		profileButtonClicked(e) {
			if (!this.accountData) {
				if (window.innerWidth <= 640) {
					this.login();
					return;
				}
				
				let flyout = new metroUI.MenuFlyout({
					items: [{
						icon: "contact",
						text: "Sign in",
						action: this.login
					}, {
						icon: "add-friend",
						text: "Register"
					}]
				});

				flyout.showAt(e.target);
			} else {
				if (window.innerWidth <= 640) {
						let flyout = new metroUI.MenuFlyout({
						items: [{
							icon: "block-contact",
							text: "Sign out",
							action: this.logout
						}]
					});
					
					flyout.showAt(e.target);
				} else {
					let flyout = new metroUI.MenuFlyout({
						items: [{
							icon: "tiles",
							text: "Dashboard",
							action: () => {
								
							}
						}, {
							icon: "block-contact",
							text: "Sign out",
							action: this.logout
						}]
					});
					
					flyout.showAt(e.target);
				}
			}
		},
		async login() {
			let loginDialog = new metroUI.ContentDialog({
				title: this.$t('login.login_title'),
				content: (
					<MetroStackPanel>
						<MetroTextBox
							header={this.$t('login.login_username')}
							placeholder-text={this.$t('login.login_username_placeholder')}
							required={true}
							name="username"
							style="margin-bottom: 8px"
						/>
						<MetroPasswordBox
							header={this.$t('login.login_password')}
							placeholder-text={this.$t('login.login_password_required')}
							required={true}
							name="password"
						/>
					</MetroStackPanel>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});

			if (await loginDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let texts = loginDialog.text;
				
				AuthAPI.login({
					username: texts["username"],
					password: CryptoJS.SHA512(texts["password"]).toString(CryptoJS.enc.Hex)
				}).then(authData => {
					if (authData.error) {
						new metroUI.ContentDialog({
							title: this.$t('login.login_error_title'),
							content: `<p>${this.$t('login.login_error_message')}<br><span style="font-style: italic">${typeof authData === 'string' ? authData : `${authData.error.code}: ${authData.error.message}`}</span></p>`,
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
					}
					
					this.$store.commit("setAccountId", authData.accountId);
					window.location.reload("true");
				});
			}
		},
		logout() {
			this.$store.commit("setAccountId", null);
			window.location.reload("true");
		},
		
		matchRoute(route) {
			var match = route.path.match(/((?:[^\/]+)).+$/i);
			if (match) {
				if (this.$refs["navigation-view"].history.indexOf("start") < 0) this.$refs["navigation-view"].history.push("start");
				switch (match[1]) {
					case "package":
						match = this.$route.path.match(/^\/package\/((?:[^\/]+?))(?:\/(?=$))?$/i);
						if (match) this.$refs["navigation-view"].navigate("package", { packageId: match[1] });
						break;
					case "section":
						break;
					case "developer":
						break;
					default: break;
				}
			} else {
				this.$refs["navigation-view"].navigate("start");
			}
		}
	},
	watch: {
		$route(to, from) {
			setTimeout(() => {
				if (!this.$refs["navigation-view"].$el.querySelector(".page[class*='page-fade'], .page[class*='page-slide']")) this.matchRoute(to);
			});
		}
	}
}
</script>