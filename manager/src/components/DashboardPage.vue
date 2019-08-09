<template>
	<MetroPage page-id="dashboard" @navigatedTo.native="onPageShow">		
		<div class="mb-2" v-if="(isModerator || isAdministrator)">
			<MetroTextBlock text-style="sub-title">Overview</MetroTextBlock>
			
			<MetroStackPanel horizontal-alignment="center" v-if="!statisticsData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
			
			<div class="row no-margin" v-if="statisticsData">
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Downloads" :dataset="this.statisticsData.items.map(item => item['versionDownloaded'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Packages Created" :dataset="this.statisticsData.items.map(item => item['packageCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Packages Updated" :dataset="this.statisticsData.items.map(item => item['versionCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Reviews" :dataset="this.statisticsData.items.map(item => item['reviewCreated'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Registrations" :dataset="this.statisticsData.items.map(item => item['userRegistration'])" />
				</div>
				<div class="col-6 col-md-2 p-0 px-md-2 mb-3 mb-md-4">
					<Statcard name="Logins" :dataset="this.statisticsData.items.map(item => item['userLogin'])" />
				</div>
			</div>
		</div>
		
		<div class="mb-2" v-if="(isDeveloper || isModerator)">
			<MetroTextBlock text-style="sub-title">Packages</MetroTextBlock>
			
			<MetroStackPanel horizontal-alignment="center" v-if="!packageData">
				<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
			</MetroStackPanel>
			
			<div class="data-grid package-list" v-if="packageData">
				<div class="data-grid-wrapper">
					<div class="table">
						<div class="column-headers-border" />
						<div class="tr column-headers">
							<div class="th column-header-item">Name</div>
							<div class="th column-header-item">Version</div>
							<div class="th column-header-item">Downloads</div>
							<div class="th column-header-item">Visible</div>
							<div class="th column-header-item">Updated</div>
							<div class="th column-header-item align-right">Actions</div>
						</div>
						<div class="row-wrapper" v-for="(packageObj, index) in packageData.slice(0, 5)" :key="index">
							<div class="tr row">
								<div class="td cell">
									<MetroTextBlock>{{ packageObj.name }}</MetroTextBlock>
									<MetroTextBlock text-style="caption">{{ packageObj.identifier }}</MetroTextBlock>
								</div>
								<div class="td cell">
									<MetroTextBlock>{{ packageObj.latestVersion.version }}</MetroTextBlock>
								</div>
								<div class="td cell">
									<MetroTextBlock>{{ packageObj.downloadCount | number }}</MetroTextBlock>
								</div>
								<div class="td cell">
									<MetroToggleSwitch :value="packageObj.visible" offContent="No" onContent="Yes" :readonly="true" />
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
									<MetroTextBlock text-style="caption">No Packages to display</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="caption">Create a Package</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<MetroHyperlinkButton v-if="packageData && packageData.length > 5">
				<MetroTextBlock text-style="caption">See all Packages</MetroTextBlock>
			</MetroHyperlinkButton>
		</div>
		
		<div class="row">
			<div class="col-12 col-md-6">
				<MetroTextBlock text-style="sub-title">Reviews</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!reviewData || !packageData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid review-list" v-if="reviewData && packageData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">Title</div>
								<div class="th column-header-item">Date</div>
								<div class="th column-header-item">Rating</div>
							</div>
							<div class="row-wrapper" v-for="(reviewObj, index) in reviewData.slice(0,5)" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock>{{ reviewObj.title }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">packageName</MetroTextBlock>
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
										<MetroTextBlock text-style="caption">No Reviews to display</MetroTextBlock>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<MetroHyperlinkButton v-if="reviewData && reviewData.length > 5">
					<MetroTextBlock text-style="caption">See all Reviews</MetroTextBlock>
				</MetroHyperlinkButton>
			</div>
			
			<div class="col-12 col-md-6">
				<MetroTextBlock text-style="sub-title">Devices</MetroTextBlock>
				
				<MetroStackPanel horizontal-alignment="center" v-if="!deviceData">
					<MetroProgressRing :active="true" style="width: 50px; height: 50px" />
				</MetroStackPanel>
				
				<div class="data-grid device-list" v-if="deviceData">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">Device Type</div>
								<div class="th column-header-item">Serial Number</div>
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
										<MetroTextBlock text-style="caption">No Devices to display</MetroTextBlock>
										<MetroHyperlinkButton>
											<MetroTextBlock text-style="caption">Link a Device</MetroTextBlock>
										</MetroHyperlinkButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<MetroHyperlinkButton v-if="deviceData && deviceData.length > 5">
					<MetroTextBlock text-style="caption">See all Devices</MetroTextBlock>
				</MetroHyperlinkButton>
			</div>
		</div>
	</MetroPage>
</template>

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

<script>
import { PackageAPI, StatisticAPI, DeviceAPI } from "@/scripts/ApiUtil"
import { UserRole } from "@/scripts/Enumerations"

import Statcard from "@/components/StatcardComponent"

export default {
	name: "DashboardPage",
	components: {
		Statcard
	},
	data: () => ({
		packageData: null,
		statisticsData: null,
		reviewData: null,
		deviceData: null,
		
		progressRingActive: false
	}),
	methods: {
		async onPageShow() {
			this.$parent.setHeader("");
			
			// if (this.isDeveloper) {
				this.packageData = await PackageAPI.getPackages();
			// }
			
			if (this.isModerator || this.isAdministrator) {
				this.statisticsData = await StatisticAPI.getMonth();
			}
			
			this.reviewData = await PackageAPI.getReviews()
			this.deviceData = await DeviceAPI.getDevices();
		},
		
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
			return new Intl.NumberFormat("en-US").format(value)
		},
		date(value) {
			return new Date(value).toLocaleString("en-US");
		}
	}
}
</script>