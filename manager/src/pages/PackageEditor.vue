<template>
	<MetroPage page-id="package-editor">
		<vue-headful :title="`${$t('package_editor.pivot_title')} - ${$t('app.name')}`" />
		
		<template slot="top-app-bar">
			<template slot="content">
				<MetroStackPanel vertical-alignment="center" style="height: 40px">
					<MetroProgressRing :active="true" />
				</MetroStackPanel>
			</template>
			<MetroCommandBar>
				<MetroAppBarButton
					icon="delete"
					:label="$t('app.actions.delete')"
					:disabled="isWorking.deletePackage || !isOwnedPackage"
					@click="deletePackage"
				/>
				<MetroAppBarButton
					icon="save"
					:label="$t('app.actions.save')"
					:disabled="$v.$invalid || !$v.$anyDirty || isWorking.savePackage || !isOwnedPackage"
					@click="savePackage"
				/>
			</MetroCommandBar>
		</template>
		
		<MetroPivot :title="$t('package_editor.pivot_title')">
			<MetroPivotItem :header="$t('package_editor.pivot_headers.info')">
				<div class="row">
					<div class="col-12 col-md-6">
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.package_name_title') }}</MetroTextBlock>
							
							<MetroTextBox
								:placeholder-text="$t('package_editor.info.package_name_placeholder')"
								:maxlength="50"
								v-model="packageData.name"
								@input="$v.packageData.name.$touch()"
								:disabled="!isOwnedPackage"
							/>
							
							<div class="row mt-2">
								<div class="col-6">
									<MetroHyperlinkButton 
										v-if="!isWorking.packageName"
										:disabled="!packageData.name.length || !$v.packageData.name.$dirty || !isOwnedPackage"
										@click="checkNameAvailability"
									>{{ $t('package_editor.info.button_check_availability') }}</MetroHyperlinkButton>
									<MetroProgressRing v-if="isWorking.packageName" :active="true" />
								</div>
								
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.name.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.bundle_identifier_title') }}</MetroTextBlock>
							
							<MetroTextBox
								:placeholder-text="$t('package_editor.info.bundle_identifier_placeholder')"
								:maxlength="50"
								:disabled="isExistingPackage"
								v-model="packageData.identifier"
							/>
							
							<div class="row mt-2">
								<div class="col-6" />
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.identifier.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.short_description_title') }}</MetroTextBlock>
							
							<MetroTextBox
								:textarea="true"
								:maxlength="255"
								v-model="packageData.shortDescription"
								@input="$v.packageData.shortDescription.$touch()"
								style="height: 158px"
								:disabled="!isOwnedPackage"
							/>
							
							<div class="row mt-2">
								<div class="col-12">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.shortDescription.length || 0 }} / 255</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.detailed_description_title') }}</MetroTextBlock>
							
							<VueEditor
								:editorToolbar="editorToolbar"
								v-model="packageData.detailedDescription"
								:disabled="!isOwnedPackage"
								@input="$v.packageData.detailedDescription.$touch()"
							/>
							
							<div class="row mt-2">
								<div class="col-12">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.detailedDescription.length }} / 3000</MetroTextBlock>
								</div>
							</div>
						</div>
					</div>
					
					<div class="col-12 col-md-6">
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.device_families_title') }}</MetroTextBlock>
							
							<MetroCheckbox
								:content="$t('package_editor.info.device_family.phone')"
								@input="deviceFamilyCheckboxChecked(1)"
								:value="Boolean(packageData.deviceFamilies & 1)"
								:disabled="!isOwnedPackage"
							/>
							<MetroCheckbox
								:content="$t('package_editor.info.device_family.tablet')"
								@input="deviceFamilyCheckboxChecked(2)"
								:value="Boolean(packageData.deviceFamilies & 2)"
								:disabled="!isOwnedPackage"
							/>
							<MetroCheckbox
								:content="$t('package_editor.info.device_family.desktop')"
								@input="deviceFamilyCheckboxChecked(4)"
								:value="Boolean(packageData.deviceFamilies & 4)"
								:disabled="!isOwnedPackage"
							/>
							<MetroCheckbox
								:content="$t('package_editor.info.device_family.tv')"
								@input="deviceFamilyCheckboxChecked(8)"
								:value="Boolean(packageData.deviceFamilies & 8)"
								:disabled="!isOwnedPackage"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.platform_title') }}</MetroTextBlock>
							<MetroTextBlock>{{ $t('package_editor.info.platform_description') }}</MetroTextBlock>
							
							<MetroComboBox
								:placeholder-text="$t('package_editor.info.platform_placeholder')"
								:items-source="{
									'win': $t('package_editor.info.platform.win'),
									'darwin': $t('package_editor.info.platform.darwin'),
									'iphoneos': $t('package_editor.info.platform.iphoneos'),
									'debian': $t('package_editor.info.platform.debian'),
									'other': $t('package_editor.info.platform.other'),
									'universal': $t('package_editor.info.platform.universal')
								}"
								v-model="packageData.platform"
								@input="$v.packageData.platform.$touch()"
								:disabled="!isOwnedPackage"
								style="margin-top: 8px"
							/>
							
							<MetroTextBlock style="margin-top: 8px">{{ $t('package_editor.info.architecture_description') }}</MetroTextBlock>
							
							<MetroComboBox
								:placeholder-text="$t('package_editor.info.architecture_placeholder')"
								:items-source="{
									'x86': $t('package_editor.info.architecture.x86'),
									'x86_64': $t('package_editor.info.architecture.x86_64'),
									[packageData.platform === 'iphoneos' ? 'iphoneos-arm' : 'arm']: $t('package_editor.info.architecture.arm'),
									'universal': $t('package_editor.info.architecture.universal')
								}"
								:disabled="!packageData.platform || !isOwnedPackage"
								v-model="packageData.architecture"
								@input="$v.packageData.architecture.$touch()"
								style="margin-top: 8px"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.section_title') }}</MetroTextBlock>
							<MetroTextBlock>{{ $t('package_editor.info.section_description') }}</MetroTextBlock>
							
							<MetroComboBox
								:placeholder-text="$t('package_editor.info.section_placeholder')"
								:items-source="{
									'Administration': $t('section.Administration'),
									'Apps': $t('section.Apps'),
									'Archiving': $t('section.Archiving'),
									'Development': $t('section.Development'),
									'Fonts': $t('section.Fonts'),
									'Networking': $t('section.Networking'),
									'Packaging': $t('section.Packaging'),
									'Security': $t('section.Security'),
									'System': $t('section.System'),
									'Tweaks': $t('section.Tweaks'),
									'Utilities': $t('section.Utilities'),
									'Wallpaper': $t('section.Wallpaper'),
								}"
								v-model="packageData.section"
								@input="$v.packageData.section.$touch()"
								:disabled="!isOwnedPackage || isExistingPackage"
								style="margin-top: 8px"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.support_title') }}</MetroTextBlock>
							
							<MetroTextBox
								:placeholder-text="$t('package_editor.info.support_placeholder')"
								:disabled="!isOwnedPackage"
								v-model="packageData.issueURL"
								@input="$v.packageData.$touch()"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.system_requirements_title') }}</MetroTextBlock>
							
							<MetroTextBox
								:header="$t('package_editor.info.system_requirements_min_os')"
								:placeholder-text="$t('package_editor.info.system_requirements_min_os')"
								:disabled="!isOwnedPackage"
								v-model="packageData.minOSVersion"
								@input="$v.packageData.$touch()"
							/>
							
							<MetroTextBox
								:header="$t('package_editor.info.system_requirements_max_os')"
								:placeholder-text="$t('package_editor.info.system_requirements_max_os')"
								:disabled="!isOwnedPackage"
								v-model="packageData.maxOSVersion"
								@input="$v.packageData.$touch()"
								style="margin-top: 8px"
							/>
						</div>
						
						<div class="mb-4">
							<template v-if="packageData.status == 0">
								<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.publishing_title') }}</MetroTextBlock>
								
								<MetroRadioButton
									group-name="package-visibility"
									:name="true"
									:content="$t('package_editor.info.package_publishing_now')"
									:disabled="!isOwnedPackage"
									v-model="packageData.visible"
									@input="$v.packageData.$touch()"
								/>
								
								<MetroRadioButton
									group-name="package-visibility"
									:name="false"
									:content="$t('package_editor.info.package_publishing_later')"
									:disabled="!isOwnedPackage"
									v-model="packageData.visible"
									@input="$v.packageData.$touch()"
								/>
							</template>
							
							<template v-else>
								<MetroTextBlock text-style="sub-title" class="mb-2">{{ $t('package_editor.info.visibility_title') }}</MetroTextBlock>
								
								<MetroRadioButton
									group-name="package-visibility"
									:name="true"
									:content="$t('package_editor.info.package_visibility_visible')"
									:disabled="!isOwnedPackage"
									v-model="packageData.visible"
									@input="$v.packageData.$touch()"
								/>
								
								<MetroRadioButton
									group-name="package-visibility"
									:name="false"
									:content="$t('package_editor.info.package_visibility_hidden')"
									:disabled="!isOwnedPackage"
									v-model="packageData.visible"
									@input="$v.packageData.$touch()"
								/>
							</template>
						</div>
					</div>
				</div>
			</MetroPivotItem>
			<MetroPivotItem :header="$t('package_editor.pivot_headers.media')">
				<div class="mb-4">
					<MetroTextBlock text-style="sub-title mb-2">{{ $t('package_editor.media.app_icon_title') }}</MetroTextBlock>
					<MediaItemSelector
						:defaultImgSrc="`/media/icon/${packageData.id}`"
						v-model="packageData.iconMime"
						@fileChanged="packageIconChanged"
						:disabled="!this.isOwnedPackage"
					/>
				</div>
				
				<div class="mb-4">
					<MetroTextBlock text-style="sub-title mb-2">{{ $t('package_editor.media.header_image_title') }}</MetroTextBlock>
					<MediaItemSelector
						:defaultImgSrc="`/media/hero/${packageData.id}`"
						v-model="packageData.headerImageMime"
						@fileChanged="packageHeaderChanged"
						:disabled="!this.isOwnedPackage"
					/>
				</div>
				
				<div class="mb-4">
					<MetroTextBlock text-style="sub-title mb-2">{{ $t('package_editor.media.screenshots_title') }}</MetroTextBlock>
					<MediaGroupSelector
						defaultImgSrc="/media/screenshot"
						v-model="packageData.screenshots"
						@fileChanged="screenshotAdded"
						@fileDeleted="screenshotDeleted"
						:disabled="!this.isOwnedPackage"
					/>
				</div>
			</MetroPivotItem>
			<MetroPivotItem :header="$t('package_editor.pivot_headers.versions')">
				<div class="data-grid package-version-list mb-4">
					<div class="data-grid-wrapper">
						<div class="table">
							<div class="column-headers-border" />
							<div class="tr column-headers">
								<div class="th column-header-item">{{ $t('packages.version') }}</div>
								<div class="th column-header-item">{{ $t('packages.downloads') }}</div>
								<div class="th column-header-item">{{ $t('packages.visible') }}</div>
								<div class="th column-header-item">{{ $t('packages.created') }}</div>
								<div class="th column-header-item align-right">{{ $t('packages.actions') }}</div>
							</div>
							<div class="row-wrapper" v-for="(versionObj, index) in packageData.versions" :key="index">
								<div class="tr row">
									<div class="td cell">
										<MetroTextBlock>{{ versionObj.version }}</MetroTextBlock>
										<MetroTextBlock text-style="caption">{{ $t(`package_editor.versions.package_type.${versionObj.packageType }`) }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ versionObj.downloadCount | number }}</MetroTextBlock>
									</div>
									<div class="td cell">
										<MetroToggleSwitch 
											:value="versionObj.visible"
											:offContent="$t('packages.visible_state.no')"
											:onContent="$t('packages.visible_state.yes')"
											:readonly="true"
										/>
									</div>
									<div class="td cell">
										<MetroTextBlock>{{ versionObj.createdAt | date }}</MetroTextBlock>
									</div>
									<div class="td cell align-right">
										<MetroButton @click="showVersionMenu($event, versionObj)">
											<MetroSymbolIcon icon="more" />
										</MetroButton>
									</div>
								</div>
								<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
							</div>
						</div>
					</div>
				</div>
				
				<MetroButton :disabled="!isOwnedPackage" @click="addVersion">{{ $t('package_editor.versions.add') }}</MetroButton>
			</MetroPivotItem>
		</MetroPivot>
	</MetroPage>
