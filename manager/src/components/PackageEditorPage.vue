<template>
	<MetroPage page-id="package-editor" @navigatedTo.native="onPageShow">
		<template slot="top-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="delete" label="Delete" />
				<MetroAppBarButton icon="save" label="Save" />
			</MetroCommandBar>
		</template>
		
		<MetroPivot title="PACKAGE EDITOR">
			<MetroPivotItem header="Info">
				<div class="row">
					<div class="col-12 col-md-6">
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Package Name</MetroTextBlock>
							<MetroTextBox
								placeholder-text="Example Package"
								:maxlength="50"
								v-model="packageData.name"
							/>
							<div class="row mt-2">
								<div class="col-6">
									<MetroHyperlinkButton :disabled="!packageData.name.length">Check availability</MetroHyperlinkButton>
								</div>
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.name.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Bundle Identifier</MetroTextBlock>
							<MetroTextBox
								placeholder-text="com.example.package"
								:maxlength="50"
								v-model="packageData.identifier"
							/>
							<div class="row mt-2">
								<div class="col-6">
									<MetroHyperlinkButton :disabled="!packageData.identifier.length">Check availability</MetroHyperlinkButton>
								</div>
								<div class="col-6">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.identifier.length }} / 50</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Short Description</MetroTextBlock>
							<MetroTextBox
								:textarea="true"
								:maxlength="255"
								v-model="packageData.shortDescription"
								style="height: 158px"
							/>
							<div class="row mt-2">
								<div class="col-12">
									<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.shortDescription.length }} / 255</MetroTextBlock>
								</div>
							</div>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Description</MetroTextBlock>
							<VueEditor
								:editorToolbar="editorToolbar"
								v-model="packageData.detailedDescription"
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
							<MetroTextBlock text-style="sub-title">Device Families</MetroTextBlock>
							<MetroCheckbox content="Phone" />
							<MetroCheckbox content="Tablet" />
							<MetroCheckbox content="Desktop" />
							<MetroCheckbox content="TV" />
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Platform</MetroTextBlock>
							<MetroTextBlock>Select the platform your package will be available for.</MetroTextBlock>
							<MetroComboBox
								placeholder-text="Select a platform"
								:items-source="{'win': 'Windows', 'darwin': 'macOS', 'iphoneos': 'iOS', 'debian': 'Linux (Debian/Ubuntu)', 'universal': 'Universal'}"
								v-model="packageData.platform"
								style="margin-top: 8px"
							/>
							
							<MetroTextBlock style="margin-top: 8px">Select the architecture your package was built for.</MetroTextBlock>
							<MetroComboBox
								placeholder-text="Select an architecture"
								:items-source="{'x86': 'x86 32-bit', 'x86_64': 'x86 64-bit', [packageData.platform === 'iphoneos' ? 'iphoneos-arm' : 'arm']: 'ARM', 'universal': 'Universal'}"
								:disabled="!packageData.platform"
								v-model="packageData.architecture"
								style="margin-top: 8px"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">System Requirements</MetroTextBlock>
							<MetroTextBox
								placeholder-text="Minimum required OS"
								v-model="packageData.minOSVersion"
							/>
							<MetroTextBox
								placeholder-text="Maximum supported OS"
								v-model="packageData.maxOSVersion"
								style="margin-top: 8px"
							/>
						</div>
						
						<div class="mb-4">
							<MetroTextBlock text-style="sub-title">Publishing Options</MetroTextBlock>
							<MetroRadioButton
								group-name="package-visibility"
								:name="true"
								content="Publish this package immediately"
								v-model="packageData.visible"
							/>
							<MetroRadioButton
								group-name="package-visibility"
								:name="false"
								content="Publish this package manually"
								v-model="packageData.visible"
							/>
						</div>
					</div>
				</div>
			</MetroPivotItem>
			<MetroPivotItem header="Screenshots">
				<div class="grid-view">
					<div class="grid-view-item add-button">
						<div class="grid-view-item-content" />
					</div>
				</div>
			</MetroPivotItem>
			<MetroPivotItem header="Versions">
				<p>Versions</p>
			</MetroPivotItem>
			<MetroPivotItem header="Reviews" :disabled="true">
				<p>test 3</p>
			</MetroPivotItem>
		</MetroPivot>
	</MetroPage>
</template>

<style lang="less">
.page[data-page-id="package-editor"] {
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
			
			&::before {
				content: '';
				display: block;
				padding-top: 100%;
			}
			
			&.add-button {
				.grid-view-item-content {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					pointer-events: none;
					padding: 0;
					
					&:after {
						content: "\E710";
						font-family: "Segoe MDL2 Assets";
						font-size: 48px;
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate3d(-50%, -50%, 0);
					}
				}
			}
		}		
	}
}
</style>

<script>
import { VueEditor } from "vue2-editor"
import HtmlEntities from "he"

export default {
	name: "PackageEditor",
	components: {
		VueEditor
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
				visible: true,
			}
		}
	},
	methods: {
		onPageShow(event) {
			this.$parent.setHeader("");
			console.log(event.detail);
		},
		decodeText(text) {
			return HtmlEntities.decode(text.replace(/<[^>]*>/g, ''));
		}
	}
}
</script>
