<template>
	<MetroPage page-id="packages" @navigatedTo.native="onNavigatedTo" @navigatedBackTo.native="onNavigatedBackTo">
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="add" :label="$t('app.actions.add')" @click="navigate('package-creator')" />
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
									:offContent="$t('packages.visible_no')"
									:onContent="$t('packages.visible_yes')"
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

<script>
import { PackageAPI } from "@/scripts/ApiUtil"
import { UserRole } from "@/scripts/Enumerations"

export default {
	name: "Packages",
	data: () => ({
		packageData: null
	}),
	methods: {
		async onNavigatedTo() {
			this.$parent.setHeader(this.$t('root.item_packages'));
			
			if (this.isDeveloper || this.isModerator || this.isAdministrator) {
				this.packageData = await PackageAPI.getPackages({
					include: "versions"
				});
			}
		},
		onNavigatedBackTo() {
			this.$parent.setHeader(this.$t('root.item_packages'));
		},
		showPackageMenu(event, packageObj) {
			let packageFlyout = new metroUI.MenuFlyout({
				items: [{
					icon: "edit",
					text: this.$t('app.actions.edit'),
					action: () => {
						this.navigate("package-editor", packageObj)
					}
				}, {
					icon: "delete",
					text: this.$t('app.actions.delete'),
					action: () => {
						console.log("delete")
					}
				}]
			});
			
			packageFlyout.showAt(event.target);
		},
		navigate(pageName, packageObj) {
			this.$parent.navigate(pageName, {
				packageData: packageObj
			});
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