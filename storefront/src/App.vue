<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="root">
			<MinimalNavigationView pane-display-mode="top" pane-title="Team FESTIVAL" :settings-visible="false" ref="navigation-view">
				<template slot="header" slot-scope="{ local }">
					<MetroStackPanel orientation="vertical" vertical-alignment="center" style="height: 40px; margin-top: -5px">
						<MetroTextBlock text-style="base" :text="local" />
					</MetroStackPanel>
				</template>
				
				<template slot="menu-items">
					<router-link tag="div" to="/">
						<MetroNavigationViewItem :content="$t('root.header.start')" page-id="start" />
					</router-link>
					
					<router-link tag="div" to="/sections?section=Apps">
						<MetroNavigationViewItem :content="$t('section.Apps')" page-id="apps" />
					</router-link>
					<router-link tag="div" to="/sections?section=Tweaks">
						<MetroNavigationViewItem :content="$t('section.Tweaks')" page-id="tweaks" />
					</router-link>
					
					<template v-if="windowWidth <= 640">
						<MetroNavigationViewItemSeparator />
						
						<a href="/dashboard">
							<MetroNavigationViewItem :content="$t('root.dashboard_title')" />
						</a>
						<!-- <MetroNavigationViewItem content="Item" />
						<MetroNavigationViewItem content="Item" /> -->
					</template>
				</template>
				
				<template slot="auto-suggest-box">
					<MetroTextBox :placeholder-text="$t('root.search_placeholder')" @keyup.13="showSearchResults" />
				</template>
				
				<template slot="pane-footer">
					<MetroNavigationViewItem :content="$t('root.button_sign_in')" @click.native="profileButtonClicked">
						<template slot="icon" v-if="!accountData">
							<MetroSymbolIcon symbol="contact" />
						</template>
						<span v-if="!accountData">{{ $t('root.button_sign_in') }}</span>
						
						<template slot="icon" v-if="accountData">
							<MetroPersonPicture :display-name="accountData.username" v-if="!accountData.profileImageMime" />
							<MetroPersonPicture :profile-picture="`http://localhost:3000/media/avatar/${accountData.id}`" v-if="accountData.profileImageMime" />
						</template>
						<span v-if="accountData">{{ accountData.username }}</span>
					</MetroNavigationViewItem>
					
					<template v-if="windowWidth > 640">
						<MetroNavigationViewItem icon="more" @click.native="moreButtonClicked" />
					</template>
				</template>
				
				<router-view />
			</MinimalNavigationView>
		</MetroPage>
	</MetroView>
</template>

<script>
import { AccountAPI, AuthAPI } from '@/scripts/ApiUtil'
import CryptoJS from "crypto-js"

import MinimalNavigationView from '@/components/MinimalNavigationView'

export default {
	name: "App",
	components: {
		MinimalNavigationView
	},
	data: () => ({
		resizeEventListener: null,
		windowWidth: 0,
		accountData: null,
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
	},
	methods: {
		showSearchResults(e) {
			if (e.target.value.length) {
				this.$router.push(`/search?query=${e.target.value}`);
				e.target.blur();
			}
		},
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
						text: this.$t('root.button_register'),
						action: this.register
					}]
				});

				flyout.showAt(e.target);
			} else {
				let flyout = new metroUI.MenuFlyout({
					items: [{
						icon: "block-contact",
						text: this.$t('root.button_sign_out'),
						action: this.logout
					}]
				});
				
				flyout.showAt(e.target);
			}
		},
		moreButtonClicked(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "tiles",
					text: this.$t('root.dashboard_title'),
					action: () => {
						window.location.href = "/dashboard";
					}
				}]
			});
			
			flyout.showAt(e.target);
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
		async register() {
			var registerDialog = new metroUI.ContentDialog({
				title: this.$t('login.register_title'),
				content: (
					<MetroStackPanel>
						<MetroTextBox
							header={this.$t('login.register_username')}
							placeholder-text={this.$t('login.register_username_placeholder')}
							required={true}
							name="username"
							style="margin-bottom: 8px"
						/>
						<MetroTextBox
							header={this.$t('login.register_email')}
							placeholder-text={this.$t('login.register_email_placeholder')}
							required={true}
							name="email"
							style="margin-bottom: 8px"
						/>
						<MetroPasswordBox
							header={this.$t('login.register_password')}
							placeholder-text={this.$t('login.register_password_required')}
							required={true}
							min-length={8}
							name="password"
							style="margin-bottom: 8px"
						/>
						<MetroPasswordBox
							header={this.$t('login.register_password_confirm')}
							placeholder-text={this.$t('login.register_password_required')}
							required={true}
							min-length={8}
							name="password-confirm"
						/>
					</MetroStackPanel>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			if (await registerDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let texts = registerDialog.text;
				if (texts["password"].localeCompare(texts["password-confirm"]) != 0) {
					new metroUI.ContentDialog({
						title: this.$t('login.register_password_match_title'),
						content: this.$t('login.register_password_match_message'),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
					return;
				}
				
				this.isWorking = true;
				AuthAPI.register({
					username: texts["username"],
					email: texts["email"],
					password: CryptoJS.SHA512(texts["password"]).toString(CryptoJS.enc.Hex)
				}).then(async authData => {
					this.isWorking = false;

					if (!authData.auth) {
						new metroUI.ContentDialog({
							title: this.$t('login.login_error_title'),
						content: `<p>${this.$t('login.login_error_message')}<br><span style="font-style: italic">${typeof authData === 'string' ? authData : `${authData.code}: ${authData.message}`}</span></p>`,
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
					} else {
						await new metroUI.ContentDialog({
							title: this.$t('login.register_success_title'),
							content: this.$t('login.register_success_message'),
							commands: [{ text: "Ok", primary: true }]
						}).showAsync();
						
						this.$store.commit("setAccountId", authData.accountId);
						this.$store.commit("setRole", authData.role);
						
						window.location.reload(true);
					}
				});
			}
		},
		logout() {
			this.$store.commit("setAccountId", null);
			window.location.reload("true");
		},
	}
}
</script>

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

.navigation-view.minimal {
	& > .content-root > .content-frame > .page:not(.page-active) {
		display: block;
		
		&.flex-container {
			display: flex;
		}
	}
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
			min-height: calc(~"100% - 40px") !important;
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

h1, h2, h3, h4, h5, h6 {
	& * {
		font-size: inherit;
		font-weight: inherit
	}
}

h1 { font-size: 2em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.17em; }
h4 { font-size: 1em; }
h5 { font-size: .83em; }
h6 { font-size: .67em; }

.ql-align-left { text-align: left }
.ql-align-center { text-align: center; }
.ql-align-right { text-align: right; }
.ql-align-justify { text-align: justify; }
</style>
