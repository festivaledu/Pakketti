<template>
	<div class="page no-padding" data-page-id="package-editor">
		<metro-pivot>
			<template slot="title">
				<div class="pivot-title"><span>PACKAGE EDITOR</span></div>
			</template>
			
			<template slot="header-items">
				<div class="pivot-header-item" data-pivot-item="info">Info</div>
				<div class="pivot-header-item" data-pivot-item="screenshots">Screenshots</div>
				<div class="pivot-header-item" data-pivot-item="versions">Versions</div>
				<div class="pivot-header-item disabled" data-pivot-item="reviews">Reviews</div>
			</template>
			
			<template slot="items">
				<div class="pivot-item" data-pivot-item="info">
					<div class="row">
						<div class="col-12 col-md-6">
							<div class="mb-4">
								<h4>Package Name</h4>
								<input type="text" placeholder="Example Package" v-model="packageData.name" maxlength="50" autocomplete="off">
								<div class="row">
									<div class="col-6 align-left">
										<a href="#" :disabled="!packageData.name.length">Check availability</a>
									</div>
									<div class="col-6 align-right">
										<p class="text-muted align-right mb-0">{{ packageData.name.length }} / 50</p>
									</div>
								</div>
							</div>

							<div class="mb-4">
								<h4>Bundle Identifier</h4>
								<input type="text" placeholder="com.example.package" v-model="packageData.identifier" maxlength="50" autocomplete="off">
								
								<div class="row">
									<div class="col-6 align-left">
										<a href="#" :disabled="!packageData.identifier.length">Check availability</a>
									</div>
									<div class="col-6 align-right">
										<p class="text-muted align-right mb-0">{{ packageData.identifier.length }} / 50</p>
									</div>
								</div>
							</div>
						
							<div class="mb-4">
								<h4>Short Description</h4>
								<textarea v-model="packageData.shortDescription" maxlength="255" autocomplete="off" style="height: 158px" />
								<p class="text-muted align-right mb-4">{{ packageData.shortDescription.length }} / 255</p>
							</div>
						
							<div class="mb-4">
								<h4>Description</h4>
								<VueEditor :editorToolbar="editorToolbar" v-model="packageData.detailedDescription" />
								
								<div class="row">
									<div class="col-6 align-left">
										<!-- <a href="#">What's this?</a> -->
									</div>
									<div class="col-6 align-right">
										<p class="text-muted align-right mb-0">{{ decodeText(packageData.detailedDescription).length }} / 3000</p>
									</div>
								</div>
							</div>
						</div>
						
						<div class="col-12 col-md-6">
							<div class="mb-4">
							<h4>Device Families</h4>
								<div class="control-group">
									<metro-checkbox>Phone</metro-checkbox>
									<metro-checkbox>Tablet</metro-checkbox>
									<metro-checkbox>Desktop</metro-checkbox>
									<metro-checkbox>TV</metro-checkbox>
								</div>
							</div>
							
							<div class="mb-4">
								<h4>Platform</h4>
								<p>Select the platform your package will be available for.</p>
								<metro-combo-box v-model="packageData.platform">
									<select>
										<option disabled selected>Select a platform</option>
										<option>Windows</option>
										<option>macOS</option>
										<option>iOS (Cydia)</option>
										<option>Linux (Debian)</option>
										<option>Universal</option>
									</select>
								</metro-combo-box>
								
								<p>Select the architecture your package was built for.</p>
								<metro-combo-box v-model="packageData.architecture" :disabled="!packageData.platform">
									<select>
										<option disabled selected>Select an architecture</option>
										<option>x86 32 bit</option>
										<option>x86 64 bit</option>
										<option>ARM</option>
										<option>Universal</option>
									</select>
								</metro-combo-box>
							</div>
							
							<div class="mb-4">
								<h4>System Requirements</h4>
								<input type="text" placeholder="Minimum required OS" v-model="packageData.minOSVersion" autocomplete="off">
								<input type="text" placeholder="Maximum supported OS" v-model="packageData.maxOSVersion" autocomplete="off">
							</div>
							
							<h4>Publishing Options</h4>
							<div class="control-group">
								<div class="radio">
									<input type="radio" id="packageVisibilityOn" name="visible" :value="true" v-model="packageData.visible">
									<label for="packageVisibilityOn">
										<p class="item-label">Publish this package immediately</p>
									</label>
								</div>
								<div class="radio">
									<input type="radio" id="packageVisibilityOff" name="visible" :value="false" v-model="packageData.visible">
									<label for="packageVisibilityOff">
										<p class="item-label">Publish this package manually</p>
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="pivot-item" data-pivot-item="screenshots">
					<div class="grid-view">
						<!-- <div class="grid-item" v-for="(index) in Array(20)" :key="index">
							<div class="item-inner">
								<p class="item-title">GridView Item {{ index + 1 }}</p>
								<p class="item-subtitle">This is an example description</p>
							</div>
						</div> -->
						<div class="grid-item add-button">
							<div class="item-inner" />
						</div>
					</div>
				</div>
				<div class="pivot-item" data-pivot-item="versions">Versions</div>
				<div class="pivot-item" data-pivot-item="reviews">Reviews</div>
			</template>
		</metro-pivot>
	</div>
</template>

<style lang="less">
.page[data-page-id="package-editor"] {
	input[type="email"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="text"], input[type="url"], textarea {
		max-width: initial;
		margin-right: 0;
	}
	
	.row {
		margin-left: -12px;
		margin-right: -12px;
	}
	
	.control-group {
		.checkbox, .radio {
			display: flex;
			
			label {
				flex: 1;
			}
		}
	}
	
	.text-muted {
		color: var(--base-medium);
	}
	
	.quillWrapper {
		margin-bottom: 12px;
		
		.ql-snow {
			border: none !important;
		}
		
		.ql-toolbar {
			box-shadow: inset 0 2px 0 0 var(--chrome-disabled-low), inset 2px 0 0 0 var(--chrome-disabled-low), inset -2px 0 0 0 var(--chrome-disabled-low);
			padding: 2px 2px 0;
			
			.ql-formats {
				margin: 0;
				
				button {
					width: 32px;
					height: 32px;
					margin: 0;
					padding: 5px;
					
					.ql-stroke {
						stroke: var(--chrome-disabled-low);
					}
					
					.ql-fill {
						fill: var(--chrome-disabled-low);
					}
					
					&.ql-active {
						.ql-stroke {
							stroke: var(--system-accent-color);
						}
						
						.ql-fill {
							fill: var(--system-accent-color);
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
		margin: 0;
		
		.grid-item {
			background-color: var(--list-low);
			padding: 0;
			// height: 240px;
			
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

			.item-inner {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				padding: 8px;

				.item-title {
					font-weight: 600;
				}
			}
			
			&.add-button {
				.item-inner {
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
		decodeText(text) {
			return HtmlEntities.decode(text.replace(/<[^>]*>/g, ''));
		}
	}
}
</script>
