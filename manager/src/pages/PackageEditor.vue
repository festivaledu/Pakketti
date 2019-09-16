<template>
	<MetroPage page-id="package-editor" @navigatedTo.native="onPageShow">
		<template slot="top-app-bar">
			<MetroCommandBar>
				<template slot="content">
					<MetroStackPanel vertical-alignment="center" style="height: 40px">
						<MetroProgressRing :active="isWorking.savePackage || isWorking.deletePackage" />
					</MetroStackPanel>
				</template>
				<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" />
				<MetroAppBarButton icon="save" :label="$t('app.actions.save')" :disabled="$v.$invalid || !$v.$anyDirty || isWorking.savePackage" @click="savePackage" />
			</MetroCommandBar>
		</template>
		
		<MetroPivot :title="$t('package_editor.pivot_title')">
			<MetroPivotItem :header="$t('package_editor.pivot_headers.info')">
				<div class="row">
					<div class="col-12 col-md-6">
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.package_name_title') }}</MetroTextBlock>
							<MetroTextBox
								:placeholder-text="$t('package_editor.info.package_name_placeholder')"
								:maxlength="50"
								v-model="packageData.name"
								@input="$v.packageData.name.$touch()"
								:disabled="!isOwnedPackage"
							/>
							<div class="row mt-2">
								<div class="col-6">
									<MetroHyperlinkButton v-if="!isWorking.packageName" :disabled="!packageData.name.length || !$v.packageData.name.$dirty || !isOwnedPackage" @click="checkNameAvailability">{{ $t('package_editor.info.button_check_availability') }}</MetroHyperlinkButton>
									<MetroProgressRing v-if="isWorking.packageName" :active="true" />
								</div>
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.name.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.bundle_identifier_title') }}</MetroTextBlock>
							<MetroTextBox
								:placeholder-text="$t('package_editor.info.bundle_identifier_placeholder')"
								:maxlength="50"
								:disabled="existingPackage || !isOwnedPackage"
								v-model="packageData.identifier"
								@input="$v.packageData.identifier.$touch()"
							/>
							<div class="row mt-2">
								<div class="col-6">
									<MetroHyperlinkButton :disabled="!packageData.identifier.length || existingPackage || !isOwnedPackage">{{ $t('package_editor.info.button_check_availability') }}</MetroHyperlinkButton>
								</div>
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.identifier.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.short_description_title') }}</MetroTextBlock>
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
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.detailed_description_title') }}</MetroTextBlock>
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
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.device_families_title') }}</MetroTextBlock>
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
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.platform_title') }}</MetroTextBlock>
							<MetroTextBlock>{{ $t('package_editor.info.platform_description') }}</MetroTextBlock>
							<MetroComboBox
								:placeholder-text="$t('package_editor.info.platform_placeholder')"
								:items-source="{
									'win': $t('package_editor.info.platform.win'),
									'darwin': $t('package_editor.info.platform.darwin'),
									'iphoneos': $t('package_editor.info.platform.iphoneos'),
									'debian': $t('package_editor.info.platform.debian'),
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
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.system_requirements_title') }}</MetroTextBlock>
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
						
						<div class="mb-4" v-if="packageData.status == 0">
							<MetroTextBlock text-style="sub-title">{{ $t('package_editor.info.publishing_title') }}</MetroTextBlock>
							<MetroRadioButton
								group-name="package-visibility"
								:name="true"
								:content="$t('package_editor.info.publishing_now')"
								v-model="packageData.visible"
								@input="$v.packageData.$touch()"
							/>
							<MetroRadioButton
								group-name="package-visibility"
								:name="false"
								:content="$t('package_editor.info.publishing_later')"
								v-model="packageData.visible"
								@input="$v.packageData.$touch()"
							/>
						</div>
					</div>
				</div>
			</MetroPivotItem>
			<MetroPivotItem :header="$t('package_editor.pivot_headers.media')">
				<MetroTextBlock text-style="sub-title">App Icon</MetroTextBlock>
				<div class="grid-view">
					<MediaSelector v-model="packageData.iconMime" />
				</div>
				
				<MetroTextBlock text-style="sub-title">Header Image</MetroTextBlock>
				<div class="grid-view">
					<MediaSelector v-model="packageData.packageHeaderMime" />
				</div>
			</MetroPivotItem>
			<MetroPivotItem :header="$t('package_editor.pivot_headers.versions')">
				<p>Versions</p>
			</MetroPivotItem>
			<MetroPivotItem :header="$t('package_editor.pivot_headers.reviews')" :disabled="true">
				<p>test 3</p>
			</MetroPivotItem>
		</MetroPivot>
	</MetroPage>
</template>

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
		}		
	}
}
</style>

<script>
import HtmlEntities from "he"
import { required } from 'vuelidate/lib/validators'

import { PackageAPI } from "@/scripts/ApiUtil"

import { VueEditor } from "vue2-editor"
import MediaSelector from "@/components/MediaSelector"

export default {
	name: "PackageEditor",
	components: {
		VueEditor,
		MediaSelector
	},
	data() {
		return {
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
		}
	},
	validations: {
		packageData: {
			name: { required },
			identifier: { required },
			shortDescription: { required },
			detailedDescription: { required },
			platform: { required },
			architecture: { required },
			// section: { required },
			deviceFamilies: { required },
		}
	},
	mounted() {
		// this._packageData = {...this.packageData};
	},
	methods: {
		onPageShow(event) {
			this.$parent.setHeader("");

			if (event.detail.packageData) {
				this.packageData = event.detail.packageData;
				this.existingPackage = true;
			} else {
				this.packageData = this._packageData;
				this.existingPackage = false;
			}
			
			this.$v.packageData.$reset();
		},
		async checkNameAvailability() {
			this.isWorking.packageName = true;
			
			let packageList = await PackageAPI.getPackages({
				"package.name": this.packageData.name
			});
			this.isWorking.packageName = false;
			
			if (packageList.length) {
				new metroUI.ContentDialog({
					title: "Package name unavailable",
					content: "The selected Package name is already in use. Please use a different Package name.",
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: "Package name is available",
					content: "The selected Package name is available for use.",
					commands: [{ text: "Ok", primary: true }]
				}).show();
			}
		},
		deviceFamilyCheckboxChecked(type) {
			this.packageData.deviceFamilies ^= type;
			this.$v.packageData.$touch();
		},
		async savePackage() {
			this.isWorking.savePackage = true;
			
			let result = await PackageAPI.updatePackage({
				"package.id": this.packageData.id
			}, Object.assign(this.packageData, {
				status: 1
			}));
		
			if (result.error) {
				console.error(result.error);
			} else {
				this.packageData = result;
			}
			
			this.isWorking.savePackage = false;
			this.$v.packageData.$reset();
		},
		decodeText(text) {
			return HtmlEntities.decode(text.replace(/<[^>]*>/g, ''));
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		isOwnedPackage() {
			return this.packageData.accountId == this.accountId;
		}
	}
}
</script>
