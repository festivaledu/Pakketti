<template>
	<MetroPage page-id="profile">
		<vue-headful :title="`${$t('root.item_profile')} - ${$t('app.name')}`" />
		
		<template v-if="accountData">
			<MetroTextBlock text-style="sub-title">{{ $t('profile.avatar') }}</MetroTextBlock>
			<MetroPersonPicture class="my-5" :display-name="accountData.username" v-if="!accountData.profileImageMime" />
			<MetroPersonPicture class="my-5" :profile-picture="`/media/avatar/${accountData.id}`" v-if="accountData.profileImageMime" />
			
			<input type="file" ref="file-selector" accept="image/png,image/jpeg" @change="fileChanged" />
			<MetroStackPanel class="mb-4" orientation="vertical" horizontal-alignment="left">
				<MetroButton class="mb-2" @click="openFileSelector">{{ $t('profile.choose_avatar') }}</MetroButton>
				<MetroButton @click="deleteAvatar" :disabled="!accountData.profileImageMime">{{ $t('profile.delete_avatar') }}</MetroButton>
			</MetroStackPanel>
		
			<MetroTextBlock text-style="sub-title">{{ $t('profile.account_info.title') }}</MetroTextBlock>
			<MetroStackPanel class="mt-4" orientation="vertical" horizontal-alignment="left">
				<MetroTextBlock>{{ $t('profile.account_info.username', { name: accountData.username }) }}</MetroTextBlock>
				<MetroTextBlock>{{ $t('profile.account_info.email', { email: accountData.email }) }}</MetroTextBlock>
			</MetroStackPanel>
			
			<MetroStackPanel class="mt-4" orientation="vertical" horizontal-alignment="left">
				<MetroButton @click="editAccountButtonPressed" :disabled="isRoot && false">{{ $t('profile.edit_account.title') }}</MetroButton>
				<MetroButton class="mt-2" @click="signOut">{{ $t('profile.sign_out_title') }}</MetroButton>
			</MetroStackPanel>
		</template>
	</MetroPage>
</template>

<script>
import { AccountAPI, AuthAPI } from '@/scripts/ApiUtil'
import { UserRole } from '@/scripts/Enumerations'

import CryptoJS from 'crypto-js'

export default {
	name: "Profile",
	data: () => ({
		accountData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _accountData = await AccountAPI.getMe();
		
		next(vm => {
			vm.accountData = _accountData;
			
			vm.$parent.setHeader(vm.$t('root.item_profile'));
			vm.$parent.setSelectedMenuItem("profile");
		});
	},
	methods: {
		async refresh() {
			this.accountData = await AccountAPI.getMe();
		},
		
		openFileSelector() {
			this.$refs["file-selector"].click();
		},
		fileChanged(e) {
			this._handleFile(e.target.files[0]);
		},
		
		async _handleFile(file) {
			let result = await AccountAPI.updateAvatar(file);
			
			if (result.error) {
				new metroUI.ContentDialog({
					title: this.$t('app.operational_error_title'),
					content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
			} else {
				new metroUI.Notification({
					title: this.$t('profile.edit_account.profile_changed_success_title'),
					content: this.$t('profile.edit_account.profile_changed_success_message'),
					icon: "settings",
				}).show();
				
				this.refresh();
			}
		},
		
		async deleteAvatar() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('profile.delete_avatar_confirm_title'),
				content: this.$t('profile.delete_avatar_confirm_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await AccountAPI.deleteAvatar();
			
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					new metroUI.Notification({
						title: this.$t('profile.edit_account.profile_changed_success_title'),
						content: this.$t('profile.edit_account.profile_changed_success_message'),
						icon: "settings",
					}).show();
					
					this.refresh();
				}
			}
		},
		
		editAccountButtonPressed(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					text: this.$t('profile.edit_account.username.title'),
					action: this.changeUsername
				}, {
					text: this.$t('profile.edit_account.email.title'),
					action: this.changeEmail
				}, {
					text: this.$t('profile.edit_account.password.title'),
					action: this.changePassword
				}]
			});
			
			flyout.showAt(e.target);
		},
		async changeUsername() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('profile.edit_account.username.title'),
				content: () => (
					<MetroTextBox name="username" placeholder-text={this.$t('profile.edit_account.username.placeholder')} required={true} />
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await AccountAPI.updateMe(dialog.text);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					new metroUI.Notification({
						title: this.$t('profile.edit_account.profile_changed_success_title'),
						content: this.$t('profile.edit_account.profile_changed_success_message'),
						icon: "settings",
					}).show();
					
					this.refresh();
				}
			}
		},
		async changeEmail() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('profile.edit_account.email.title'),
				content: () => (
					<MetroTextBox name="email" placeholder-text={this.$t('profile.edit_account.email.placeholder')} required={true} />
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await AccountAPI.updateMe(dialog.text);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					new metroUI.Notification({
						title: this.$t('profile.edit_account.profile_changed_success_title'),
						content: this.$t('profile.edit_account.profile_changed_success_message'),
						icon: "settings",
					}).show();
					
					this.refresh();
				}
			}
		},
		async changePassword() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('profile.edit_account.password.title'),
				content: () => (
					<div>
						<MetroPasswordBox
							class="mb-2"
							name="password-current"
							placeholder-text={this.$t('profile.edit_account.password.current_placeholder')}
							required={true}
						/>
						<MetroPasswordBox
							class="mb-2"
							name="password-new"
							placeholder-text={this.$t('profile.edit_account.password.new_placeholder')}
							required={true}
							min-length={8}
						/>
						<MetroPasswordBox
							class="mb-2"
							name="password-confirm"
							placeholder-text={this.$t('profile.edit_account.password.confirm_placeholder')}
							required={true}
							min-length={8}
						/>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let texts = dialog.text;
				if (texts["password-new"].localeCompare(texts["password-confirm"]) != 0) {
					new metroUI.ContentDialog({
						title: this.$t('profile.edit_account.error_title'),
						content: this.$t('profile.edit_account.password.error_match'),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
					return;
				}
				
				let verifyResult = await AuthAPI.login({
					username: this.accountData.username,
					password: CryptoJS.SHA512(texts["password-current"]).toString(CryptoJS.enc.Hex)
				});
				if (verifyResult.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: verifyResult.error.code, name: verifyResult.error.name, message: verifyResult.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
					return;
				}
				
				let result = await AccountAPI.updateMe({
					"password": CryptoJS.SHA512(texts["password-new"]).toString(CryptoJS.enc.Hex)
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					new metroUI.Notification({
						title: this.$t('profile.edit_account.profile_changed_success_title'),
						content: this.$t('profile.edit_account.profile_changed_success_message'),
						icon: "settings",
					}).show();
					
					this.refresh();
				}
			}
		},
		
		async signOut() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('profile.sign_out_title'),
				content: this.$t('profile.sign_out_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				window.$cookies.remove("authToken");
				this.$router.replace("/login");
			}
		}
	},
	computed: {
		isRoot() {
			return (this.$store.state.role & UserRole.ROOT) == UserRole.ROOT;
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="profile"] {
	.person-picture {
		width: 128px;
		height: 128px;
		
		.initials {
			font-size: 56px;
		}
	}
	
	input[type="file"] {
		position: absolute;
		top: -9999px;
		left: -9999px;
	}
}
</style>