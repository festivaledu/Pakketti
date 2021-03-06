<template>
	<MetroPage page-id="requests">
		<vue-headful :title="`${$t('root.item_requests')} - ${$t('app.name')}`" />
		
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" @click="refresh" />
				<MetroAppBarSeparator />
				<MetroAppBarButton :label="$t('requests.actions_title')" icon="shield" @click.native="upgradeButtonClicked" />
			</MetroCommandBar>
		</template>
		
		<div class="data-grid request-list" v-if="requestData">
			<div class="data-grid-wrapper">
				<div class="table">
					<div class="column-headers-border" />
					<div class="tr column-headers">
						<div class="th column-header-item">{{ $t('requests.type.title') }}</div>
						<div class="th column-header-item">{{ $t('requests.status.title') }}</div>
						<div class="th column-header-item align-right">{{ $t('packages.actions') }}</div>
					</div>
					<div class="row-wrapper" v-for="(requestObj, index) in requestData" :key="index">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock>{{ $t(`requests.type.${requestObj.type}`) }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ requestObj.detailText }}</MetroTextBlock>
							</div>
							<div class="td cell">
								<MetroTextBlock>{{ $t(`requests.status.${requestObj.status}`) }}</MetroTextBlock>
							</div>
							<div class="td cell align-right">
								<MetroButton @click="showActionMenu($event, requestObj)">
									<MetroSymbolIcon icon="more" />
								</MetroButton>
							</div>
						</div>
						<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
					</div>
					
					<div class="row-wrapper" v-if="!requestData.length">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock text-style="caption">{{ $t('dashboard.requests_no_items') }}</MetroTextBlock>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { AccountAPI, PackageAPI, RequestAPI } from '@/scripts/ApiUtil'
import { UserRole, LogItemType } from "@/scripts/Enumerations"

