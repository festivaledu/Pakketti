<template>
	<MetroPage page-id="devices">
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="add" :label="$t('app.actions.add')" @click.native="deviceAddButtonClicked" />
			</MetroCommandBar>
		</template>
		
		<div class="grid-view">
			<div class="grid-view-item" v-for="(deviceObj) in deviceData" :key="deviceObj.id">
				<div class="device-container">
					<div class="device-description-container">
						<img class="device-artwork" v-if="deviceObj.variant"/>
						<MetroTextBlock text-style="base">{{ deviceObj.name || "Unnamed device" }}</MetroTextBlock>
						
						<MetroTextBlock v-if="deviceObj.platform == 'iphoneos'">{{ DeviceStrings[deviceObj.product] || "Unknown type" }}</MetroTextBlock>
						<MetroTextBlock v-else>{{ deviceObj.product }}</MetroTextBlock>
						
						<MetroTextBlock>{{ Platforms.platforms[deviceObj.platform] || "Unknown platform" }} {{ deviceObj.version }}</MetroTextBlock>
					</div>
					
					<MetroStackPanel orientation="horizontal" class="device-toolbar">
						<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="deviceEditButtonClicked(deviceObj)" />
						<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="deviceDeleteButtonClicked(deviceObj)" />
					</MetroStackPanel>
				</div>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { DeviceAPI } from '@/scripts/ApiUtil'
import Platforms from '../../../platforms.json'
import DeviceStrings from '../../../deviceStrings.json'
import DeviceVariants from '../../../deviceVariants.json'

