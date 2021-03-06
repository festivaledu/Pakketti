<template>
	<MetroPage page-id="dashboard">
		<vue-headful :title="`${$t('root.item_dashboard')} - ${$t('app.name')}`" />
		
		<template v-if="statisticsData && (isModerator || isAdministrator)">
			<div class="mb-2">
				<MetroTextBlock text-style="sub-title">{{ $t('dashboard.overview_header') }}</MetroTextBlock>
			</div>
			
			<div class="row no-margin">
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_downloads')" :dataset="this.statisticsData.items.map(item => item['versionDownloaded'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_packages_created')" :dataset="this.statisticsData.items.map(item => item['packageCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_packages_updated')" :dataset="this.statisticsData.items.map(item => item['versionCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_reviews')" :dataset="this.statisticsData.items.map(item => item['reviewCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_registrations')" :dataset="this.statisticsData.items.map(item => item['userRegistration'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard :name="$t('dashboard.overview_logins')" :dataset="this.statisticsData.items.map(item => item['userLogin'])" />
				</div>
			</div>
		</template>
		
		<div class="mb-2" v-if="(isDeveloper || isModerator)">
			<MetroTextBlock text-style="sub-title">{{ $t('packages.header') }}</MetroTextBlock>
			
			<div class="data-grid package-list" v-if="packageData">
				<div class="data-grid-wrapper">
					<div class="table">
						<div class="column-headers-border" />
						<div class="tr column-headers">
							<div class="th column-header-item">{{ $t('packages.name') }}</div>
							<div class="th column-header-item">{{ $t('packages.version') }}</div>
							<div class="th column-header-item">{{ $t('packages.downloads') }}</div>
							<div class="th column-header-item">{{ $t('packages.visible') }}</div>
							<div class="th column-header-item">Status</div>
							<div class="th column-header-item">{{ $t('packages.updated') }}</div>
							<div class="th column-header-item align-right">{{ $t('packages.actions') }}</div>
						</div>
						<div class="row-wrapper" v-for="(packageObj, index) in filteredPackageData" :key="index">
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
									<MetroTextBlock>{{ $t(`packages.status.${packageObj.status}`) }}</MetroTextBlock>
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
									<router-link to="/packages/new" class="hyperlink-button">
										<MetroTextBlock text-style="caption">{{ $t('packages.create') }}</MetroTextBlock>
									</router-link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<router-link to="/packages" class="hyperlink-button" v-if="packageData && packageData.length > 5">
				<MetroTextBlock text-style="caption">{{ $t('packages.see_all') }}</MetroTextBlock>
			</router-link>
		</div>
		
		<div class="row">
			<div class="col-12 col-md-6">
				<MetroTextBlock text-style="sub-title">{{ $t('dashboard.reviews_header') }}</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!reviewData || !packageData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid review-list" v-if="reviewData && packageData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">{{ $t('dashboard.reviews_title') }}</div>
								<div class="th column-header-item">{{ $t('dashboard.reviews_date') }}</div>
								<div class="th column-header-item">{{ $t('dashboard.reviews_rating') }}</div>
							</div>
							<router-link tag="div" :to="`/reviews/${reviewObj.id}`" class="row-wrapper" v-for="(reviewObj, index) in filteredReviewData" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock>{{ reviewObj.title }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ getPackageInfo(reviewObj.packageId).name }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ reviewObj.createdAt | date }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroRatingControl :value="reviewObj.rating.value" />
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</router-link>
							
							<div class="row-wrapper" v-if="!reviewData.length">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock text-style="caption">{{ $t('dashboard.reviews_no_items') }}</MetroTextBlock>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<router-link to="/reviews" class="hyperlink-button" v-if="reviewData && reviewData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.reviews_see_all') }}</MetroTextBlock>
				</router-link>
			</div>
			
			<div class="col-12 col-md-6">
				<MetroTextBlock text-style="sub-title">{{ $t('dashboard.devices_header') }}</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!deviceData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid device-list" v-if="deviceData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">{{ $t('dashboard.devices_type') }}</div>
								<div class="th column-header-item">{{ $t('dashboard.devices_platform') }}</div>
								<div class="th column-header-item">{{ $t('dashboard.devices_serial_number') }}</div>
							</div>
							
							<router-link tag="div" :to="`/devices/${deviceObj.id}`" class="row-wrapper" v-for="(deviceObj, index) in filteredDeviceData" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroStackPanel orientation="horizontal" vertical-alignment="center">
											<!-- <img src="{{device-icon}}" -->
											
											<MetroStackPanel>
												<MetroTextBlock>{{ deviceObj.name || $t('devices.unnamed_device') }}</MetroTextBlock>
												
												<MetroTextBlock text-style="caption" v-if="deviceObj.platform == 'iphoneos'">{{ DeviceStrings[deviceObj.product] || $t('devices.unknown_product') }}</MetroTextBlock>
												<MetroTextBlock text-style="caption" v-else>{{ deviceObj.product }}</MetroTextBlock>
											</MetroStackPanel>
										</MetroStackPanel>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ Platforms.platforms[deviceObj.platform] || $t('devices.unknown_platform') }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ deviceObj.udid }}</MetroTextBlock>
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</router-link>
							
							<div class="row-wrapper" v-if="!deviceData.length">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_no_items') }}</MetroTextBlock>
										<router-link to="/devices" class="hyperlink-button">
											<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_create') }}</MetroTextBlock>
										</router-link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<router-link to="/devices" class="hyperlink-button" v-if="deviceData && deviceData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_see_all') }}</MetroTextBlock>
				</router-link>
			</div>
		</div>
		
		<div class="row" v-if="isModerator || isAdministrator">
			<div class="col-12 col-md-6">
				<MetroTextBlock text-style="sub-title">{{ $t('dashboard.requests_header') }}</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!requestData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid request-list" v-if="requestData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">{{ $t('requests.type.title') }}</div>
								<div class="th column-header-item">{{ $t('requests.status.title') }}</div>
							</div>
							<router-link tag="div" :to="`/requests/${requestObj.id}`" class="row-wrapper" v-for="(requestObj, index) in filteredRequestData" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock>{{ $t(`requests.type.${requestObj.type}`) }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ requestObj.detailText }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ $t(`requests.status.${requestObj.status}`) }}</MetroTextBlock>
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</router-link>
							
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
				
				<router-link to="/requests" class="hyperlink-button" v-if="requestData && requestData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.requests_see_all') }}</MetroTextBlock>
				</router-link>
			</div>
			
			<div class="col-12 col-md-6" v-if="isRoot">
				<MetroTextBlock text-style="sub-title">{{ $t('dashboard.users_header') }}</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!userData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid request-list" v-if="userData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">{{ $t('users.username') }}</div>
								<div class="th column-header-item">{{ $t('users.created_at') }}</div>
							</div>
							<router-link tag="div" :to="`/users/${userObj.id}`" class="row-wrapper" v-for="(userObj, index) in filteredUserData" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock>{{ userObj.username }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ userObj.createdAt | date }}</MetroTextBlock>
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</router-link>
							
							<div class="row-wrapper" v-if="!userData.length">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock text-style="caption">{{ $t('dashboard.users_no_items') }}</MetroTextBlock>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<router-link to="/users" class="hyperlink-button" v-if="userData && userData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.users_see_all') }}</MetroTextBlock>
				</router-link>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { AccountAPI, DeviceAPI, PackageAPI, RequestAPI, StatisticsAPI } from '@/scripts/ApiUtil'
