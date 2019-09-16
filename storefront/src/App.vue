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
					<MetroNavigationViewItem :content="$t('root.header.start')" page-id="start" />
					<MetroNavigationViewItem :content="$t('root.header.apps')" />
					<MetroNavigationViewItem :content="$t('root.header.tweaks')" />
					
					<template v-if="windowWidth <= 640">
						<MetroNavigationViewItemSeparator />
						
						<MetroNavigationViewItem :content="$t('root.dashboard_title')" />
						<!-- <MetroNavigationViewItem content="Item" />
						<MetroNavigationViewItem content="Item" /> -->
					</template>
				</template>
				
				<template slot="auto-suggest-box">
					<MetroTextBox :placeholder-text="$t('root.search_placeholder')" />
				</template>
				
				<template slot="pane-footer">
					<MetroNavigationViewItem :content="$t('root.button_sign_in')" @click.native="profileButtonClicked">
						<template slot="icon" v-if="!accountData">
							<MetroSymbolIcon symbol="contact" />
						</template>
						<span v-if="!accountData">{{ $t('root.button_sign_in') }}</span>
						
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
				
				<ErrorPage />
				<StartPage />
				<PackagePage />
				
				<DeveloperPage />
			</MetroNavigationView>
		</MetroPage>
	</MetroView>
</template>

<style lang="less">
body[data-theme="light"] {
	--store-background: #F7F3F7;
	--package-header-background: #FFFFFF;
}
body[data-theme="dark"] {
	--store-background: #292C29;
	--package-header-background: #292C29;
}


a {
	color: var(--system-accent-color);
	
	&:hover:not(:active) {
		color: var(--base-medium);
	}
	
	&:active {
		color: var(--base-medium-low);
	}
	
	&[disabled] {
		pointer-events: none;
		color: var(--base-medium-low);
	}
}

.page-content {
	background-color: var(--store-background);
}

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
				height: 100vh !important;
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
		& > .pane-content {
			height: 100vh;
		}
		
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
</style>

<script>
import { AccountAPI, AuthAPI } from '@/scripts/ApiUtil'

import CryptoJS from "crypto-js"

import DeveloperPage from '@/pages/DeveloperPage'
import ErrorPage from '@/pages/ErrorPage'
import StartPage from '@/pages/StartPage'
import PackagePage from '@/pages/PackagePage'

export default {
	name: "App",
	components: {
		DeveloperPage,
		ErrorPage,
		StartPage,
		PackagePage
	},
	data: () => ({
		resizeEventListener: null,
		windowWidth: 0,
		accountData: null,
		allowRouteMatching: true
	}),
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
		
		this.$refs["navigation-view"].old_goBack = this.$refs["navigation-view"].goBack;
		this.$refs["navigation-view"].goBack = () => {
			window.history.back();
		}
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
						text: this.$t('root.button_sign_in'),
						action: this.login
					}, {
						icon: "add-friend",
						text: this.$t('root.button_register')
					}]
				});

				flyout.showAt(e.target);
			} else {
				if (window.innerWidth <= 640) {
						let flyout = new metroUI.MenuFlyout({
						items: [{
							icon: "block-contact",
							text: this.$t('root.button_sign_out'),
							action: this.logout
						}]
					});
					
					flyout.showAt(e.target);
				} else {
					let flyout = new metroUI.MenuFlyout({
						items: [{
							icon: "tiles",
							text: this.$t('root.dashboard_title'),
							action: () => {
								
							}
						}, {
							icon: "block-contact",
							text: this.$t('root.button_sign_out'),
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
		
		_matchRoute(route, direction) {
			this.$refs["navigation-view"].history = JSON.parse(sessionStorage.getItem("navigationViewHistory")) || [];
			
			switch (direction) {
				case 0:
				case 1:
					var match = route.path.match(/((?:[^\/]+)).+$/i);
					if (match) {
						switch (match[1]) {
							case "package":
								match = this.$route.path.match(/^\/package\/((?:[^\/]+?)?)(?:\/(?=$))?$/i);
								if (match) this.$refs["navigation-view"].navigate("package", { packageId: match[1] });
								break;
							// case "section":
							// 	break;
							case "developer":
								match = this.$route.path.match(/^\/developer\/((?:[^\/]+?)?)(?:\/(?=$))?$/i);
								if (match) this.$refs["navigation-view"].navigate("developer", { username: match[1] });
								break;
							default: 
								this.$refs["navigation-view"].navigate("error");
								break;
						}
					} else {
						this.$refs["navigation-view"].navigate("start");
					}
					
					break;
				case -1:
					this.$refs["navigation-view"].old_goBack();
					break;
				default: break;
			}
			
			sessionStorage.setItem("navigationViewHistory", JSON.stringify(this.$refs["navigation-view"].history));
		}
	},
	watch: {
		$route(to, from) {
			const lastPosition = Number(sessionStorage.getItem("lastPosition"));
			let position = history.state;
			
			if (!position) position = { key: 0 };
			
			sessionStorage.setItem("lastPosition", String(position.key));
			const direction = Math.sign(position.key - lastPosition);
			
			// console.log(`route watchdog, change direction: ${direction}`)
			this._matchRoute(to, direction);
		}
	}
}
</script>