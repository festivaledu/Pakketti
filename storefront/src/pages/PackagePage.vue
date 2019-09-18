<template>
	<MetroPage page-id="package" ref="page">
		<template v-if="!packageData">
			<MetroProgressRing :active="true" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); width: 80px; height: 80px" />
		</template>
		
		<template v-if="packageData && !Object.keys(packageData).length">
			<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" style="height: calc(100vh - 64px)">
				<MetroTextBlock text-style="title" text-alignment="center" style="font-size: 34px; font-weight: 500">
					{{ $t('app.generic_error_title') }}
				</MetroTextBlock>
				<MetroTextBlock text-style="sub-title" text-alignment="center">
					{{ $t('app.generic_error_message') }}
				</MetroTextBlock>
			</MetroStackPanel>
		</template>
		
		<template v-if="packageData && developerData">
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
								<router-link :to="`/developer/${developerData.username}`" class="hyperlink-button">
									<MetroTextBlock text-style="base">{{ developerData.username }}</MetroTextBlock>
								</router-link>
								
								<MetroTextBlock text-style="base" style="padding: 0 8px;">&bull;</MetroTextBlock>
								
								<router-link :to="`/section/${packageData.section}`" class="hyperlink-button">
									<MetroTextBlock text-style="base">{{ packageData.section }}</MetroTextBlock>
								</router-link>
							</MetroStackPanel>
							
							<CurrentRating :rating-data="packageData.ratings" />
							
							<MetroStackPanel class="package-description-container" orientation="vertical" horizontal-alignment="left">
								<MetroTextBlock style="margin-top: 6px">
									<span v-html="packageData.detailedDescription.match(/.*?(?=\n|$)/g)[0]" />
								</MetroTextBlock>
								<MetroHyperlinkButton style="margin-top: 6px" @click="packageDescriptionMoreClicked" v-if="packageData.detailedDescription.match(/.*?(?=\n|$)/g).length > 2">
									<MetroTextBlock text-style="base">{{ $t('package.more_button') }}</MetroTextBlock>
								</MetroHyperlinkButton>
							</MetroStackPanel>
						</div>
						
						<MetroStackPanel class="button-container">
							<MetroTextBlock text-style="title">{{ $t('package.price_free') }}</MetroTextBlock>
								<MetroButton class="system-accent-color" @click="downloadButtonClicked">
									<MetroTextBlock text-style="base" text-alignment="center">{{ $t('package.download_button') }}</MetroTextBlock>
								</MetroButton>
						</MetroStackPanel>
						
						<MetroStackPanel class="package-description-container secondary-description-container" orientation="vertical" horizontal-alignment="left">
							<MetroTextBlock style="margin-top: 6px">
								<span v-html="packageData.detailedDescription.match(/.*?(?=\n|$)/g)[0]" />
							</MetroTextBlock>
							<MetroHyperlinkButton style="margin-top: 6px" @click="packageDescriptionMoreClicked" v-if="packageData.detailedDescription.match(/.*?(?=\n|$)/g).length > 2">
								<MetroTextBlock text-style="base">{{ $t('package.more_button') }}</MetroTextBlock>
							</MetroHyperlinkButton>
						</MetroStackPanel>
					</div>
				</div>
			</section>
			
			<MetroPivot>
				<MetroPivotItem :header="$t('package.pivot_titles.overview')">
					<section v-if="packageData.deviceFamilies">
						<MetroTextBlock text-style="sub-title">{{ $t('package.available_on.title') }}</MetroTextBlock>
						
						<MetroStackPanel class="compatibility-container" orientation="horizontal" horizontal-alignment="left">
							<DeviceCompatibilityItem glyph="&#xE8EA;" :label="$t('package.available_on.phone')" v-if="packageData.deviceFamilies & 1" />
							<DeviceCompatibilityItem glyph="&#xE70A;" :label="$t('package.available_on.tablet')" v-if="packageData.deviceFamilies & 2" />
							<DeviceCompatibilityItem glyph="&#xE977;" :label="$t('package.available_on.desktop')" v-if="packageData.deviceFamilies & 4" />
							<DeviceCompatibilityItem glyph="&#xE7F4;" :label="$t('package.available_on.tv')" v-if="packageData.deviceFamilies & 8" />
						</MetroStackPanel>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title">{{ $t('package.description_title') }}</MetroTextBlock>
						<ExpandableText>
							<span v-html="packageData.detailedDescription.replace(/\n/g, '<br />')" />
						</ExpandableText>
					</section>
					
					<section v-if="packageData.screenshots && packageData.screenshots.length">
						<MetroTextBlock text-style="sub-title">{{ $t('package.screenshots_title') }}</MetroTextBlock>
						
						<div class="screenshot-wrapper">
							<div class="screenshot-container" v-for="(screenshotObj, index) in packageData.screenshots" :key="index" @click="screenshotClicked(screenshotObj)">
								<img :src="`http://localhost:3000/media/screenshot/${screenshotObj.id}`" />
							</div>
						</div>
					</section>
					
					<section v-if="packageData.versions.length > 1">
						<MetroTextBlock text-style="sub-title">{{ $t('package.whats_new_title') }}</MetroTextBlock>
						
						<ExpandableText>
							<span v-html="packageData.versions[0].changeText.replace(/\n/g, '<br />')" />
						</ExpandableText>
					</section>
					
					<section>
						<MetroTextBlock text-style="sub-title">{{ $t('package.additional_info.title') }}</MetroTextBlock>
						
						<div class="row info-group">
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.published_by') }}</MetroTextBlock>
									<router-link :to="`/developer/${developerData.username}`" class="hyperlink-button">
										<MetroTextBlock text-style="base">{{ developerData.username }}</MetroTextBlock>
									</router-link>
								</div>
								
								<div class="info-item">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.release_date') }}</MetroTextBlock>
									<MetroTextBlock>{{ packageData.createdAt | date }}</MetroTextBlock>
								</div>
								
								<div class="info-item" v-if="packageData.versions.length">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.approximate_size') }}</MetroTextBlock>
									<MetroTextBlock>{{ packageData.versions[0].installedSize * 1024 | filesize }}</MetroTextBlock>
								</div>
							</div>
							
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.category') }}</MetroTextBlock>
									<router-link :to="`/section/${packageData.section}`" class="hyperlink-button">
										<MetroTextBlock text-style="base">{{ packageData.section }}</MetroTextBlock>
									</router-link>
								</div>
								
								<div class="info-item" v-if="packageData.issueURL">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.report_issue_title') }}</MetroTextBlock>
									<a class="hyperlink-button" :href="packageData.issueURL" target="_blank">
										<MetroTextBlock text-style="base">{{ $t('package.additional_info.report_issue_link') }}</MetroTextBlock>
									</a>
								</div>
							</div>
							
							<div class="col col-12 col-md-6 col-lg-3 info-column">
								<div class="info-item">
									<MetroTextBlock text-style="base">{{ $t('package.additional_info.report_package_title') }}</MetroTextBlock>
									<MetroHyperlinkButton @click="reportPackageButtonClicked">
										<MetroTextBlock text-style="base">{{ $t('package.additional_info.report_package_link') }}</MetroTextBlock>
									</MetroHyperlinkButton>
								</div>
							</div>
						</div>
					</section>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('package.pivot_titles.system_requirements')">
					<div class="row">
						<div class="col-12 col-lg-6">
							<MetroTextBlock text-style="base">{{ $t('package.system_requirements.minimum_title') }}</MetroTextBlock>
							<MetroTextBlock>{{ $t('package.system_requirements.minimum_description') }}</MetroTextBlock>
							
							<table class="system-requirements">
								<tr v-if="packageData.minOSVersion">
									<td>{{ $t('package.system_requirements.os') }}</td>
									<td>{{ Platforms.platforms[packageData.platform] }} {{ packageData.minOSVersion }} {{ $t('package.system_requirements.os_or_higher') }}</td>
								</tr>
								<tr>
									<td>{{ $t('package.system_requirements.platform') }}</td>
									<td>{{ Platforms.platforms[packageData.platform] }}</td>
								</tr>
								<tr>
									<td>{{ $t('package.system_requirements.architecture') }}</td>
									<td>{{ Platforms.architectures[packageData.architecture] }}</td>
								</tr>
							</table>
						</div>
						
						<div class="col-12 col-lg-6">
							<template v-if="packageData.versions.length && Object.keys(packageData.versions[0].depends).length">
								<MetroTextBlock text-style="base">{{ $t('package.system_requirements.dependencies_title') }}</MetroTextBlock>
								<MetroTextBlock>{{ $t('package.system_requirements.dependencies_description') }}</MetroTextBlock>
								
								<table class="system-requirements">
									<tr v-for="(key, index) in Object.keys(packageData.versions[0].depends)" :key="index">
										<td>{{ key }}</td>
										<td v-if="typeof packageData.versions[0].depends[key] === 'string'">{{ packageData.versions[0].depends[key] }}</td>
										<td v-if="typeof packageData.versions[0].depends[key] !== 'string'">{{ $t('package.system_requirements.dependencies_required') }}</td>
									</tr>
								</table>
							</template>

							<template v-if="packageData.versions.length && Object.keys(packageData.versions[0].conflicts).length">
								<MetroTextBlock text-style="base">{{ $t('package.system_requirements.conflicts_title') }}</MetroTextBlock>
								<MetroTextBlock>{{ $t('package.system_requirements.conflicts_description') }}</MetroTextBlock>
								
								<table class="system-requirements">
									<tr v-if="packageData.maxOSVersion">
										<td>{{ $t('package.system_requirements.conflicts_max_os') }}</td>
										<td>{{ Platforms.platforms[packageData.platform] }} {{ packageData.maxOSVersion }}</td>
									</tr>
									<tr v-for="(key, index) in Object.keys(packageData.versions[0].conflicts)" :key="index">
										<td>{{ key }}</td>
										<td v-if="typeof packageData.versions[0].conflicts[key] === 'string'">{{ packageData.versions[0].conflicts[key] }}</td>
										<td v-if="typeof packageData.versions[0].conflicts[key] !== 'string'">{{ $t('package.system_requirements.dependencies_required') }}</td>
									</tr>
								</table>
							</template>
						</div>
					</div>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('package.pivot_titles.version_history')" :disabled="packageData.versions.length <= 1">
					<div class="version-history-container">
						<div class="version-history-item" v-for="(versionObj, index) in packageData.versions" :key="index">
							<MetroStackPanel orientation="horizontal" vertical-orientation="center">
								<MetroTextBlock text-style="sub-title">{{ $t('package.version_history.version') }} {{ versionObj.version }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ versionObj.createdAt | date }}</MetroTextBlock>
							</MetroStackPanel>
							
							<ExpandableText>
								<span v-html="versionObj.changeText.replace(/\n/g, '<br />')" />
							</ExpandableText>
						</div>
					</div>
				</MetroPivotItem>
				
				<MetroPivotItem :header="$t('package.pivot_titles.reviews')">
					<template v-if="!packageData.ratings || !packageData.ratings.length">
						<MetroTextBlock>{{ $t('package.reviews.no_reviews') }}</MetroTextBlock>
						
						<MetroButton class="system-accent-color" style="margin: 16px 0 40px" @click="reviewButtonClicked" :disabled="accountId && accountId === packageData.accountId || !packageData.versions.length">{{ $t('package.reviews.rate_and_review') }}</MetroButton>
					</template>
					
					<template v-if="packageData.ratings && packageData.ratings.length">
						<DetailedRatingCell :rating-data="packageData.ratings" />
						
						<div style="margin-bottom: 24px">
							<MetroButton class="system-accent-color" style="margin-bottom: 16px" @click="reviewButtonClicked" :disabled="accountId && (accountId === packageData.accountId || packageData.reviews.filter(_ => _.accountId === accountId).length >= 1) || !packageData.versions.length">{{ $t('package.reviews.rate_and_review') }}</MetroButton>
							<MetroTextBlock v-if="accountId && accountId === packageData.accountId">{{ $t('package.reviews.review_prohibited_developer') }}</MetroTextBlock>
							<MetroTextBlock v-if="accountId && packageData.reviews.filter(_ => _.accountId === accountId).length >= 1">{{ $t('package.reviews.review_prohibited_again') }}</MetroTextBlock>
						</div>
						
						<MetroTextBlock text-style="sub-title">{{ $t('package.reviews.showing_reviews', { reviewCount: packageData.reviews.length }) }}</MetroTextBlock>
						<div class="review-container">
							<ReviewCell v-for="(reviewObj, index) in packageData.reviews" :review-data="reviewObj" :key="index" />
						</div>
					</template>
				</MetroPivotItem>
			</MetroPivot>
		</template>
	</MetroPage>
