<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="login">
			<vue-headful :title="`${$t('login.login_title')} - ${$t('app.name')}`" />
			
			<div class="container">
				<div class="row justify-content-around">
					<div class="col-md-4">
						<nav class="mb-5">
							<div class="nav-logo pb-0">
								<div class="nav-link">
									<MetroTextBlock text-style="header">{{ $t('app.name') }}</MetroTextBlock>
								</div>
							</div>
						</nav>
						<hr>
						
						<div class="row mt-3 d-flex">
							<div class="col progress-indicator-container" >
								<MetroProgressBar :indeterminate="true" v-show="isWorking" style="width: 100%" />
							</div>
						</div>
						
						<form novalidate @submit.prevent>
							<MetroStackPanel>
								<MetroTextBox
									:header="$t('login.login_username')"
									:placeholder-text="$t('login.login_username_placeholder')"
									v-model="user.username"
									:disabled="!socket"
									@input="$v.user.username.$touch()"
									@keyup.13="login"
									style="margin: 0 0 8px"
								/>
								<MetroPasswordBox
									:header="$t('login.login_password')"
									:placeholder-text="$t('login.login_password_required')"
									v-model="user.password"
									:disabled="!socket"
									@input="$v.user.username.$touch()"
									@keyup.13="login"
								/>
							</MetroStackPanel>
						</form>
						
						<div class="row mt-3 d-flex">
							<div class="col col-6 text-right">
								<MetroButton class="system-accent-color"
									:content="$t('login.login_button')"
									:disabled="!socket || $v.user.$invalid || isWorking"
									@click="login"
								/>
							</div>
							
							<div class="col align-right" v-show="!isWorking">
								<MetroHyperlinkButton
									:content="$t('login.login_register')"
									@click.prevent="register"
									style="margin: 6px 0"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MetroPage>
	</MetroView>
</template>

<script>
import { SocketService } from "@/scripts/SocketService"
import { AuthAPI } from "@/scripts/ApiUtil"

import { required } from "vuelidate/lib/validators"
import CryptoJS from "crypto-js"

export default {
	name: "login",
	data: () => ({
		user: {
			username: "",
			password: ""
		},
		isWorking: false
	}),
	validations: {
		user: {
			username: { required },
			password: { required }
		}
	},
	mounted() {
		this.reconnected();
		
		SocketService.$on("open", this.reconnected);
	},
	beforeDestroy() {
		SocketService.$off("open", this.reconnected);
	},
	methods: {
		reconnected() {
			if (window.$cookies.get("authToken")) {
				this.$router.replace("/");
			}
		},
		async login() {
			document.activeElement.blur();
			this.isWorking = true;
			
			AuthAPI.login({
				username: this.user.username,
				password: CryptoJS.SHA512(this.user.password).toString(CryptoJS.enc.Hex)
			}).then(authData => {
				this.isWorking = false;
				
				if (authData.code) {
					new metroUI.ContentDialog({
						title: this.$t('login.login_error_title'),
						content: this.$t('login.login_error_message)', { code: authData.code, name: authData.name, message: authData.message}),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
					return;
				}
				
				this.$store.commit("setAccountId", authData.accountId);
				this.$store.commit("setRole", authData.role);
				
				this.$router.replace("/");
			});
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
							content: this.$t('login.login_error_message)', { code: authData.code, name: authData.name, message: authData.message}),
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
						
						this.$router.replace("/");
					}
				});
			}
		},
	},
	computed: {
		socket() {
			return SocketService.socket;
		}
	}
}
</script>

<style lang="less">
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		
		& > .row {
			flex: 1;
		}
		
		input[type="email"],
		input[type="number"],
		input[type="password"],
		input[type="search"],
		input[type="tel"],
		input[type="text"],
		input[type="url"],
		.list {
			max-width: initial;
		}
	}
</style>