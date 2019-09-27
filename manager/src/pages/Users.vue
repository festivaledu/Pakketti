<template>
	<MetroPage page-id="users">
		<vue-headful :title="`${$t('root.item_users')} - ${$t('app.name')}`" />
		<template v-if="this.userData && this.userData.length">
			<MetroPivot :title="$t('root.item_users')">
				<MetroPivotItem :header="$t('users.users_title')">
					<div class="grid-view" v-if="filteredUsers.length">
						<div class="grid-view-item" v-for="(userObj, index) in filteredUsers" :key="index">
							<div class="user-container">
								<div class="user-description-container">
									<MetroPersonPicture class="mb-2" :display-name="userObj.username" v-if="!userObj.profileImageMime" />
									<MetroPersonPicture class="mb-2" :profile-picture="`/media/avatar/${userObj.id}`" v-if="userObj.profileImageMime" />
									
									<MetroStackPanel orientation="vertical" vertical-alignment="top">
										<MetroTextBlock text-style="base">{{ userObj.username }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ userObj.email }}</MetroTextBlock>
									</MetroStackPanel>
								</div>
								<MetroStackPanel orientation="horizontal" class="user-toolbar">
									<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="userDeleteButtonClicked(userObj)" />
									<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="userEditButtonClicked(userObj)" />
								</MetroStackPanel>
							</div>
						</div>
					</div>
					
					<MetroTextBlock v-else>{{ $t('users.no_users') }}</MetroTextBlock>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('users.developers_title')">
					<div class="grid-view" v-if="filteredDevelopers.length">
						<div class="grid-view-item" v-for="(userObj, index) in filteredDevelopers" :key="index">
							<div class="user-container">
								<div class="user-description-container">
									<MetroPersonPicture class="mb-2" :display-name="userObj.username" v-if="!userObj.profileImageMime" />
									<MetroPersonPicture class="mb-2" :profile-picture="`/media/avatar/${userObj.id}`" v-if="userObj.profileImageMime" />
									
									<MetroStackPanel orientation="vertical" vertical-alignment="top">
										<MetroTextBlock text-style="base">{{ userObj.username }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ userObj.email }}</MetroTextBlock>
									</MetroStackPanel>
								</div>
								<MetroStackPanel orientation="horizontal" class="user-toolbar">
									<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="userDeleteButtonClicked(userObj)" />
									<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="userEditButtonClicked(userObj)" />
								</MetroStackPanel>
							</div>
						</div>
					</div>
					
					<MetroTextBlock v-else>{{ $t('users.no_users') }}</MetroTextBlock>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('users.moderators_title')">
					<div class="grid-view" v-if="filteredModerators.length">
						<div class="grid-view-item" v-for="(userObj, index) in filteredModerators" :key="index">
							<div class="user-container">
								<div class="user-description-container">
									<MetroPersonPicture class="mb-2" :display-name="userObj.username" v-if="!userObj.profileImageMime" />
									<MetroPersonPicture class="mb-2" :profile-picture="`/media/avatar/${userObj.id}`" v-if="userObj.profileImageMime" />
									
									<MetroStackPanel orientation="vertical" vertical-alignment="top">
										<MetroTextBlock text-style="base">{{ userObj.username }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ userObj.email }}</MetroTextBlock>
									</MetroStackPanel>
								</div>
								<MetroStackPanel orientation="horizontal" class="user-toolbar">
									<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="userDeleteButtonClicked(userObj)" />
									<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="userEditButtonClicked(userObj)" />
								</MetroStackPanel>
							</div>
						</div>
					</div>
					
					<MetroTextBlock v-else>{{ $t('users.no_users') }}</MetroTextBlock>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('users.administrators_title')">
					<div class="grid-view" v-if="filteredAdministrators.length">
						<div class="grid-view-item" v-for="(userObj, index) in filteredAdministrators" :key="index">
							<div class="user-container">
								<div class="user-description-container">
									<MetroPersonPicture class="mb-2" :display-name="userObj.username" v-if="!userObj.profileImageMime" />
									<MetroPersonPicture class="mb-2" :profile-picture="`/media/avatar/${userObj.id}`" v-if="userObj.profileImageMime" />
									
									<MetroStackPanel orientation="vertical" vertical-alignment="top">
										<MetroTextBlock text-style="base">{{ userObj.username }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ userObj.email }}</MetroTextBlock>
									</MetroStackPanel>
								</div>
								<MetroStackPanel orientation="horizontal" class="user-toolbar">
									<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="userDeleteButtonClicked(userObj)" />
									<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="userEditButtonClicked(userObj)" />
								</MetroStackPanel>
							</div>
						</div>
					</div>
					
					<MetroTextBlock v-else>{{ $t('users.no_users') }}</MetroTextBlock>
				</MetroPivotItem>
			</MetroPivot>
		</template>
	</MetroPage>
