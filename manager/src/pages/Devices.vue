<template>
	<MetroPage page-id="devices">
		<vue-headful :title="`${$t('root.item_devices')} - ${$t('app.name')}`" />
		
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="add" :label="$t('app.actions.add')" @click.native="deviceAddButtonClicked" />
			</MetroCommandBar>
		</template>
		
		<template v-if="deviceData && !deviceData.length">
			<MetroTextBlock>{{ $t('dashboard.devices_no_items') }}</MetroTextBlock>
		</template>
		
		<template v-if="deviceData && deviceData.length">
			<div class="grid-view">
				<div class="grid-view-item" v-for="(deviceObj) in deviceData" :key="deviceObj.id">
					<div class="device-container">
						<div class="device-description-container">
							<img class="device-artwork" v-if="deviceObj.variant"/>
							<MetroTextBlock text-style="base">{{ deviceObj.name || $t('devices.unnamed_device') }}</MetroTextBlock>
							
							<MetroTextBlock v-if="deviceObj.platform == 'iphoneos'">{{ DeviceStrings[deviceObj.product] || $t('devices.unknown_product') }}</MetroTextBlock>
							<MetroTextBlock v-else>{{ deviceObj.product }}</MetroTextBlock>
							
							<MetroTextBlock>{{ Platforms.platforms[deviceObj.platform] ? $t(`package_editor.info.platform.${deviceObj.platform}`) : $t('devices.unknown_platform') }} {{ deviceObj.version }}</MetroTextBlock>
						</div>
						
						<MetroStackPanel orientation="horizontal" class="device-toolbar">
							<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="deviceDeleteButtonClicked(deviceObj)" />
							<MetroAppBarButton icon="edit" :label="$t('app.actions.edit')" @click="deviceEditButtonClicked(deviceObj)" />
						</MetroStackPanel>
					</div>
				</div>
			</div>
		</template>
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
			
			if (to.params.deviceId && _deviceData.find(deviceObj => deviceObj.id == to.params.deviceId)) {
				vm.deviceEditButtonClicked(_deviceData.find(deviceObj => deviceObj.id == to.params.deviceId));
			}
			
			vm.$parent.setHeader(vm.$t('root.item_devices'));
			vm.$parent.setSelectedMenuItem("devices");
		});
	},
	methods: {
		deviceAddButtonClicked(e) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "add",
					text: this.$t('devices.add_device'),
					action: this.addDevice
				}, {
					icon: "add",
					text: this.$t('devices.add_device_iphoneos'),
					action: this.addiOSDevice
				}]
			});
			
			flyout.showAt(e.target);
		},
		async addDevice() {
			let _deviceObj = {};
			
			let deviceDialog = new metroUI.ContentDialog({
				title: this.$t('devices.edit_device.add_title'),
				content: () => (
					<div class="row">
						<div class="col col-12 col-md-6">
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.device_name_header')}
									placeholder-text={this.$t('devices.edit_device.optional')}
									v-model={_deviceObj.name}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.product_header')}
									placeholder-text={this.$t('devices.edit_device.product_placeholder')}
									v-model={_deviceObj.product}
									required={true}
								/>
							</div>
							
							<div class="mb-4">
								<MetroComboBox
									header={this.$t('package_editor.info.platform_title')}
									placeholder-text={this.$t('package_editor.info.platform_placeholder')}
									items-source={{
										'win': this.$t('package_editor.info.platform.win'),
										'darwin': this.$t('package_editor.info.platform.darwin'),
										'iphoneos': this.$t('package_editor.info.platform.iphoneos'),
										'other': this.$t('package_editor.info.platform.other')
									}}
									v-model={_deviceObj.platform}
									no-update={true}
									required={true}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.os_header')}
									placeholder-text={this.$t('devices.edit_device.os_placeholder')}
									v-model={_deviceObj.version}
									required={true}
								/>
							</div>
						</div>
						
						<div class="col col-12 col-md-6">
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.udid_header')}
									placeholder-text={this.$t('devices.edit_device.required')}
									v-model={_deviceObj.udid}
									required={true}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.capacity_header')}
									placeholder-text={this.$t('devices.edit_device.optional')}
									v-model={_deviceObj.capacity}
								/>
							</div>
						</div>
					</div>
				),
				commands: [{ text: "Cancel" }, { text: "Link", primary: true }]
			});
			
			if (await deviceDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.createDevice(_deviceObj);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					this.refresh()
				}
			}
		},
		addiOSDevice() {
			window.location.href = `/api/link`
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
				title: this.$t('devices.edit_device.edit_title'),
				content: () => (
					<div class="row">
						<div class="col col-12 col-md-6">
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.device_name_header')}
									placeholder-text={this.$t('devices.edit_device.optional')}
									v-model={_deviceObj.name}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.product_header')}
									placeholder-text={this.$t('devices.edit_device.product_placeholder')}
									v-model={_deviceObj.product}
									disabled={isiPhoneOSDevice}
								/>
							</div>
							
							<div class="mb-4">
								<MetroComboBox
									header={this.$t('package_editor.info.platform_title')}
									placeholder-text={this.$t('package_editor.info.platform_placeholder')}
									items-source={{
										'win': this.$t('package_editor.info.platform.win'),
										'darwin': this.$t('package_editor.info.platform.darwin'),
										'iphoneos': this.$t('package_editor.info.platform.iphoneos'),
										'other': this.$t('package_editor.info.platform.other')
									}}
									v-model={_deviceObj.platform}
									no-update={true}
									disabled={isiPhoneOSDevice}
								/>
							</div>
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.os_header')}
									placeholder-text={this.$t('devices.edit_device.os_placeholder')}
									v-model={_deviceObj.version}
									required={true}
								/>
							</div>
						</div>
						
						<div class="col col-12 col-md-6">
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.udid_header')}
									placeholder-text={this.$t('devices.edit_device.required')}
									v-model={_deviceObj.udid}
									disabled={isiPhoneOSDevice}
								/>
							</div>
							
							{isiPhoneOSDevice &&
							<div class="mb-4">
								<MetroComboBox
									header={this.$t('devices.edit_device.variant_header')}
									placeholder-text={this.$t('devices.edit_device.variant_placeholder')}
									items-source={deviceVariants}
									no-update={true}
									v-model={_deviceObj.variant}
								/>
							</div>
							}
							
							<div class="mb-4">
								<MetroTextBox
									header={this.$t('devices.edit_device.capacity_header')}
									placeholder-text={this.$t('devices.edit_device.optional')}
									v-model={_deviceObj.capacity}
								/>
							</div>
						</div>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.actions.save'), primary: true }]
			});
			
			if (await deviceDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.updateDevice({
					"device.id": deviceObj.id
				}, _deviceObj);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					this.refresh()
				}
			}
			
			if (this.$route.params.deviceId) {
				this.$router.replace(`/${this.$route.path.split("/")[1]}`);
			}
		},
		async deviceDeleteButtonClicked(deviceObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('devices.delete_device_confirm_title', { name: deviceObj.name || this.$t('devices.unnamed_device') }),
				content: this.$t('devices.delete_device_confirm_body', { name: deviceObj.name || this.$t('devices.unnamed_device') }),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await DeviceAPI.deleteDevice({
					"device.id": deviceObj.id
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
				width: 100%;
				margin-right: 0;
				
				&::before {
					content: '';
					display: block;
					padding-top: 75%;
				}
			}
			
			@media all and (min-width: 641px) and (max-width:1007px) {
				width: calc(~"(100% - (3 * 4px)) / 4");
				
				&:nth-child(4n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1008px) and (max-width: 1365px) {
				width: calc(~"(100% - (3 * 4px)) / 4");
				
				&:nth-child(4n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1366px) and (max-width: 1919px) {
				width: calc(~"(100% - (5 * 4px)) / 6");
				
				&:nth-child(6n) {
					margin-right: 0;
				}
			}
			
			@media all and (min-width: 1920px) {
				width: calc(~"(100% - (7 * 4px)) / 8");
				
				&:nth-child(8n) {
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