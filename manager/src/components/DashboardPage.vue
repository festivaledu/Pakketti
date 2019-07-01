<template>
	<div class="page" data-page-id="dashboard" data-page-title="Dashboard" @pageShow="onPageShow">
		<h4>Overview</h4>
		
		<div class="row" v-if="(isModerator || isAdministrator) && statisticsData">
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
		
		<div class="mb-2" v-if="(isDeveloper || isModerator) && packageData">
			<h4>Packages</h4>
			<table class="data-grid mb-3">
				<thead>
					<tr>
						<th>Name</th>
						<th>Version</th>
						<th>Downloads</th>
						<th>Visible</th>
						<th>Updated</th>
						<th class="align-right">Actions</th>
					</tr>
				</thead>
				<tbody v-if="packageData.length">
					<tr v-for="packageObj in this.packageData.slice(0,5)" :key="packageObj.id">
						<td>
							<p>{{ packageObj.name }}</p>
							<p class="caption">{{ packageObj.identifier }}</p>
							<!-- <p class="caption">Version 0.0.1</p>
							<p class="caption">7.414 Downloads</p> -->
						</td>
						<td>{{ packageObj.latestVersion.version }}</td>
						<td>{{ packageObj.downloadCount | number }}</td>
						<td>
							<metro-toggle-switch :value="packageObj.visible" onContent="Yes" offContent="No" :readonly="true" />
						</td>
						<td>{{ packageObj.updatedAt | date }}</td>
						<td class="align-right">
							<button class="icon-button"><i class="icon more"></i></button>
						</td>
					</tr>
				</tbody>
				<tbody v-if="!packageData.length">
					<tr>
						<td colspan="6">
							<p class="caption">No Packages to display</p>
							<p class="caption" v-if="isDeveloper"><a href="#">Create a Package</a></p>
						</td>
					</tr>
				</tbody>
			</table>
			
			<p class="caption" v-if="packageData.length > 5"><a href="#">See all Packages</a></p>
		</div>
		
		<div class="row">
			<div class="col-6">
				<h4>Reviews</h4>
				<table class="data-grid mb-4" v-if="reviewData && packageData">
					<thead>
						<tr>
							<th>Title</th>
							<th>Date</th>
							<th>Rating</th>
						</tr>
					</thead>
					<tbody v-if="reviewData.length">
						<tr v-for="reviewObj in reviewData.slice(0,5)" :key="reviewObj.id">
							<td>
								<p>{{ reviewObj.title }}</p>
								<p class="caption">{{ getPackageInfo(reviewObj.packageId).name }} – {{ getPackageInfo(reviewObj.packageId).identifier }}</p>
							</td>
							<td>{{ reviewObj.createdAt | date }}</td>
							<td>
								<div class="review-rating-view">
									<div class="rating-star" v-for="i in reviewObj.rating.value" :key="i" />
									<div class="rating-star outline" v-for="i in (5 - reviewObj.rating.value)" :key="i"  />
								</div>
							</td>
						</tr>
					</tbody>
					<tbody v-if="!reviewData.length">
						<tr>
							<td colspan="3">
								<p class="caption">No Reviews to display</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			
			<div class="col-6">
				<h4>Devices</h4>
				<table class="data-grid mb-4" v-if="deviceData">
					<thead>
						<tr>
							<th colspan="2">Device Type</th>
							<th>Serial Number</th>
						</tr>
					</thead>
					<tbody v-if="deviceData.length">
						<!-- <tr>
							<td class="device-icon">
								<img src="" />
							</td>
							<td class="first-column">
								<p>iPad Pro (10.5-inch, WiFi)</p>
								<p class="caption">Space Gray, 64GB</p>
							</td>
							<td>
								<p>abcdef0123456789</p>
							</td>
						</tr> -->
					</tbody>
					<tbody v-if="!deviceData.length">
						<tr>
							<td colspan="3">
								<p class="caption">No Devices to display</p>
								<p class="caption"><a href="#">Link a Device</a></p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style lang="less">
	.review-rating-view {
		display: flex;
		width: 72px;
		height: 20px;
		
		.rating-star {
			width: 12px;
			height: 20px;
			
			&:after {
				font-size: 12px;
				font-family: "Segoe MDL2 Assets";
			}
			
			&:not(.outline):after {
				content: "\E735";
				color: var(--system-accent-color);
			}
			
			&.outline:after {
				content: "\E734";
			}
		}
	}
	
	.data-grid .first-column {
		color: var(--base-high) !important;
	}
	
	.device-icon {
		height: 80px;
		width: 88px;
		
		img {
			width: 64px;
			height: 64px;
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
	}),
	methods: {
		async onPageShow() {
			if (this.isDeveloper) {
				this.packageData = await PackageAPI.getPackages();
			}
			
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