</template>

<script>
import { AccountAPI, PackageAPI, RequestAPI } from '@/scripts/ApiUtil'
import { LogItemType } from '@/scripts/Enumerations'
import Platforms from '../../../platforms.json'

import CurrentRating from '@/components/CurrentRating'
import DetailedRatingCell from '@/components/DetailedRatingCell'
import DeviceCompatibilityItem from '@/components/DeviceCompatibilityItem'
import ExpandableText from '@/components/ExpandableText'
import ReviewCell from '@/components/ReviewCell'

export default {
	name: "PackagePage",
	components: {
		CurrentRating,
		DetailedRatingCell,
		DeviceCompatibilityItem,
		ExpandableText,
		ReviewCell
	},
	data: () => ({
		packageData: null,
		developerData: null,
		Platforms: Platforms
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages({
			"package.identifier": to.params.packageId,
			include: "ratings,reviews,screenshots,versions"
		});
		
		let _developerData = (!Object.keys(_packageData[0]).length || _packageData[0].error) ? null : await AccountAPI.getUser({
			"account.id": _packageData[0].accountId
		});
		
		next(vm => {
			if (!_packageData.length || _packageData.error) {
				vm.packageData = {};
			} else {
				window.packageData = _packageData[0];
				vm.packageData = _packageData[0];
			}
			
			vm.developerData = _developerData;
			
			// vm.$parent.setHeader(vm.$t('root.header.start'));
			// vm.$parent.setSelectedMenuItem("start");
		});
	},
	methods: {
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
					text: this.$t('app.close'),
					primary: true
				}]
			}).show();
		},
		downloadButtonClicked() {
			window.location.href = this.packageData.versions.lastObject().filename;
		},
		screenshotClicked(screenshotObj) {
			let initialIndex = this.packageData.screenshots.indexOf(screenshotObj);
			
			new metroUI.ContentDialog({
				content: (dialog) => {
					console.log(dialog);
					return (
						<div class="screenshot-viewer">
							<MetroStackPanel orientation="horizontal" class="screenshot-viewer-chrome">
								<MetroTextBlock>{this.$t('package.screenshots_title')}</MetroTextBlock>
								<MetroButton onclick={() => dialog.hide.apply(dialog)}>
									<MetroSymbolIcon symbol="cancel" />
								</MetroButton>
							</MetroStackPanel>
							<MetroFlipView initial-index={initialIndex}>
								{this.packageData.screenshots.map((screenshotObj, index) => {
									return (
										<MetroFlipViewItem>
											<img src={`http://localhost:3000/media/screenshot/${screenshotObj.id}`} />
										</MetroFlipViewItem>
									)
								})}
							</MetroFlipView>
						</div>
					)
				}
			}).show();
		},
		async reportPackageButtonClicked() {
			if (!this.accountId) {
				this.parent.login();
			} else {
				let reportDialog = new metroUI.ContentDialog({
					title: this.$t('package.report_compose.title', { packageName: this.packageData.name }),
					content: (
						<div style="min-width: 320px">
							<MetroTextBox
								header={ this.$t('package.report_compose.message') }
								required={true}
								textarea={true}
								name="detailText"
								style="margin-bottom: 8px"
							/>
						</div>
					),
					commands: [{ text: this.$t('app.ok'), primary: true }, { text: this.$t('app.cancel') }]
				});
				if (await reportDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
					let requestData = await RequestAPI.createRequest({
						type: LogItemType.USER_REPORT,
						detailText: reportDialog.text["detailText"],
						affectedPackageId: this.packageData.id
					});
					
					if (requestData.error) {
						console.error(requestData.error);
					} else {
						new metroUI.ContentDialog({
							title: this.$t('package.report_compose.success_title'),
							content: this.$t('package.report_compose.success_message'),
							commands: [{ text: this.$t('app.ok'), primary: true }]
						}).show()
					}
				}
			}
		},
		async reviewButtonClicked() {
			if (!this.accountId) {
				this.parent.login();
			} else {
				let reviewDialog = new metroUI.ContentDialog({
					title: this.packageData.name,
					content: (
						<div style="min-width: 320px">
							<MetroTextBlock text-style="sub-title" style="font-size: 16px; margin-bottom: 8px">{ this.$t('package.review_compose.rate') }</MetroTextBlock>
							<MetroRatingControl name="value" />
							
							<MetroTextBlock text-style="sub-title" style="font-size: 16px; margin-bottom: 8px">{ this.$t('package.review_compose.write_a_review') }</MetroTextBlock>
							<MetroTextBox
								header={ this.$t('package.review_compose.headline_title') }
								required={true}
								name="title"
								style="margin-bottom: 8px"
							/>
							<MetroTextBox
								header={ this.$t('package.review_compose.body_title') }
								required={true}
								textarea={true}
								name="text"
								style="margin-bottom: 8px"
							/>
						</div>
					),
					commands: [{ text: this.$t('app.ok'), primary: true }, { text: this.$t('app.cancel') }]
				});
				if (await reviewDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
					let reviewData = await PackageAPI.createPackageReview({
						"package.id": this.packageData.id
					}, reviewDialog.text);
					
					if (reviewData.error) {
						console.error(reviewData.error);
					} else {
						new metroUI.ContentDialog({
							title: this.$t('package.review_compose.success_title'),
							content: this.$t('package.review_compose.success_message'),
							commands: [{ text: this.$t('app.ok'), primary: true }]
						}).show()
					}
				}
			}
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		parent() {
			return this.$parent.$parent.$parent.$parent;
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

<style lang="less">
body[data-theme="light"] {
	--review-item-background: #FFFBFF;
}
body[data-theme="dark"] {
	--review-item-background: #191C19;
}

.page[data-page-id="package"] {
	.page-content {
		padding-top: 0 !important;
	}
	
	.package-header-section {
		.package-header {
			position: relative;
			
			.hero-image-container {
				@media all and (max-width: 640px) {
					margin: -40px -12px 0;
					
					& + .package-header-content .icon-container {
						margin-bottom: -20px;
						transform: translate3d(0, -50%, 0);
					}
				}
				
				@media all and (min-width: 641px) and (max-width: 1007px) {
					margin: -48px -24px 0;
					
					& + .package-header-content .icon-container {
						margin-bottom: -35px;
						transform: translate3d(0, -50%, 0);
					}
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
						margin: 0 auto 24px;
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
						margin: 0 auto 24px;
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
	
	.version-history-container {
		.version-history-item {
			position: relative;
			
			& > .stack-panel {
				margin-bottom: 24px;
				
				@media all and (min-width: 1008px) {
					flex-direction: column;
				}
				
				.text-block.caption {
					color: var(--base-medium);
					line-height: 27px;
				}
			}
			
			&:not(:last-child) {
				margin-bottom: 16px;
				
				&:after {
					content: '';
					position: absolute;
					bottom: -20px;
					left: 0;
					right: 0;
					height: 1px;
					background-color: var(--base-low);
				}
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
		margin-bottom: 40px;
		
		.detailed-rating-wrapper {
			margin-top: 64px;
			
			@media all and (max-width: 640px) {
				margin-top: 24px;
			}
		}
	}
	
	.review-container {
		margin-top: 34px;
		
		.review-cell:not(:last-child) {
			margin-bottom: 12px;
		}
	}
}

.content-dialog {
	max-width: initial;
	
	.content-dialog-content {
		position: relative;
		overflow-x: visible;
		
		& > .screenshot-viewer {
			margin: -18px -24px;
			width: 100vw;
			height: 100vh;
			max-width: 1366px;
			max-height: 800px;
			
			.screenshot-viewer-chrome {
				& > .text-block {
					line-height: 32px;
					padding: 0 8px;
				}
				
				& > button {
					&:not(:hover):not(:active) {
						background-color: transparent;
					}
					&:hover:not(:active) {
						box-shadow: none;
					}
				}
			}
			
			.flip-view {
				max-height: calc(~"100% - 32px");
				
				.flip-view-item {
					img {
						max-width: 100%;
						max-height: 100%;
					}
				}
			}
		}
		
		& > .review-viewer {
			margin: -18px -24px;
			width: 100vw;
			height: 100vh;
			max-width: 640px;
			max-height: 800px;
			display: flex;
			flex-direction: column;
			
			.review-viewer-chrome {
				& > .text-block {
					line-height: 32px;
					padding: 0 8px;
				}
				
				& > button {
					&:not(:hover):not(:active) {
						background-color: transparent;
					}
					&:hover:not(:active) {
						box-shadow: none;
					}
				}
			}
			
			.review-viewer-header {
				padding: 12px;
			}
			
			.messages {
				flex: 1;
				min-height: 0;
			}
		}
	}
}
</style>