</template>

<script>
import HtmlEntities from "he"
import { required, minValue } from 'vuelidate/lib/validators'

import { PackageAPI } from "@/scripts/ApiUtil"

import { VueEditor } from "vue2-editor"
import MediaItemSelector from "@/components/MediaItemSelector"
import MediaGroupSelector from "@/components/MediaGroupSelector"
import FileSelector from "@/components/FileSelector"

import crypto from "crypto-js"

export default {
	name: "PackageEditor",
	components: {
		VueEditor,
		MediaItemSelector,
		MediaGroupSelector,
		FileSelector
	},
	data: () => ({
		editorToolbar: [
			['bold', 'italic', 'underline', 'strike'],
			['blockquote', 'code-block'],
			[{ 'list': 'ordered'}, { 'list': 'bullet' }],
			[{ 'script': 'sub'}, { 'script': 'super' }],
			[{ 'header': [false, 1, 2, 3, 4, 5, 6, ] }],
			[{'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'}],
			['link'],
		],
		_packageData: {},
		packageData: {
			name: "",
			identifier: "",
			shortDescription: "",
			detailedDescription: "",
			platform: null,
			architecture: null,
			// releaseVersion: "1.0",
			// releaseDescription: "Initial Release",
			// bugsReportURL: null,
			minOSVersion: null,
			maxOSVersion: null,
			section: null,
			deviceFamilies: 0,
			visible: true,
			issueURL: null
		},
		existingPackage: false,
		isWorking: {
			packageName: false,
			packageIdentifier: false,
			savePackage: false,
			deletePackage: false
		}
	}),
	validations: {
		packageData: {
			name: { required },
			identifier: { required },
			shortDescription: { required },
			detailedDescription: { required },
			platform: { required },
			architecture: { required },
			section: { required },
			deviceFamilies: { required, minValue: minValue(1) },
		}
	},
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			"package.identifier": to.params["packageId"],
			include: "reviews,screenshots,versions"
		});
		
		next(vm => {
			if (_packageData.length) {
				vm.packageData = _packageData[0];
			}
			
			vm.$nextTick(() => {
				setTimeout(() => {
					vm.$v.$reset();
				}, 50);
			});
			
			vm.$parent.setHeader(null);
			vm.$parent.setSelectedMenuItem("packages");
		});
	},
	async beforeRouteLeave(to, from, next) {
		if (this.$v.$anyDirty) {
			let confirmDialog = new metroUI.ContentDialog({
				title: this.$t('package_editor.unsaved_changes.title'),
				content: this.$t('package_editor.unsaved_changes.body'),
				commands: [
					{ text: this.$t('app.cancel') },
					{ text: this.$t('app.actions.dont_save'), secondary: true },
					{ text: this.$t('app.actions.save'), primary: true }]
			});
			
			switch (await confirmDialog.showAsync()) {
			case metroUI.ContentDialogResult.Primary:
				this.savePackage();
				next();
				break;
			case metroUI.ContentDialogResult.Secondary:
				next();
				break;
			case metroUI.ContentDialogResult.None:
				next(false);
				break;
			}
		} else {
			next();
		}
	},
	methods: {
		async refresh() {
			let _packageData = await PackageAPI.getPackages({
				"package.identifier": this.$route.params["packageId"],
				include: "reviews,screenshots,versions"
			});
			this.packageData = _packageData[0];
			
			this.$nextTick(() => {
				setTimeout(() => {
					this.$v.$reset();
				}, 50);
			});
		},
		async savePackage() {
			this.isWorking.savePackage = true;
			
			let result = await PackageAPI.updatePackage({
				"package.id": this.packageData.id
			}, Object.assign(this.packageData, {
				status: 1
			}));
		
			if (result.error) {
				new metroUI.ContentDialog({
					title: this.$t('app.operational_error_title'),
					content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
			} else {
				this.packageData = result;
			}
			
			this.isWorking.savePackage = false;
			this.$v.packageData.$reset();
		},
		async deletePackage() {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('packages.delete_package_confirm_title', { name: this.packageData.name }),
				content: this.$t('packages.delete_package_confirm_body', { name: this.packageData.name }),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await PackageAPI.deletePackage({
					"package.id": this.packageData.id
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				} else {
					this.$v.$reset();
					this.$router.replace("/packages");
				}
			}
		},
		
		async checkNameAvailability() {
			this.isWorking.packageName = true;
			
			let packageList = await PackageAPI.getPackages({
				"package.name": this.packageData.name
			});
			this.isWorking.packageName = false;
			
			if (packageList.length) {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.package_name_availability.unavailable_title'),
					content: this.$t('package_editor.info.package_name_availability.unavailable_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.package_name_availability.available_title'),
					content: this.$t('package_editor.info.package_name_availability.available_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			}
		},
		deviceFamilyCheckboxChecked(type) {
			this.packageData.deviceFamilies ^= type;
			this.$v.packageData.deviceFamilies.$touch();
		},
		
		async packageIconChanged(iconFile) {
			if (iconFile) {
				let result = await PackageAPI.updatePackageIcon({
					"package.id": this.packageData.id
				}, iconFile);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				}
			} else {
				let result = await PackageAPI.deletePackageIcon({
					"package.id": this.packageData.id
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				}
			}
		},
		async packageHeaderChanged(headerFile) {
			if (headerFile) {
				let result = await PackageAPI.updatePackageHero({
					"package.id": this.packageData.id
				}, headerFile);
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				}
			} else {
				let result = await PackageAPI.deletePackageHero({
					"package.id": this.packageData.id
				});
				
				if (result.error) {
					new metroUI.ContentDialog({
						title: this.$t('app.operational_error_title'),
						content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
						commands: [{ text: this.$t('app.ok'), primary: true }]
					}).show();
				}
			}
		},
		async screenshotAdded(file) {
			const reader = new FileReader();
			reader.onload = (progress) => {
				let img = new Image();
				img.onload = async () => {
					let screenshotList = await PackageAPI.createPackageScreenshots({
						"package.id": this.packageData.id
					}, [{
						screenClass: `${img.width}w-${img.height}h`,
						width: img.width,
						height: img.height,
						sha256: crypto.SHA256(file).toString(crypto.enc.hex)
					}]);
					
					if (screenshotList.error) {
						new metroUI.ContentDialog({
							title: this.$t('app.operational_error_title'),
							content: this.$t('app.operational_error_message', { code: screenshotList.error.code, name: screenshotList.error.name, message: screenshotList.error.message }),
							commands: [{ text: this.$t('app.ok'), primary: true }]
						}).show();
					} else {
						let result = await PackageAPI.uploadPackageScreenshots({
							"package.id": this.packageData.id
						}, {
							[screenshotList[0].id]: file
						});
						
						this.packageData.screenshots = this.packageData.screenshots.concat(screenshotList);
					}
				}
				
				img.src = reader.result;
			}
			
			reader.readAsDataURL(file);
		},
		async screenshotDeleted(screenshotObj) {
			this.packageData.screenshots.splice(this.packageData.screenshots.indexOf(screenshotObj), 1);
			
			let result = await PackageAPI.deletePackageScreenshot({
				"package.id": this.packageData.id,
				"screenshot.id": screenshotObj.id
			});
		},
		
		showVersionMenu(event, versionObj) {
			let packageFlyout = new metroUI.MenuFlyout({
				items: [{
					icon: "edit",
					text: this.$t('app.actions.edit'),
					action: () => this.editVersion(versionObj)
				}, {
					icon: "delete",
					text: this.$t('app.actions.delete'),
					disabled: this.packageData.versions.length <= 1,
					action: () => this.deleteVersion(versionObj)
				}]
			});
			
			packageFlyout.showAt(event.target);
		},
		async addVersion() {
			let _versionObj = {
				version: null,
				packageType: null,
				changeText: "Initial release",
				visible: false
			};
			
			let dialog = new metroUI.ContentDialog({
				title: this.$t('package_editor.versions.add'),
				content: () => (
					<div>
						<MetroTextBox
							header={this.$t('package_editor.versions.version_header')}
							placeholder-text={this.$t('package_editor.versions.version_placeholder')}
							v-model={_versionObj.version}
							required={true}
						/>
						
						<MetroComboBox
							header={this.$t('package_editor.versions.package_type.header')}
							placeholder-text={this.$t('package_editor.versions.package_type.placeholder')}
							items-source={{
								"full": this.$t('package_editor.versions.package_type.full'),
								"combo": this.$t('package_editor.versions.package_type.combo'),
								"delta": this.$t('package_editor.versions.package_type.delta')
							}}
							v-model={_versionObj.packageType}
							no-update={true}
							required={true}
							style="margin-top: 8px"
						/>
						
						<FileSelector class="my-4" content={this.$t('app.select_file')} v-model={_versionObj.file} required={true} />
						
						<div class="my-2">
							<MetroTextBlock style="margin-bottom: 4px">{this.$t('package_editor.versions.release_notes')}</MetroTextBlock>
							<VueEditor
								editorToolbar={this.editorToolbar}
								v-model={_versionObj.changeText}
								required={true}
							/>
						</div>
						
						<MetroTextBlock text-style="sub-title" class="mb-2">{this.$t('package_editor.info.publishing_title')}</MetroTextBlock>
						<MetroRadioButton
							group-name="version-visibility"
							name={true}
							content={this.$t('package_editor.info.version_publishing_now')}
							v-model={_versionObj.visible}
						/>
						
						<MetroRadioButton
							group-name="version-visibility"
							name={false}
							content={this.$t('package_editor.info.version_publishing_later')}
							v-model={_versionObj.visible}
						/>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.actions.save'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await PackageAPI.createPackageVersion({
					"package.id": this.packageData.id
				}, _versionObj);
				
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
		async editVersion(versionObj) {
			let _versionObj = {...versionObj};
			
			let dialog = new metroUI.ContentDialog({
				title: this.$t('package_editor.versions.edit'),
				content: () => (
					<div>
						<MetroTextBox
							header={this.$t('package_editor.versions.version_header')}
							placeholder-text={this.$t('package_editor.versions.version_placeholder')}
							v-model={_versionObj.version}
							disabled={true}
						/>
						
						<MetroComboBox
							header={this.$t('package_editor.versions.package_type.header')}
							placeholder-text={this.$t('package_editor.versions.package_type.placeholder')}
							items-source={{
								"full": this.$t('package_editor.versions.package_type.full'),
								"combo": this.$t('package_editor.versions.package_type.combo'),
								"delta": this.$t('package_editor.versions.package_type.delta')
							}}
							v-model={_versionObj.packageType}
							no-update={true}
							required={true}
							disabled={!this.isOwnedPackage}
							style="margin-top: 8px"
						/>
						
						<FileSelector
							content={this.$t('app.select_file')} 
							oninput={(file) => this._replaceVersionFile(versionObj, file)}
							disabled={!this.isOwnedPackage}
							class="my-4"
						/>
						
						<div class="my-2">
							<MetroTextBlock style="margin-bottom: 4px">{this.$t('package_editor.versions.release_notes')}</MetroTextBlock>
							<VueEditor
								editorToolbar={this.editorToolbar}
								v-model={_versionObj.changeText}
								required={true}
								disabled={!this.isOwnedPackage}
							/>
						</div>
						
						<MetroTextBlock text-style="sub-title" class="mb-2">{this.$t('package_editor.info.visibility_title')}</MetroTextBlock>
						<MetroRadioButton
							group-name="version-visibility"
							name={true}
							content={this.$t('package_editor.info.version_visibility_visible')}
							v-model={_versionObj.visible}
							disabled={!this.isOwnedPackage}
						/>
						
						<MetroRadioButton
							group-name="version-visibility"
							name={false}
							content={this.$t('package_editor.info.version_visibility_hidden')}
							v-model={_versionObj.visible}
							disabled={!this.isOwnedPackage}
						/>
					</div>
				),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.actions.save'), primary: true }]
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let result = await PackageAPI.updatePackageVersion({
					"package.id": this.packageData.id,
					"version.id": versionObj.id
				}, _versionObj);
				
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
		async deleteVersion(versionObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('packages.delete_version_confirm_title'),
				content: this.$t('packages.delete_version_confirm_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await PackageAPI.deletePackageVersion({
					"package.id": this.packageData.id,
					"version.id": versionObj.id
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
		
		async _replaceVersionFile(versionObj, file) {
			let result = await PackageAPI.updatePackageVersionFile({
				"package.id": versionObj.packageId,
				"version.id": versionObj.id
			}, file);
			
			if (result.error) {
				new metroUI.ContentDialog({
					title: this.$t('app.operational_error_title'),
					content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
			}
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		isOwnedPackage() {
			return this.packageData.accountId == this.accountId;
		},
		isExistingPackage() {
			return this.packageData.status == 1;
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
.page[data-page-id="package-editor"] {
	.title-content {
		text-transform: uppercase;
	}
	
	.page-content {
		padding: 0 !important;
	}
	
	.row {
		margin-left: -12px;
		margin-right: -12px;
	}
	
	.text-muted {
		color: var(--base-medium);
	}
	
	.combo-box {
		display: inline-block;
	}
	
	.grid-view {
		.grid-view-item {
			background-color: var(--list-low);
			
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
		}		
	}
	
	.data-grid {
		.row {
			.cell:not(:first-child) {
				color: var(--base-medium);
			}
		}
		
		&.package-version-list {
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

.quillWrapper {
	margin-bottom: 12px;
	
	.ql-snow {
		border: none !important;
		
		a {
			color: var(--system-accent-color);
		}
		
		.ql-tooltip {
			left: 8px !important;
			right: 8px !important;
			
			height: auto;
			line-height: 32px;
			background-color: var(--alt-high);
			border: none;
			box-shadow: inset 0 0 0 2px var(--chrome-disabled-low);
			color: var(--base-high);
			
			input[type="text"] {
				appearance: none;
				-webkit-appearance: none;
				-moz-appearance: none;
				outline: none;
				padding: 5px 8px 8px 12px;
				background-color: var(--alt-high); 
				border: none;
				box-shadow: inset 0 0 0 2px var(--chrome-disabled-low);
				border-radius: 0;
				resize: none;
				height: auto;
				font-size: inherit;
				
				&::placeholder {
					color: var(--base-medium);
				}
				
				&:hover:not(:focus) {
					box-shadow: inset 0 0 0 2px var(--base-medium-high);
				}
				
				&:not(:focus) {
					color: var(--base-high);
				}
				
				&:focus {
					background-color: #FFFFFF !important;
					box-shadow: inset 0 0 0 2px var(--system-accent-color);
					
					&::placeholder {
						color: var(--base-medium-low);
					}
				}
			}
			
			a {
				line-height: 32px;
			}
		}
	}
	
	.ql-toolbar {
		box-shadow: inset 0 2px 0 0 var(--chrome-disabled-low), inset 2px 0 0 0 var(--chrome-disabled-low), inset -2px 0 0 0 var(--chrome-disabled-low);
		padding: 2px 2px 0;
		
		.ql-formats {
			margin: 0;
			
			.ql-stroke {
				stroke: var(--chrome-disabled-low);
			}
			
			.ql-fill {
				fill: var(--chrome-disabled-low);
			}
			
			.ql-active {
				.ql-stroke {
					stroke: var(--system-accent-color);
				}
				
				.ql-fill {
					fill: var(--system-accent-color);
				}
			}
			
			button {
				width: 32px;
				height: 32px;
				margin: 0;
				padding: 5px;
			}
			
			.ql-picker {
				top: 0;
				height: 32px;
				line-height: 32px;
				outline: none;
				
				.ql-picker-label {
					border: none;
					color: var(--chrome-disabled-low);
					outline: none;
					
					&.ql-active {
						color: var(--system-accent-color);
					}
				}
				
				&.ql-expanded {
					.ql-picker-label {
						color: var(--system-accent-color);
					}
					
					.ql-stroke {
						stroke: var(--system-accent-color);
					}
					
					.ql-fill {
						fill: var(--system-accent-color);
					}
				}
				
				.ql-picker-options {
					background-color: var(--chrome-medium-low);
					box-shadow: 0 0 0 1px var(--chrome-high);
					border: none;
					padding: 4px 0;
					
					.ql-picker-item {
						padding: 0 12px;
						color: var(--base-high);
						outline: none;
						
						&:hover:not(:active) {
							background-color: var(--list-low);
						}
						
						&:active {
							background-color: var(--list-medium-low);
							transform: scale(0.98);
						}
						
						&.ql-selected {
							color: var(--base-high);
							background-color: var(--list-accent-low);
				
							&:hover:not(:active),
							&:active {
								background-color: var(--list-accent-medium);
							}
						}
					}
				}
			}
		}
	}
	
	.ql-editor {
		height: 366px;
		box-shadow: inset 0 0 0 2px var(--chrome-disabled-low);
		
		// &:hover:not(:focus) {
		// 	box-shadow: inset 0 0 0 2px var(--base-high);
		// }
		
		// &:focus {
		// 	box-shadow: inset 0 0 0 2px var(--system-accent-color);
		// 	background-color: #FFFFFF;
		// 	color: #000000;
		// }
		
		strong {
			&, & * {
				font-weight: 600;
			}
		}
		
		h1, h2, h3, h4, h5, h6 {
			& * {
				font-size: inherit;
			}
		}
		
		pre {
			font-family: "SF Mono", "Menlo", monospace;
			font-size: 12px;
		}
	}
}
</style>