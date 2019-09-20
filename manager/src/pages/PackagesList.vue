<template>
	<MetroPage page-id="packages">
		<vue-headful :title="`${$t('root.item_packages')} - ${$t('app.name')}`" />
		
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" @click="refresh()" />
				<MetroAppBarSeparator />
				<MetroAppBarButton icon="add" :label="$t('app.actions.add')" @click="navigate('/package/new')" />
			</MetroCommandBar>
		</template>
		
		<MetroStackPanel horizontal-alignment="center" v-if="!packageData">
			<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
		</MetroStackPanel>
			
		<div class="data-grid package-list" v-if="packageData">
			<div class="data-grid-wrapper">
				<div class="table">
					<div class="column-headers-border" />
					<div class="tr column-headers">
						<div class="th column-header-item">{{ $t('packages.name') }}</div>
						<div class="th column-header-item">{{ $t('packages.version') }}</div>
						<div class="th column-header-item">{{ $t('packages.downloads') }}</div>
						<div class="th column-header-item">{{ $t('packages.visible') }}</div>
						<div class="th column-header-item">{{ $t('packages.updated') }}</div>
						<div class="th column-header-item align-right">{{ $t('packages.actions') }}</div>
					</div>
					<div class="row-wrapper" v-for="(packageObj, index) in packageData" :key="index">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock>{{ packageObj.name }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ packageObj.identifier }}</MetroTextBlock>
							</div>
							<div class="td cell">
								<MetroTextBlock>{{ packageObj.versions && packageObj.versions.length ? packageObj.versions[0].version : "– –" }}</MetroTextBlock>
							</div>
							<div class="td cell">
								<MetroTextBlock>{{ packageObj.downloadCount | number }}</MetroTextBlock>
							</div>
							<div class="td cell">
								<MetroToggleSwitch :value="packageObj.visible"
									:offContent="$t('packages.visible_state.no')"
									:onContent="$t('packages.visible_state.yes')"
									:readonly="true"
								/>
							</div>
							<div class="td cell">
								<MetroTextBlock>{{ packageObj.updatedAt | date }}</MetroTextBlock>
							</div>
							<div class="td cell align-right">
								<MetroButton @click="showPackageMenu($event, packageObj)">
									<MetroSymbolIcon icon="more" />
								</MetroButton>
							</div>
						</div>
						<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
					</div>
					
					<div class="row-wrapper" v-if="!packageData.length">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock text-style="caption">{{ $t('packages.no_items') }}</MetroTextBlock>
								<MetroHyperlinkButton>
									<MetroTextBlock text-style="caption">{{ $t('packages.create') }}</MetroTextBlock>
								</MetroHyperlinkButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'
import { UserRole } from "@/scripts/Enumerations"

export default {
	name: "Packages",
	data: () => ({
		packageData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			include: "versions"
		});
		
		next(vm => {
			if (vm.isDeveloper || vm.isModerator || vm.isAdministrator) {
				vm.packageData = _packageData;
			} else {
				vm.packageData = [];
			}
			
			vm.$parent.setHeader(vm.$t('root.item_packages'));
			vm.$parent.setSelectedMenuItem("packages");
		});
	},
	methods: {
		async refresh() {
			let _packageData = await PackageAPI.getPackages({
				include: "versions"
			});
			
			if (this.isDeveloper || this.isModerator || this.isAdministrator) {
				this.packageData = _packageData;
			} else {
				this.packageData = [];
			}
		},
		showPackageMenu(event, packageObj) {
			let packageFlyout = new metroUI.MenuFlyout({
				items: [{
					icon: "edit",
					text: this.$t('app.actions.edit'),
					action: () => this.navigate(`/package/${packageObj.identifier}`)
				}, {
					icon: "delete",
					text: this.$t('app.actions.delete'),
					disabled: 
						(packageObj.accountId != this.accountId) || 
						(!this.isDeveloper && !this.isModerator && !this. isAdministrator),
					action: async () => {
						let deleteDialog = new metroUI.ContentDialog({
							title: this.$t('packages.delete_package_confirm_title', { name: packageObj.name }),
							content: this.$t('packages.delete_package_confirm_body', { name: packageObj.name }),
							commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
						});
						
						if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
							let result = await PackageAPI.deletePackage({
								"package.id": packageObj.id
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
			
			packageFlyout.showAt(event.target);
		},
		navigate(pageName, packageObj) {
			this.$router.push(pageName);
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		isDeveloper() {
			return this.$store.state.role & UserRole.DEVELOPER == UserRole.DEVELOPER;
		},
		isModerator() {
			return this.$store.state.role & UserRole.MODERATOR == UserRole.MODERATOR;
		},
		isAdministrator() {
			return this.$store.state.role & UserRole.ADMINISTRATOR == UserRole.ADMINISTRATOR;
		}
	},
	filters: {
		number(value) {
			return new Intl.NumberFormat().format(value)
		},
		date(value) {
			return new Date(value).toLocaleString();
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="packages"] {
	.data-grid {
		.row {
			.cell:not(:first-child) {
				color: var(--base-medium);
			}
		}
		
		&.package-list {
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