import { UserRole } from "@/scripts/Enumerations"
import Platforms from '../../../platforms.json'
import DeviceStrings from '../../../deviceStrings.json'

import Statcard from "@/components/Statcard"

export default {
	name: "dashboard",
	components: {
		Statcard
	},
	data: () => ({
		packageData: null,
		statisticsData: null,
		reviewData: null,
		deviceData: null,
		requestData: null,
		userData: null,
		
		Platforms: Platforms,
		DeviceStrings: DeviceStrings
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			include: "versions, reviews, ratings"
		});
		
		let _statisticsData = await StatisticsAPI.getMonth();
		let _reviewData = await PackageAPI.getReviews();
		let _deviceData = await DeviceAPI.getDevices();
		let _requestData = await RequestAPI.getRequests();
		let _userData = await AccountAPI.getAllUsers();
		
		next(vm => {
			vm.packageData = _packageData;
			
			if (vm.isModerator || vm.isAdministrator) vm.statisticsData = _statisticsData;
			
			vm.reviewData = _reviewData;
			vm.deviceData = _deviceData;
			vm.requestData = _requestData;
			
			if (vm.isRoot) vm.userData = _userData;
			
			vm.$parent.setHeader(vm.$t('root.item_dashboard'));
			vm.$parent.setSelectedMenuItem("dashboard");
		});
	},
	methods: {
		getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		},
		async refresh() {
			this.packageData = await PackageAPI.getPackages({
				include: "versions, reviews, ratings"
			});
			
			this.statisticsData = await StatisticsAPI.getMonth();
			this.reviewData = await PackageAPI.getReviews();
			this.deviceData = await DeviceAPI.getDevices();
		},
		showPackageMenu(event, packageObj) {
			let packageFlyout = new metroUI.MenuFlyout({
				items: [{
					icon: "edit",
					text: this.$t('app.actions.edit'),
					action: () => {
						this.$router.push(`/package/${packageObj.identifier}`)
					}
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
		}
	},
	computed: {
		filteredPackageData() {
			return [...this.packageData].slice(0,5);
		},
		filteredReviewData() {
			return [...this.reviewData].slice(0,5);
		},
		filteredDeviceData() {
			return [...this.deviceData].slice(0,5);
		},
		filteredRequestData() {
			return [...this.requestData].slice(0,5);
		},
		filteredUserData() {
			return [...this.userData].filter(userObj => userObj.id != this.accountId).slice(0,5);
		},
		
		accountId() {
			return this.$store.state.accountId;
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
.page[data-page-id="dashboard"] {
	.data-grid {
		.row {
			.cell:not(:first-child) {
				color: var(--base-medium);
			}
		}
		
		&.package-list,
		&.review-list,
		&.device-list,
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