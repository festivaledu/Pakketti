<template>
	<MetroPage page-id="dashboard">
		<div class="mb-2" v-if="(isModerator || isAdministrator)">
			<MetroTextBlock text-style="sub-title">{{ $t('dashboard.overview_header') }}</MetroTextBlock>
		</div>
		
		<div class="row no-margin" v-if="statisticsData">
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
						<div class="row-wrapper" v-for="(packageObj, index) in packageData.slice(0, 5)" :key="index">
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
										:offContent="$t('packages.visible_no')"
										:onContent="$t('packages.visible_yes')"
										:readonly="true"
									/>
								</div>
								<div class="td cell">
									<MetroTextBlock>{{ packageObj.status }}</MetroTextBlock>
								</div>
								<div class="td cell">
									<MetroTextBlock>{{ packageObj.updatedAt | date }}</MetroTextBlock>
								</div>
								<div class="td cell align-right">
									<MetroButton>
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
			
			<MetroHyperlinkButton v-if="packageData && packageData.length > 5">
				<MetroTextBlock text-style="caption">{{ $t('packages.see_all') }}</MetroTextBlock>
			</MetroHyperlinkButton>
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
							<div class="row-wrapper" v-for="(reviewObj, index) in reviewData.slice(0,5)" :key="index">
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
							</div>
							
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
				
				<MetroHyperlinkButton v-if="reviewData && reviewData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.reviews_see_all') }}</MetroTextBlock>
				</MetroHyperlinkButton>
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
								<div class="th column-header-item">{{ $t('dashboard.devices_serial_number') }}</div>
							</div>
							
							<div class="row-wrapper" v-for="(deviceObj, index) in deviceData.slice(0,5)" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroStackPanel orientation="horizontal" vertical-alignment="center">
											<!-- <img src="{{device-icon}}" -->
											
											<MetroStackPanel>
												<MetroTextBlock>device type</MetroTextBlock>
												<MetroTextBlock text-style="caption">device variant</MetroTextBlock>
											</MetroStackPanel>
										</MetroStackPanel>
									</div>
									<div class="td cell">
										<MetroTextBlock>device serial</MetroTextBlock>
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</div>
							
							<div class="row-wrapper" v-if="!deviceData.length">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_no_items') }}</MetroTextBlock>
										<MetroHyperlinkButton>
											<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_create') }}</MetroTextBlock>
										</MetroHyperlinkButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<MetroHyperlinkButton v-if="deviceData && deviceData.length > 5">
					<MetroTextBlock text-style="caption">{{ $t('dashboard.devices_see_all') }}</MetroTextBlock>
				</MetroHyperlinkButton>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { DeviceAPI, PackageAPI, StatisticsAPI } from '@/scripts/ApiUtil'
import { UserRole } from "@/scripts/Enumerations"

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
		deviceData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			include: "versions, reviews, ratings"
		});
		
		let _statisticsData = null;
		// if (this.isModerator || this.isAdministrator) {
			_statisticsData = await StatisticsAPI.getMonth();
		// }
		
		let _reviewData = await PackageAPI.getReviews();
		let _deviceData = await DeviceAPI.getDevices();
		
		next(vm => {
			vm.packageData = _packageData;
			vm.statisticsData = _statisticsData
			vm.reviewData = _reviewData;
			vm.deviceData = _deviceData;
			
			vm.$parent.setHeader("Dashboard");
			vm.$parent.setSelectedMenuItem("dashboard");
		});
	},
	methods: {
		getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		}
	},
	computed: {
		isDeveloper() {
			return this.$store.state.role & UserRole.DEVELOPER;
		},
		isModerator() {
			return this.$store.state.role & UserRole.MODERATOR;
		},
		isAdministrator() {
			return this.$store.state.role & UserRole.ADMINISTRATOR;
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
		&.device-list {
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