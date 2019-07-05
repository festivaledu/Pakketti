<template>
	<div class="page" data-page-id="packages" data-page-title="Packages" @pageShow="onPageShow">
		<div class="table-container" v-if="(isDeveloper || isModerator || isAdministrator) && packageData">
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
					<tr v-for="packageObj in packageData" :key="packageObj.id">
						<td>
							<p>{{ packageObj.name }}</p>
							<p class="caption">{{ packageObj.identifier }}</p>
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
			
			<metro-command-bar>
				<template slot="buttons">
					<metro-app-bar-button icon="add" title="Add" />
				</template>
			</metro-command-bar>
		</div>
	</div>
</template>

<style lang="less">
	.page[data-page-id="packages"] {
		padding-bottom: 58px !important;
	
		.table-container {
			height: 100%;
			
			.data-grid {
				max-height: 100%;
				display: flex;
				flex-direction: column;
				
				thead,
				tbody {
					display: block;
				}
				
				tbody {
					overflow-y: scroll;
					flex: 1;
				}
				
				tr {
					display: flex;
					
					th, td {
						display: flex;
					}
				}
			}
		}
	}
</style>

<script>
import { PackageAPI } from "@/scripts/ApiUtil"
import { UserRole } from "@/scripts/Enumerations"

export default {
	name: "PackagesPage",
	data: () => ({
		packageData: null
	}),
	methods: {
		async onPageShow() {
			if (this.isDeveloper || this.isModerator || this.isAdministrator) {
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