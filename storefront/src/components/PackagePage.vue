<template>
	<MetroPage page-id="package" @navigatedTo.native="onNavigatedTo" ref="page">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<section class="package-header-section">
				<div class="package-header">
					<div class="hero-image-container" v-if="packageData.headerImageMime">
						<div class="hero-image" :style="`background-image: url(http://localhost:3000/media/hero/${packageData.id})`" />
					</div>
					
					<div class="package-header-content">
						<div class="icon-container">
							<img :src="`http://localhost:3000/media/icon/${packageData.id}`" v-if="packageData.iconMime" />
							<MetroTextBlock class="contrast-text" style="position: relative; width: 32px; height: 32px" v-if="!packageData.iconMime">
								<MetroFontIcon glyph="&#xE739;" font-size="32px" style="position: absolute" />
								<MetroFontIcon glyph="&#xE894;" font-size="32px" style="position: absolute" />
							</MetroTextBlock>
						</div>
						
						<div class="package-description-group">
							<p class="package-name">{{ packageData.name }}</p>
							
							<MetroStackPanel class="package-link-container" orientation="horizontal" horizontal-alignment="left">
								<MetroHyperlinkButton>
									<MetroTextBlock text-style="base">Developer</MetroTextBlock>
								</MetroHyperlinkButton>
								
								<MetroTextBlock text-style="base" style="padding: 0 8px;">&bull;</MetroTextBlock>
								
								<MetroHyperlinkButton>
									<MetroTextBlock text-style="base">{{ packageData.section }}</MetroTextBlock>
								</MetroHyperlinkButton>
							</MetroStackPanel>
							
							<CurrentRating :rating-data="packageData.ratings" />
							
							<MetroStackPanel class="package-description-container" orientation="vertical" horizontal-alignment="left">
								<MetroTextBlock style="margin-top: 6px">
									<span v-html="packageData.detailedDescription.match(/.*?(?=\n|$)/g)[0]" />
								</MetroTextBlock>
								<MetroHyperlinkButton style="margin-top: 6px" @click="packageDescriptionMoreClicked" v-if="packageData.detailedDescription.match(/.*?(?=\n|$)/g).length > 2">
									<MetroTextBlock text-style="base">More</MetroTextBlock>
								</MetroHyperlinkButton>
							</MetroStackPanel>
						</div>
						
						<MetroStackPanel class="button-container">
							<MetroTextBlock text-style="title">Free</MetroTextBlock>
							<MetroButton class="system-accent-color">
								<MetroTextBlock text-style="base" text-alignment="center">Download</MetroTextBlock>
							</MetroButton>
						</MetroStackPanel>
						
						<MetroStackPanel class="package-description-container secondary-description-container" orientation="vertical" horizontal-alignment="left">
							<MetroTextBlock style="margin-top: 6px">
								<span v-html="packageData.detailedDescription.match(/.*?(?=\n|$)/g)[0]" />
							</MetroTextBlock>
							<MetroHyperlinkButton style="margin-top: 6px" @click="packageDescriptionMoreClicked" v-if="packageData.detailedDescription.match(/.*?(?=\n|$)/g).length > 2">
								<MetroTextBlock text-style="base">More</MetroTextBlock>
							</MetroHyperlinkButton>
						</MetroStackPanel>
					</div>
				</div>
			</section>
			
			<MetroPivot>
				<MetroPivotItem header="Overview">
					<section v-if="packageData.deviceFamilies">
						<MetroTextBlock text-style="sub-title">Available on</MetroTextBlock>
						
						<MetroStackPanel class="compatibility-container" orientation="horizontal" horizontal-alignment="left">
							<DeviceCompatibility glyph="&#xE8EA;" label="Phone" v-if="packageData.deviceFamilies & 1" />
							<DeviceCompatibility glyph="&#xE70A;" label="Tablet" v-if="packageData.deviceFamilies & 2" />
							<DeviceCompatibility glyph="&#xE977;" label="Desktop" v-if="packageData.deviceFamilies & 4" />
							<DeviceCompatibility glyph="&#xE7F4;" label="TV" v-if="packageData.deviceFamilies & 8" />
						</MetroStackPanel>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title">Description</MetroTextBlock>
						<ExpandableText>
							<span v-html="packageData.detailedDescription.replace(/\n/g, '<br />')" />
						</ExpandableText>
					</section>
					
					<section v-if="packageData.screenshots && packageData.screenshots.length">
						<MetroTextBlock text-style="sub-title">Screenshots</MetroTextBlock>
						
						<div class="screenshot-wrapper">
							<div class="screenshot-container" v-for="(screenshotObj, index) in packageData.screenshots" :key="index">
								<img :src="`http://localhost:3000/media/screenshot/${screenshotObj.id}`" />
							</div>
						</div>
					</section>
					
					<section v-if="packageData.versions.length > 1">
						<MetroTextBlock text-style="sub-title">What's new in this version</MetroTextBlock>
						
						<ExpandableText>
							<span v-html="packageData.versions[0].changeText.replace(/\n/g, '<br />')" />
						</ExpandableText>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title">Additional information</MetroTextBlock>
						
						<div class="row info-group">
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">Published by</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">Developer</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
								
								<div class="info-item">
									<MetroTextBlock text-style="base">Release date</MetroTextBlock>
									<MetroTextBlock>{{ packageData.createdAt | date }}</MetroTextBlock>
								</div>
								
								<div class="info-item" v-if="packageData.versions.length">
									<MetroTextBlock text-style="base">Approximate size</MetroTextBlock>
									<MetroTextBlock>{{ packageData.versions[0].installedSize * 1024 | filesize }}</MetroTextBlock>
								</div>
							</div>
							
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">Category</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">{{ packageData.section }}</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
								
								<div class="info-item">
									<MetroTextBlock text-style="base">Publisher Info</MetroTextBlock>
									<MetroTextBlock>N/A</MetroTextBlock>
								</div>
								
								<div class="info-item">
									<MetroTextBlock text-style="base">Report an issue</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">Report an issue with this Package</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
							
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">Report this Package</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">Report this Package to Team FESTIVAL</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
						</div>
					</section>
				</MetroPivotItem>
				
				<MetroPivotItem header="System Requirements">
					<div class="row">
						<div class="col-12 col-lg-6">
							<MetroTextBlock text-style="base">Minimum</MetroTextBlock>
							<MetroTextBlock>Your device must meet all minimum requirements to use this product</MetroTextBlock>
							
							<table class="system-requirements">
								<tr>
									<td>OS</td>
									<td>N/A</td>
								</tr>
								<tr>
									<td>Platform</td>
									<td>N/A</td>
								</tr>
								<tr>
									<td>Architecture</td>
									<td>N/A</td>
								</tr>
							</table>
						</div>
						
						<div class="col-12 col-lg-6">
							<template v-if="packageData.versions.length && Object.keys(packageData.versions[0].depends).length">
								<MetroTextBlock text-style="base">Dependencies</MetroTextBlock>
								<MetroTextBlock>These additional Packages are required for this Package to work correctly</MetroTextBlock>
								
								<table class="system-requirements">
									<tr v-for="(key, index) in Object.keys(packageData.versions[0].depends)" :key="index">
										<td>{{ key }}</td>
										<td v-if="typeof packageData.versions[0].depends[key] === 'string'">{{ packageData.versions[0].depends[key] }}</td>
									</tr>
								</table>
							</template>

							<template v-if="packageData.versions.length && Object.keys(packageData.versions[0].conflicts).length">
								<MetroTextBlock text-style="base">Conflicts</MetroTextBlock>
								<MetroTextBlock>These Packages prevent this Package from working correctly</MetroTextBlock>
								
								<table class="system-requirements">
									<tr>
										<td>OS</td>
										<td>N/A</td>
									</tr>
									<tr v-for="(key, index) in Object.keys(packageData.versions[0].conflicts)" :key="index">
										<td>{{ key }}</td>
										<td v-if="typeof packageData.versions[0].conflicts[key] === 'string'">{{ packageData.versions[0].conflicts[key] }}</td>
									</tr>
								</table>
							</template>
						</div>
					</div>
				</MetroPivotItem>
				
				<MetroPivotItem header="Version History">
					<img src="https://media2.giphy.com/media/5wWf7GMbT1ZUGTDdTqM/200.gif?cid=790b761185b1721340b768c41bc77b639b9fadb8e47aa643&rid=200.gif" />
				</MetroPivotItem>
				
				<MetroPivotItem header="Reviews">
					<DetailedRating :rating-data="packageData.ratings" />
				</MetroPivotItem>
			</MetroPivot>
		</template>
	</MetroPage>