</template>

<script>
import { AccountAPI } from '@/scripts/ApiUtil'
import { UserRole } from "@/scripts/Enumerations"

export default {
	name: "Users",
	data: () => ({
		userData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _userData = await AccountAPI.getAllUsers();
		
		next(vm => {
			vm.userData = _userData;
			
			if (to.params.userId && _userData.find(userObj => userObj.id == to.params.userId)) {
				vm.userEditButtonClicked(_userData.find(userObj => userObj.id == to.params.userId));
			}
			
			vm.$parent.setHeader(null);
			vm.$parent.setSelectedMenuItem("users");
		})
	},
	methods: {
		async userEditButtonClicked(accountObj) {
			let _accountObj = {...accountObj};
						
			let dialog = new metroUI.ContentDialog({
				title: this.$t('requests.account_roles.title'),
				content: () => (
					<div>
						<MetroCheckbox
							content={this.$t('requests.account_roles.developer')}
							oninput={() => { _accountObj.role ^= UserRole.DEVELOPER }}
							value={Boolean(_accountObj.role & UserRole.DEVELOPER)}
						/>
						<MetroCheckbox
							content={this.$t('requests.account_roles.moderator')}
							oninput={() => { _accountObj.role ^= UserRole.MODERATOR }}
							value={Boolean(_accountObj.role & UserRole.MODERATOR)}
						/>
						<MetroCheckbox
							content={this.$t('requests.account_roles.administrator')}
							oninput={() => { _accountObj.role ^= UserRole.ADMINISTRATOR }}
							value={Boolean(_accountObj.role & UserRole.ADMINISTRATOR)}
						/>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await AccountAPI.updateUser({
					"account.id": accountObj.id
				}, {
					role: _accountObj.role
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					this.refresh();
				}
			}
			
			if (this.$route.params.userId) {
				this.$router.replace(`/${this.$route.path.split("/")[1]}`);
			}
		},
		async userDeleteButtonClicked(accountObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('requests.delete_account_confirm_title', { username: accountObj.username }),
				content: this.$t('requests.delete_account_confirm_body', { username: accountObj.username }),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await AccountAPI.deleteUser({
					"account.id": accountObj.id
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					this.refresh();
				}
			}
		},
		async refresh() {
			this.userData = await AccountAPI.getAllUsers();
		}
	},
	computed: {
		filteredUsers() {
			return [...this.userData].filter(userObj => userObj.id != this.accountId);
		},
		filteredDevelopers() {
			return this.filteredUsers.filter(userObj => (userObj.role & UserRole.DEVELOPER) == UserRole.DEVELOPER);
		},
		filteredModerators() {
			return this.filteredUsers.filter(userObj => (userObj.role & UserRole.MODERATOR) == UserRole.MODERATOR);
		},
		filteredAdministrators() {
			return this.filteredUsers.filter(userObj => (userObj.role & UserRole.ADMINISTRATOR) == UserRole.ADMINISTRATOR);
		},
		
		accountId() {
			return this.$store.state.accountId;
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="users"] {
	.grid-view {
		.grid-view-item {
			align-self: initial;
			background-color: var(--list-low);
			
			&::before {
				content: '';
				display: block;
				padding-top: 100%;
			}
			
			@media all and (max-width: 640px) {
				width: 100%;
				margin-right: 0;
				
				&:before {
					content: '';
					display: block;
					padding-top: 50%;
				}
			}
			
			@media all and (min-width: 641px) and (max-width:1365px) {
				width: calc(~"(100% - (3 * 4px)) / 4");
				
				&:nth-child(4n) {
					margin-right: 0;
				}
			}
			
			// @media all and (min-width: 1008px) {
			// 	width: calc(~"(100% - (5 * 4px)) / 6");
				
			// 	&:nth-child(6n) {
			// 		margin-right: 0;
			// 	}
			// }
			
			@media all and (min-width: 1366px) {
				width: calc(~"(100% - (5 * 4px)) / 6");
				
				&:nth-child(6n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1920px) {
				width: calc(~"(100% - (7 * 4px)) / 8");
				
				&:nth-child(8n) {
					margin-right: 0;
				}
			}
			
			.user-container {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.user-description-container {
					display: flex;
					flex-direction: column;
					flex: 1 0 auto;
					flex-basis: 0;
					overflow: hidden;
					padding: 8px;
					text-align: center;
					
					.person-picture {
						flex: 0 0 auto;
						width: 64px;
						height: 64px;
						
						p.initials {
							font-size: 28px;
						}
					}
					
					@media all and (max-width: 640px) {
						flex-direction: row-reverse;
						justify-content: space-between;
					}
				}
				
				.user-toolbar {
					padding: 0 2px 2px;
				}
			}
		}		
	}
}
</style>