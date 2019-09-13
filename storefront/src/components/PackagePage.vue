<template>
	<MetroPage page-id="package" @navigatedTo.native="onNavigatedTo" ref="page">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData">
			<div class="package-header">
				<div class="hero-image-container" v-if="packageData.headerImageMime">
					<div class="hero-image" :style="`background-image: url(http://localhost:3000/media/hero/${packageData.id})`" />
				</div>
				
				<div class="package-description-container">
					<MetroStackPanel orientation="horizontal" horizontal-alignment="stretch">
						<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" class="icon-container">
							<img :src="`http://localhost:3000/media/icon/${packageData.id}`" v-if="packageData.iconMime" />
							<MetroTextBlock class="contrast-text" style="position: relative; width: 32px; height: 32px" v-if="!packageData.iconMime">
								<MetroFontIcon glyph="&#xE739;" font-size="32px" style="position: absolute" />
								<MetroFontIcon glyph="&#xE894;" font-size="32px" style="position: absolute" />
							</MetroTextBlock>
						</MetroStackPanel>
						
						<div style="flex: 1; padding: 0 24px">
							<MetroTextBlock text-style="sub-header" style="font-weight: 600" :text="packageData.name" />
							
							<MetroStackPanel orientation="horizontal" horizontal-alignment="left">
								<MetroHyperlinkButton>
									<MetroTextBlock text-style="base">Developer</MetroTextBlock>
								</MetroHyperlinkButton>
								
								<MetroTextBlock text-style="base" style="padding: 0 8px;">&bull;</MetroTextBlock>
								
								<MetroHyperlinkButton>
									<MetroTextBlock text-style="base">{{ packageData.section }}</MetroTextBlock>
								</MetroHyperlinkButton>
							</MetroStackPanel>
							
							<CurrentRating :rating-data="packageData.ratings" />
							
							<MetroTextBlock style="margin-top: 6px">
								<span v-html="packageData.detailedDescription.match(/.*?(?=\n|$)/g)[0]" />
							</MetroTextBlock>
							<MetroHyperlinkButton style="margin-top: 6px" @click="packageDescriptionMoreClicked" v-if="packageData.detailedDescription.match(/.*?(?=\n|$)/g).length > 2">
								<MetroTextBlock text-style="base">More</MetroTextBlock>
							</MetroHyperlinkButton>
						</div>
						
						<MetroStackPanel>
							<MetroTextBlock text-style="title" style="font-weight: 600">Free</MetroTextBlock>
							<MetroButton class="system-accent-color" style="width: 232px; padding-top: 12px; padding-bottom: 12px; margin-top: 12px;">
								<MetroTextBlock text-style="base" text-alignment="center">Download</MetroTextBlock>
							</MetroButton>
						</MetroStackPanel>
					</MetroStackPanel>
				</div>
			</div>
			
			<MetroPivot>
				<MetroPivotItem header="Overview">
					<section v-if="packageData.deviceFamilies">
						<MetroTextBlock text-style="sub-title" style="font-weight: 600">Available on</MetroTextBlock>
						
						<MetroStackPanel orientation="horizontal" horizontal-alignment="left">
							<DeviceCompatibility glyph="&#xE8EA;" label="Phone" v-if="packageData.deviceFamilies & 1" />
							<DeviceCompatibility glyph="&#xE70A;" label="Tablet" v-if="packageData.deviceFamilies & 2" />
							<DeviceCompatibility glyph="&#xE977;" label="Desktop" v-if="packageData.deviceFamilies & 4" />
							<DeviceCompatibility glyph="&#xE7F4;" label="TV" v-if="packageData.deviceFamilies & 8" />
						</MetroStackPanel>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title" style="font-weight: 600">Description</MetroTextBlock>
						<ExpandableText>
							<span v-html="packageData.detailedDescription.replace(/\n/g, '<br />')" />
						</ExpandableText>
					</section>
					
					<section v-if="packageData.screenshots && packageData.screenshots.length">
						<MetroTextBlock text-style="sub-title" style="font-weight: 600">Screenshots</MetroTextBlock>
						
						<div class="screenshot-wrapper">
							<div class="screenshot-container" v-for="(screenshotObj, index) in packageData.screenshots" :key="index">
								<img :src="`http://localhost:3000/media/screenshot/${screenshotObj.id}`" />
							</div>
						</div>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title" style="font-weight: 600">Additional information</MetroTextBlock>
						
						<div class="row">
							<div class="col col-12 col-md-3">
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
							
							<div class="col col-12 col-md-3">
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
								
								<div class="info-item" v-if="packageData.issueURL">
									<MetroTextBlock text-style="base">Report issue</MetroTextBlock>
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">Report an issue with this product</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
							
							<div class="col col-12 col-md-3">
								<div class="info-item">
									<MetroHyperlinkButton>
										<MetroTextBlock text-style="base">Report this product</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
						</div>
					</section>
				</MetroPivotItem>
				
				<MetroPivotItem header="System Requirements">
					<img src="https://media2.giphy.com/media/5wWf7GMbT1ZUGTDdTqM/200.gif?cid=790b761185b1721340b768c41bc77b639b9fadb8e47aa643&rid=200.gif" />
				</MetroPivotItem>
				
				<MetroPivotItem header="Version History">
					<img src="https://media2.giphy.com/media/5wWf7GMbT1ZUGTDdTqM/200.gif?cid=790b761185b1721340b768c41bc77b639b9fadb8e47aa643&rid=200.gif" />
				</MetroPivotItem>
				
				<MetroPivotItem header="Reviews">
					<img src="https://media2.giphy.com/media/5wWf7GMbT1ZUGTDdTqM/200.gif?cid=790b761185b1721340b768c41bc77b639b9fadb8e47aa643&rid=200.gif" />
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
	
	.package-header {
		position: relative;
		
		.hero-image-container {
			margin: 0 -12px;
			
			@media all and (min-width: 641px) and (max-width: 1007px) {
				margin: -48px -24px 0;
			}
			
			@media all and (min-width: 1008px) {
				margin: -48px -48px 0;
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
			
			& + .package-description-container {
				margin-top: -160px;
			}
		}
		
		.package-description-container {
			position: relative;
			margin: 40px auto 0;;
			width: 100%;
			max-width: 1600px;
			padding: 24px;
			background-color: var(--package-header-background);
			box-shadow: 0 5px 17px 0px rgba(0,0,0,0.6);
			border-radius: 2px;
			
			.icon-container {
				width: 200px;
				height: 200px;
				background-color: var(--system-accent-color);
				
				img {
					width: 100%;
					height: 100%;
				}
			}
			
			.current-rating + .text-block {
				margin-top: 0 !important;
			}
		}
	}
	
	.pivot {
		max-width: 1600px;
		margin: 48px auto 0;
		overflow: visible;
		
		.pivot-header {
			position: sticky;
			top: 40px;
			background-color: var(--store-background);
			z-index: 5;
			
			.header-clipper {
				justify-content: center;
				
				.pivot-header-item .text-block {
					font-size: 14px;
					font-weight: 600;
				}
			}
		}
		
		.pivot-item {
			@media all and (max-width: 640px) {
				min-height: calc(~"100vh - (40px + 48px + 12px)");
			}
			
			@media all and (min-width: 641px) and (max-width: 1007px) {
				min-height: calc(~"100vh - (40px + 48px + 24px)");
			}
			
			@media all and (min-width: 1008px) {
				min-height: calc(~"100vh - (40px + 48px + 48px)");
			}
		}
	}
	
	section {
		& > .text-block.sub-title {
			margin-bottom: 16px;
		}
		
		&:not(:last-of-type) {
			margin-bottom: 56px;
		}
	}
	
	.screenshot-wrapper {
		display: flex;
		width: 100%;
		height: 187px;
		margin-top: 18px;
		white-space: nowrap;
		overflow-y: auto;
		
		@media all and (max-width: 768px) {
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
	
	.row {
		margin: 0;
		
		.col {
			padding: 0;
		}
	}
	
	.info-item {
		& + .info-item {
			margin-top: 48px;
		}
	}
}
</style>

<script>
import { PackageAPI } from '@/scripts/ApiUtil'

import CurrentRating from '@/components/CurrentRatingComponent'
import DeviceCompatibility from '@/components/DeviceCompatibilityComponent'
import ExpandableText from '@/components/ExpandableTextComponent'

export default {
	name: "PackagePage",
	components: {
		CurrentRating,
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