</template>

<style lang="less">
.page[data-page-id="package"] {
	.page-content {
		padding-top: 0 !important;
	}
	
	.package-header-section {
		.package-header {
			position: relative;
			
			.hero-image-container {
				margin: -40px -12px 0;
				
				@media all and (min-width: 641px) and (max-width: 1007px) {
					margin: -48px -24px 0;
				}
				
				@media all and (min-width: 1008px) {
					margin: -48px -48px 0;
					
					& + .package-header-content {
						margin-top: -160px;
					}
				}
				
				.hero-image {
					background-size: cover;
					background-position: center;
					width: 100%;
					max-width: 1920px;
					margin: 0 auto;
					
					&:before {
						content: '';
						display: block;
						
						@media all and (max-width: 640px) {
							padding-top: 56.25%;
						}
						
						@media all and (min-width: 641px) {
							padding-top: 50%;
						}
					}
				}
			}
			
			.package-header-content {
				position: relative;
				display: flex;
				width: 100%;
				max-width: 1600px;
				margin: 40px auto 0;
				padding: 24px;
				background-color: var(--package-header-background);
				box-shadow: 0 5px 17px 0px rgba(0,0,0,0.6);
				border-radius: 2px;
				
				.icon-container {
					display: flex ;
					justify-content: center ;
					align-items: center;
					width: 200px;
					height: 200px;
					background-color: var(--system-accent-color);
					
					img {
						width: 100%;
						height: 100%;
					}
				}
				
				.package-description-group {
					flex: 1;
					padding: 0 24px;
					
					.package-name {
						font-size: 34px;
						font-weight: 600;
					}
				}
				
				.button-container {
					& > .text-block {
						font-weight: 600;
					}
					
					button.system-accent-color {
						width: 232px;
						padding: 12px 0;
						margin-top: 12px;
					}
				}
				
				& > .package-description-container {
					display: none;
				}
				
				@media all and (max-width: 640px) {
					display: block;
					margin: 0;
					padding: 0 12px;
					background-color: var(--store-background);
					box-shadow: none;
					border-radius: 0;
					
					.icon-container {
						width: 120px;
						height: 120px;
						margin: 0 auto -20px;
						transform: translate3d(0, -50%, 0);
					}
					
					.package-description-group {
						padding: 0;
						
						.package-name {
							font-size: 28px;
						}
						
						.package-description-container {
							display: none;
						}
					}
					
					.button-container {
						position: relative;
						padding: 24px 0;
						
						&:after {
							content: '';
							position: absolute;
							left: -24px;
							right: -24px;
							bottom: 0;
							height: 1px;
							background-color: var(--base-low);
						}
						
						& > .text-block {
							font-size: 20px;
						}
						
						button.system-accent-color {
							width: 100%;
							margin-top: 24px;
						}
					}
					
					& > .package-description-container {
						display: block;
						padding: 24px 0;
					}
				}
				
				@media all and (min-width: 641px) and (max-width: 1007px) {
					display: block;
					margin: 0;
					padding: 0 16px;
					background-color: var(--store-background);
					box-shadow: none;
					border-radius: 0;
					
					.icon-container {
						width: 150px;
						height: 150px;
						margin: 0 auto -35px;
						transform: translate3d(0, -50%, 0);
					}
					
					.package-description-group {
						padding: 0;
						
						.package-name {
							font-size: 28px;
						}
						
						.package-description-container {
							display: none;
						}
					}
					
					.button-container {
						position: relative;
						padding: 24px 0;
						
						&:after {
							content: '';
							position: absolute;
							left: -40px;
							right: -40px;
							bottom: 0;
							height: 1px;
							background-color: var(--base-low);
						}
						
						& > .text-block {
							font-size: 20px;
						}
						
						button.system-accent-color {
							margin-top: 24px;
						}
					}
					
					& > .package-description-container {
						display: block;
						padding: 24px 0;
					}
				}
			}
		}
	}
	
	.pivot {
		max-width: 1600px;
		margin: 48px auto 0;
		overflow: visible;
		
		@media all and (max-width: 1007px) {
			margin-top: 24px;
		}
		
		.pivot-header {
			position: sticky;
			top: 40px;
			background-color: var(--store-background);
			z-index: 5;
			
			@media all and (max-width: 1007px) {
				top: 0;
			}
			
			.header-clipper {
				overflow-y: scroll;
				
				.pivot-header-item {
					&:first-child {
						margin-left: auto;
					}
					
					&:last-child {
						margin-right: auto;
					}
					
					.text-block {
						font-size: 14px;
						font-weight: 600;
					}
				}
			}
		}
		
		.pivot-item {
			@media all and (max-width: 640px) {
				min-height: calc(~"100vh - (40px + 48px + 12px)");
				padding: 12px 36px;
			}
			
			@media all and (min-width: 641px) and (max-width: 1007px) {
				min-height: calc(~"100vh - (40px + 48px + 24px)");
				padding: 12px 36px;
			}
			
			@media all and (min-width: 1008px) {
				min-height: calc(~"100vh - (40px + 48px + 48px)");
			}
		}
		
		section {
			& > .text-block.sub-title {
				margin-bottom: 16px;
				font-weight: 600;
			}
			
			&:not(:last-of-type) {
				margin-bottom: 56px;
			}
			
			@media all and (max-width: 1007px) {
				margin-top: 32px;
				
				&:not(:last-of-type) {
					margin-bottom: 56px;
				}
			}
		}
	}
	
	.compatibility-container {
		flex-wrap: wrap;
		margin-bottom: -12px;
	}
	
	.expandable-text {
		@media all and (min-width: 1008px) {
			max-width: 700px;
		}
	}
	
	.screenshot-wrapper {
		display: flex;
		width: 100%;
		height: 187px;
		margin-top: 18px;
		white-space: nowrap;
		overflow-y: auto;
		
		@media all and (max-width: 1007px) {
			height: 124px;
		}
		
		.screenshot-container {
			position: relative;
			flex: 0 0 auto; 
			height: 100%;
			overflow: hidden;
			
			&:not(:last-child) {
				margin-right: 18px;
			}
			
			img {
				display: block ;
				max-width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}
	}
	
	.info-group {
		margin: 0;
		
		.info-column {
			padding: 0;
			
			@media all and (max-width: 991px) {
				&:not(:last-child) {
					margin-bottom: 48px;
				}
			}
			
			@media all and (min-width: 768px) {
				padding-right: 12px;
			}
			
			.info-item:not(:last-child) {
				margin-bottom: 48px;
			}
		}
	}
	
	table.system-requirements {
		width: 100%;
		border-spacing: 0;
		border-top: 1px solid var(--base-medium-low);
		margin-top: 12px;
		margin-bottom: 48px;
		
		tr {
			td {
				border-bottom: 1px solid var(--base-low);
				padding: 12px 0;
			
				&:nth-child(1) {
					padding-right: 32px;
				}
				&:nth-child(2) {
					width: 100%;
				}
			}
		}
	}
	
	.detailed-rating-container {
		.detailed-rating-wrapper {
			margin-top: 64px;
		}
	}
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import CurrentRating from '@/components/CurrentRatingComponent'
import DetailedRating from '@/components/DetailedRatingComponent'
import DeviceCompatibility from '@/components/DeviceCompatibilityComponent'
import ExpandableText from '@/components/ExpandableTextComponent'

export default {
	name: "PackagePage",
	components: {
		CurrentRating,
		DetailedRating,
		DeviceCompatibility,
		ExpandableText
	},
	data() {
		return {
			packageData: null
		}
	},
	methods: {
		async onNavigatedTo(event) {
			this.$refs["page"].$el.scrollTop = 0;
			
			this.packageData = null;
			let _packageData = await PackageAPI.getPackages({
				"package.identifier": event.detail.packageId,
				include: "ratings,reviews,screenshots,versions"
			});
			
			if (_packageData.error) {
				console.error(_packageData.error);
			} else {
				window.packageData = _packageData[0];
				this.packageData = _packageData[0];
			}
		},
		packageDescriptionMoreClicked() {
			new metroUI.ContentDialog({
				content: (() => {
					return (
						<div>
							<MetroTextBlock text-style="title" style="font-weight: 600; margin-bottom: 8px">{packageData.name}</MetroTextBlock>
							<MetroTextBlock >
								<span domPropsInnerHTML={packageData.detailedDescription.replace(/\n/g, "<br />")} />
							</MetroTextBlock>
						</div>
					);
				})(),
				commands: [{
					text: "Close",
					primary: true
				}]
			}).show();
		}
	},
	filters: {
		date(value) {
			return new Date(value).toLocaleDateString();
		},
		dateTime(value) {
			return new Date(value).toLocaleString();
		},
		time(value) {
			return new Date(value).toLocaleTimeString();
		},
		filesize(size) {
			if (isNaN(size)) { size = 0 }
			if (size < 1024) { return size + ' B' }
			if ((size /= 1024) < 1024) { return size.toFixed(0) + ' KB' }
			if ((size /= 1024) < 1024) { return size.toFixed(2) + ' MB' }
		}
	}
}
</script>