export default {
	name: "Requests",
	data: () => ({
		requestData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _requestData = await RequestAPI.getRequests();
		
		next(vm => {
			vm.requestData = _requestData;
			
			if (to.params.requestId && _requestData.find(requestObj => requestObj.id == to.params.requestId)) {
				vm.viewRequest(_requestData.find(requestObj => requestObj.id == to.params.requestId));
			}
			
			vm.$parent.setHeader(vm.$t('root.item_requests'));
			vm.$parent.setSelectedMenuItem("requests");
		});
	},
	methods: {
		showActionMenu(e, requestObj) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "view",
					text: this.$t('app.actions.view'),
					action: () => this.viewRequest(requestObj)
				}, {
					icon: "delete",
					text: this.$t('app.actions.delete'),
					action: () => this.deleteRequest(requestObj),
					disabled: !this.isModerator && !this.isAdministrator && requestObj.accountId !== this.accountId
				}]
			});
			
			flyout.showAt(e.target);
		},
		async viewRequest(requestObj) {
			let _requestObj = {...requestObj};
			
			let _requestCreatorData = await AccountAPI.getUser({
				"account.id": requestObj.accountId
			});
			
			let _accountData = null;
			if (requestObj.affectedAccountId) {
				_accountData = await AccountAPI.getUser({
					"account.id": requestObj.affectedAccountId
				})
			}
			
			let _packageData = null;
			let _reviewData = null;
			if (requestObj.affectedPackageId) {
				_packageData = (await PackageAPI.getPackages({
					"package.id": requestObj.affectedPackageId,
					include: "reviews"
				}))[0];
				
				if (requestObj.affectedReviewId) {
					_reviewData = packageData.reviews.find(_ => _.id == requestObj.affectedReviewId);
				}
			}
			
			let dialog = new metroUI.ContentDialog({
				title: this.$t('requests.review_request'),
				content: () => (
					<div class="row" style="width: 500px">
						<div class="col-12 col-md-6">
							<div class="mb-4">
								<MetroTextBlock text-style="base">{this.$t('requests.type.title')}</MetroTextBlock>
								<MetroTextBlock>{this.$t(`requests.type.${requestObj.type}`)}</MetroTextBlock>
							</div>
							
							<div class="mb-4">
								<MetroTextBox textarea={true} readOnly={this.accountId !== requestObj.accountId} header={this.$t('requests.detail_text_header')} value={requestObj.detailText} />
							</div>
							
							<div class="mb-4">
								<MetroComboBox
									header={this.$t('requests.status.title')}
									placeholder-text={this.$t('requests.status.-1')}
									items-source={{
										'0': this.$t('requests.status.0'),
										'1': this.$t('requests.status.1')
									}}
									v-model={_requestObj.status}
									no-update={true}
									required={true}
									disabled={(!this.isModerator && !this.isAdministrator) || requestObj.status >= 0 || requestObj.accountId == this.accountId}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox textarea={true} readOnly={(!this.isModerator && !this.isAdministrator) || requestObj.status >= 0 || requestObj.accountId == this.accountId} header={this.$t('requests.status_text_header')} v-model={_requestObj.statusText} required={true} />
							</div>
						</div>
						
						<div class="col-12 col-md-6">
							<div class="mb-5">
								<MetroTextBlock text-style="base">{this.$t('requests.creator')}</MetroTextBlock>
								<MetroTextBlock>{`${_requestCreatorData.username} (${_requestCreatorData.email || this.$t('requests.affected.na')})` || this.$t('requests.affected.na')}</MetroTextBlock>
							</div>
							<div class="mb-4">
								<MetroTextBlock text-style="base">{this.$t('requests.affected.account')}</MetroTextBlock>
								<MetroTextBlock>{_accountData ? `${_accountData.username} (${_accountData.email || this.$t('requests.affected.na')})` : this.$t('requests.affected.na')}</MetroTextBlock>
							</div>
							<div class="mb-4">
								<MetroTextBlock text-style="base">{this.$t('requests.affected.package')}</MetroTextBlock>
								<MetroTextBlock>{_packageData ? `${_packageData.name} (${_packageData.identifier})` : this.$t('requests.affected.na')}</MetroTextBlock>
							</div>
							<div class="mb-4">
								<MetroTextBlock text-style="base">{this.$t('requests.affected.review')}</MetroTextBlock>
								<MetroTextBlock>{_reviewData ? `${_reviewData.title} (${new Date(_reviewData.createdAt).toLocaleString()})` : this.$t('requests.affected.na')}</MetroTextBlock>
							</div>
							
							{(this.isModerator || this.isAdministrator) && requestObj.affectedAccountId && (
								<MetroButton
									onclick={(e) => this.manageUserButtonClicked(e, _accountData.id)} disabled={requestObj.accountId == this.accountId || _accountData.role > this.accountRole}>{this.$t('requests.manage_user')}</MetroButton>
							)}
						</div>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.actions.save'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await RequestAPI.updateRequest({
					"request.id": requestObj.id,
				}, _requestObj);
				
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
			
			if (this.$route.params.requestId) {
				this.$router.replace(`/${this.$route.path.split("/")[1]}`);
			}
		},
		async deleteRequest(requestObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('requests.delete_request_confirm_title'),
				content: this.$t('requests.delete_request_confirm_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await RequestAPI.deleteRequest({
					"request.id": requestObj.id
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
		upgradeButtonClicked(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					text: this.$t('requests.role_application.title_developer'),
					disabled: this.isDeveloper,
					action: () => this.requestRoleUpgrade(UserRole.DEVELOPER)
				}, {
					text: this.$t('requests.role_application.title_moderator'),
					disabled: !this.isDeveloper || this.isModerator || this.isAdministrator,
					action: () => this.requestRoleUpgrade(UserRole.MODERATOR)
				}, {
					text: this.$t('requests.role_downgrade.title'),
					disabled: (!this.isDeveloper && !this.isModerator) || this.isRoot,
					action: () => this.requestRoleDowngrade()
				}, {
					text: this.$t('requests.account_deletion.title'),
					disabled: this.isRoot,
					action: () => this.requestAccountDeletion()
				}]
			});
			
			flyout.showAt(e.target);
		},
		async requestRoleUpgrade(userRole) {
			let dialog = new metroUI.ContentDialog({
				title: (() => {
					switch (userRole) {
					case UserRole.DEVELOPER:
						return this.$t('requests.role_application.title_developer');
					case UserRole.MODERATOR:
						return this.$t('requests.role_application.title_moderator');
					}
				})(),
				content: () => (
					<div>
						<div class="mb-4">
							<MetroTextBox textarea={true} required={true} header={this.$t('requests.role_application.reason_header')} name="detailText" />
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="caption">{this.$t('requests.role_application.developer_notice')}</MetroTextBlock>
						</div>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await RequestAPI.createRequest({
					detailText: dialog.text["detailText"],
					type: (() => {
						switch (userRole) {
						case UserRole.DEVELOPER:
							return 	LogItemType.DEV_APPLICATION;
						case UserRole.MODERATOR:
							return LogItemType.MOD_APPLICATION;
						}
					})(),
					affectedAccountId: this.accountId
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
		async requestRoleDowngrade() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('requests.role_downgrade.title'),
				content: () => (
					<div>
						<div class="mb-4">
							<MetroTextBox textarea={true} required={true} header={this.$t('requests.role_downgrade.reason_header')} name="detailText" />
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="caption">{this.$t('requests.role_downgrade.developer_notice')}</MetroTextBlock>
						</div>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await RequestAPI.createRequest({
					detailText: dialog.text["detailText"],
					type: LogItemType.ROLE_DOWNGRADE
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
		async requestAccountDeletion() {
			let dialog = new metroUI.ContentDialog({
				title: this.$t('requests.account_deletion.title'),
				content: () => (
					<div>
						<div class="mb-4">
							<MetroTextBox textarea={true} required={true} header={this.$t('requests.account_deletion.reason_header')} name="detailText" />
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="caption">{this.$t('requests.account_deletion.disclaimer')}</MetroTextBlock>
						</div>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await dialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await RequestAPI.createRequest({
					detailText: dialog.text["detailText"],
					affectedAccountId: this.accountId,
					type: LogItemType.DELETE_REQUEST
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
		async manageUserButtonClicked(e, accountId) {
			let accountData = await AccountAPI.getUser({
				"account.id": accountId
			});
			
			let flyout = new metroUI.MenuFlyout({
				items: [{
					text: this.$t('requests.account_roles.title'),
					disabled: accountData.role & UserRole.DEVELOPER == UserRole.DEVELOPER,
					action: async () => {
						let _accountData = {...accountData};
						
						let dialog = new metroUI.ContentDialog({
							title: this.$t('requests.account_roles.title'),
							content: () => (
								<div>
									<MetroCheckbox
										content={this.$t('requests.account_roles.developer')}
										oninput={() => { _accountData.role ^= UserRole.DEVELOPER }}
										value={Boolean(_accountData.role & UserRole.DEVELOPER)}
									/>
									<MetroCheckbox
										content={this.$t('requests.account_roles.moderator')}
										disabled={accountData.role > this.accountRole}
										oninput={() => { _accountData.role ^= UserRole.MODERATOR }}
										value={Boolean(_accountData.role & UserRole.MODERATOR)}
									/>
									{this.isRoot && 
									<MetroCheckbox
										content={this.$t('requests.account_roles.administrator')}
										disabled={accountData.role > this.accountRole}
										oninput={() => { _accountData.role ^= UserRole.ADMINISTRATOR }}
										value={Boolean(_accountData.role & UserRole.ADMINISTRATOR)}
									/>
									}
								</div>
							),
							commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
						});
						
						if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
							let result = await AccountAPI.updateUser({
								"account.id": accountData.id
							}, {
								role: _accountData.role
							});
							
							if (result.error) {
								console.log(result.error);
							} else {
								this.refresh();
							}
							
						}
					}
				}, {
					text: this.$t('requests.account_deletion.title'),
					disabled: accountData.role >= this.accountRole,
					action: async () => {
						let deleteDialog = new metroUI.ContentDialog({
							title: this.$t('requests.delete_account_confirm_title', { username: accountData.username }),
							content: this.$t('requests.delete_account_confirm_body', { username: accountData.username }),
							commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
						});
						
						if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
							let result = await AccountAPI.deleteUser({
								"account.id": accountData.id
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
					}
				}]
			});
			
			flyout.showAt(e.target);
		},
		async refresh() {
			this.requestData = await RequestAPI.getRequests();
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		accountRole() {
			return this.$store.state.role;
		},
		isDeveloper() {
			return (this.$store.state.role & UserRole.DEVELOPER) == UserRole.DEVELOPER;
		},
		isModerator() {
			return (this.$store.state.role & UserRole.MODERATOR) == UserRole.MODERATOR;
		},
		isAdministrator() {
			return (this.$store.state.role & UserRole.ADMINISTRATOR) == UserRole.ADMINISTRATOR;
		},
		isRoot() {
			return (this.$store.state.role & UserRole.ROOT) == UserRole.ROOT;
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="requests"] {
	.data-grid {
		.row {
			.cell:not(:first-child) {
				color: var(--base-medium);
			}
		}
		
		&.request-list {
			.table {
				width: 100%;
			}
			
			.row {
				height: 47px;
			}
			.row-background {
				height: 47px;
				
				&:after {
					height: 47px;
				}
			}
			
			.toggle-switch,
			.rating-control {
				pointer-events: none;
				min-width: auto;
			}
		}
	}
}
</style>