export default {
	name: "Devices",
	data: () => ({
		deviceData: null,
		Platforms: Platforms,
		DeviceStrings: DeviceStrings
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _deviceData = await DeviceAPI.getDevices();
		
		next(vm => {
			vm.deviceData = _deviceData;
			
			vm.$parent.setHeader(vm.$t('root.item_devices'));
			vm.$parent.setSelectedMenuItem("devices");
		});
	},
	methods: {
		deviceAddButtonClicked(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "add",
					text: "Add Device",
					action: this.addDevice
				}, {
					icon: "add",
					text: "Add iOS Device",
					action: this.addiOSDevice
				}]
			});
			
			flyout.showAt(e.target);
		},
		async addDevice() {
			let _deviceObj = {};
			
			let deviceDialog = new metroUI.ContentDialog({
				title: "Edit device",
				content: () => {
					return (
						<div class="row">
							<div class="col col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBox
										header="Device name"
										placeholder-text="Optional"
										v-model={_deviceObj.name}
									/>
								</div>
								
								<div class="mb-4">
									<MetroTextBox
										header="Product Identifier / Model Number"
										v-model={_deviceObj.product}
										required={true}
									/>
								</div>
								
								<div class="mb-4">
									<MetroComboBox
										header="Platform"
										items-source={{
											'win': this.$t('package_editor.info.platform.win'),
											'darwin': this.$t('package_editor.info.platform.darwin'),
											'iphoneos': this.$t('package_editor.info.platform.iphoneos')
										}}
										v-model={_deviceObj.platform}
										no-update={true}
										required={true}
									/>
								</div>
								
								<div class="mb-4">
									<MetroTextBox
										header="OS Version"
										v-model={_deviceObj.version}
										required={true}
									/>
								</div>
							</div>
							
							<div class="col col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBox
										header="Serial Number"
										v-model={_deviceObj.udid}
										required={true}
									/>
								</div>
								
								<div class="mb-4">
									<MetroTextBox
										header="Capacity (GB)"
										v-model={_deviceObj.capacity}
									/>
								</div>
							</div>
						</div>
					)
				},
				commands: [{ text: "Cancel" }, { text: "Link", primary: true }]
			});
			
			if (await deviceDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.createDevice(_deviceObj);
				
				if (result.error) {
					console.error(result.error);
				} else {
					this.refresh()
				}
			}
		},
		addiOSDevice() {
			window.location.href = "http://localhost:3000/api/link"
		},
		async deviceEditButtonClicked(deviceObj) {
			let _deviceObj = {...deviceObj};
			
			const isiPhoneOSDevice = deviceObj.platform == "iphoneos"
			let deviceVariants = [];
			
			if (isiPhoneOSDevice && deviceObj.product) {
				Object.keys(DeviceVariants).forEach(variantKey => {
					if (deviceObj.product.match(new RegExp(variantKey))) {
						deviceVariants = DeviceVariants[variantKey].variants.reduce((obj, item) => ({
							...obj,
							[item.variant]: item.name
						}), {});
					}
				});
			}
			
			let deviceDialog = new metroUI.ContentDialog({
				title: "Edit device",
				content: () => {
					return (
						<div class="row">
							<div class="col col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBox
										header="Device name"
										v-model={_deviceObj.name}
									/>
								</div>
								
								<div class="mb-4">
									<MetroTextBox
										header="Product Identifier / Model Number"
										disabled={isiPhoneOSDevice}
										v-model={_deviceObj.product}
									/>
								</div>
								
								<div class="mb-4">
									<MetroComboBox
										header="Platform"
										items-source={{
											'win': this.$t('package_editor.info.platform.win'),
											'darwin': this.$t('package_editor.info.platform.darwin'),
											'iphoneos': this.$t('package_editor.info.platform.iphoneos')
										}}
										v-model={_deviceObj.platform}
										no-update={true}
										disabled={isiPhoneOSDevice}
									/>
								</div>
								
								<div class="mb-4">
									<MetroTextBox
										header="OS Version"
										v-model={_deviceObj.version}
									/>
								</div>
							</div>
							
							<div class="col col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBox
										header="UDID / Serial Number"
										v-model={_deviceObj.udid}
										disabled={true}
									/>
								</div>
								
								{isiPhoneOSDevice &&
								<div class="mb-4">
									<MetroComboBox
										header="Variant"
										items-source={deviceVariants}
										no-update={true}
										v-model={_deviceObj.variant}
									/>
								</div>
								}
								
								<div class="mb-4">
									<MetroTextBox
										header="Capacity (GB)"
										v-model={_deviceObj.capacity}
									/>
								</div>
							</div>
						</div>
					)
				},
				commands: [{ text: "Cancel" }, { text: "Update", primary: true }]
			});
			
			if (await deviceDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.updateDevice({
					"device.id": deviceObj.id
				}, _deviceObj);
				
				if (result.error) {
					console.error(result.error);
				} else {
					this.refresh()
				}
			}
		},
		async deviceDeleteButtonClicked(deviceObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: `Delete this device?`,
				content: `Are you sure you want to delete this device? This action cannot be undone.\n\nAssociated Reviews will also be deleted.`,
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.deleteDevice({
					"device.id": deviceObj.id
				});
				
				if (result.error) {
					console.error(result.error);
				} else {
					this.refresh();
				}
			}
		},
		async refresh() {
			this.deviceData = await DeviceAPI.getDevices();
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="devices"] {
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
				width: calc(~"(100% - (1 * 4px)) / 2");
				
				&:nth-child(2n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 641px) and (max-width:1007px) {
				width: calc(~"(100% - (3 * 4px)) / 4");
				
				&:nth-child(4n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1008px) {
				width: calc(~"(100% - (5 * 4px)) / 6");
				
				&:nth-child(6n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1366px) {
				width: calc(~"(100% - (7 * 4px)) / 8");
				
				&:nth-child(10n) {
					margin-right: 0;
				}
			}
			
			.device-container {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.device-description-container {
					flex: 1 0 auto;
					flex-basis: 0;
					overflow: hidden;
					padding: 8px;
					text-align: center;
					
					.device-artwork {
						width: 64px;
						height: 64px;
					}
				}
				
				.device-toolbar {
					padding: 0 2px 2px;
				}
			}
		}		
	}
}
</style>