<template>
	<div class="page" data-page-id="dashboard" data-page-title="Dashboard" @pageShow="onPageShow">
		<h4>Overview</h4>

		<table class="data-grid" v-if="isDeveloper && packageData">
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
				<tr v-for="packageObj in this.packageData" :key="packageObj.id">
					<td>
						<p>{{ packageObj.name }}</p>
						<p class="caption">{{ packageObj.identifier }}</p>
						<!-- <p class="caption">Version 0.0.1</p>
						<p class="caption">7.414 Downloads</p> -->
					</td>
					<td>{{ packageObj.latestVersion.version }}</td>
					<td>{{ packageObj.downloadCount | number }}</td>
					<td>
						<metro-toggle-switch :value="true" />
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
						<p class="caption">No packages to display</p>
						<p class="caption" v-if="isDeveloper"><a href="#">Create a package</a></p>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import { PackageAPI } from "@/scripts/ApiUtil"
import { UserRole } from "@/scripts/Enumerations"

export default {
	name: "DashboardPage",
	data: () => ({
		packageData: null
	}),
	methods: {
		async onPageShow() {
			if (this.isDeveloper) {
				this.packageData = await PackageAPI.getPackages();
			}
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