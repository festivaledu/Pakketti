<template>
	<div class="review-cell">
		<template v-if="profileData">
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="top" class="profile-container">
				<MetroPersonPicture :display-name="profileData.username" v-if="!profileData.profileImageMime" />
				<MetroPersonPicture :profile-picture="`/media/avatar/${profileData.id}`" v-if="profileData.profileImageMime" />
				
				<div class="profile-text-container">
					<MetroTextBlock text-style="base">{{ profileData.username }}</MetroTextBlock>
					
					<template v-if="reviewData.device">
						<MetroTextBlock text-style="base" style="margin-bottom: 0" v-if="reviewData.device.platform == 'iphoneos'">{{ DeviceStrings[reviewData.device.product] || $t('device.unknown_product') }}</MetroTextBlock>
						<MetroTextBlock text-style="base" style="margin-bottom: 0" v-else>{{ reviewData.device.product }}</MetroTextBlock>
						
						<MetroTextBlock text-style="base">{{ Platforms.platforms[reviewData.device.platform] || $t('device.unknown_platform') }} {{ reviewData.device.version }}</MetroTextBlock>
					</template>
				</div>
			</MetroStackPanel>
			
			<div class="rating-cell-content">
				<MetroStackPanel orientation="horizontal" vertical-orientation="center">
					<div class="rating-stars">
						<div class="rating-value" :style="{'width': `${(reviewData.rating.value / 5) * 100}%`}" />
					</div>
					<MetroTextBlock>{{ reviewData.createdAt | date }}</MetroTextBlock>
				</MetroStackPanel>
				
				<MetroTextBlock text-style="sub-title" style="font-weight: 500; margin-bottom: 16px">{{ reviewData.title }}</MetroTextBlock>
				
				<MetroTextBlock>
					<span v-html="reviewData.messages[0].text.replace(/\n/g, '<br>')" />
				</MetroTextBlock>
				
				<MetroStackPanel orientation="horizontal" style="margin-top: 8px">
					<MetroHyperlinkButton v-if="reviewData.messages.length > 1" @click="showAllMessages">
						<MetroTextBlock text-style="base">{{ $t('package.reviews.show_messages', { messageCount: reviewData.messages.length }) }}</MetroTextBlock>
					</MetroHyperlinkButton>
					<div v-else />
					
					<MetroHyperlinkButton style="text-decoration: none" v-if="accountId !== reviewData.accountId || true" @click="reportReviewButtonClicked">
						<MetroFontIcon glyph="&#xE7C1;" font-size="14px" />
					</MetroHyperlinkButton>
				</MetroStackPanel>
			</div>
		</template>
	</div>
</template>

<script>
import { AccountAPI, DeviceAPI, PackageAPI, RequestAPI } from '@/scripts/ApiUtil'
import { LogItemType } from '@/scripts/Enumerations'
import CurrentRating from './CurrentRating';

import Platforms from '../../../platforms.json'
import DeviceStrings from '../../../deviceStrings.json'

export default {
	name: "ReviewCell",
	components: {
		CurrentRating
	},
	props: {
		reviewData: null,
	},
	data: () => ({
		profileData: null,
		
		Platforms: Platforms,
		DeviceStrings: DeviceStrings
	}),
	async mounted() {
		this.profileData = await AccountAPI.getUser({
			"account.id": this.reviewData.accountId
		});
	},
	methods: {
		async showAllMessages() {
			let packageData = await PackageAPI.getPackages({
				"package.id": this.reviewData.packageId
			});
			
			let packageOwnerAccountData = await AccountAPI.getUser({
				"account.id": packageData.find(packageObj => packageObj.id === this.reviewData.packageId).accountId
			});
			let reviewerAccountData = await AccountAPI.getUser({
				"account.id": this.reviewData.accountId
			});
			
			let messages = this.reviewData.messages.map(messageObj => {
				return {
					author: messageObj.accountId,
					displayName: [packageOwnerAccountData, reviewerAccountData].find(accountObj => accountObj.id === messageObj.accountId).username,
					date: new Date(messageObj.createdAt),
					text: messageObj.text,
					type: messageObj.accountId === this.reviewData.accountId ? "sent" : "received"
				}
			});
			
			new metroUI.ContentDialog({
				className:"review-content-dialog",
				content: (dialog) => (
					<div class="review-viewer">
						<MetroStackPanel orientation="horizontal" class="review-viewer-chrome">
							<MetroTextBlock>{this.$t('package.pivot_titles.reviews')}</MetroTextBlock>
							<MetroButton onclick={() => dialog.hide.apply(dialog)}>
								<MetroSymbolIcon symbol="cancel" />
							</MetroButton>
						</MetroStackPanel>
						
						<div class="review-viewer-header">
							<MetroTextBlock>{ packageData[0].name } • { packageData[0].identifier }</MetroTextBlock>
							<MetroStackPanel orientation="vertical" vertical-alignment="center">
								<MetroStackPanel orientation="horizontal">
									<MetroTextBlock text-style="sub-title">{this.reviewData.title}</MetroTextBlock>
									{this.reviewData.device &&
									<MetroTextBlock class="mt-2">
										{ this.reviewData.device.platform == 'iphoneos' ?
											(DeviceStrings[this.reviewData.device.product] || this.$t('device.unknown_product')) :
											this.reviewData.device.product
										},
										&nbsp;
										{
											Platforms.platforms[this.reviewData.device.platform] ||
											this.$t('device.unknown_platform')
										}
										&nbsp;
										{ this.reviewData.device.version }
									</MetroTextBlock>
									}
								</MetroStackPanel>
								<MetroRatingControl value={this.reviewData.rating.value} />
							</MetroStackPanel>
						</div>
						
						<MetroMessages show-input={false} messages={messages} />
					</div>
				)
			}).show();
		},
		async reportReviewButtonClicked() {
			if (!this.accountId) {
				this.parent.login();
			} else {
				let reportDialog = new metroUI.ContentDialog({
					title: this.$t('package.report_compose.title_review'),
					content: (
						<div style="min-width: 320px">
							<MetroTextBox
								header={ this.$t('package.report_compose.message_review') }
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
						affectecAccountId: this.reviewData.accountId,
						affectedPackageId: this.reviewData.packageId,
						affectedReviewId: this.reviewData.id
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
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		parent() {
			return this.$parent.$parent.$parent.$parent.parent;
		}
	},
	filters: {
		date(value) {
			return new Date(value).toLocaleDateString();
		}
	}
}
</script>

<style lang="less">
.encoded-svg-mask(@svg) {
	@url: `encodeURIComponent(@{svg})`;
	mask-image: url("data:image/svg+xml;charset=utf-8,@{url}");
}

.rating-stars {
	width: 116px;
	height: 20px;
	background-color: var(--base-low);
	margin-bottom: 12px;
	
	.encoded-svg-mask("<svg width='116px' height='20px' viewBox='0 0 116 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><path d='M13.828125,12.2460938 L16.25,20 L10,15.1953125 L3.75,20 L6.171875,12.2460938 L0,7.5 L7.65625,7.5 L10,0 L12.34375,7.5 L20,7.5 L13.828125,12.2460938 Z M37.828125,12.2460938 L40.25,20 L34,15.1953125 L27.75,20 L30.171875,12.2460938 L24,7.5 L31.65625,7.5 L34,0 L36.34375,7.5 L44,7.5 L37.828125,12.2460938 Z M61.828125,12.2460938 L64.25,20 L58,15.1953125 L51.75,20 L54.171875,12.2460938 L48,7.5 L55.65625,7.5 L58,0 L60.34375,7.5 L68,7.5 L61.828125,12.2460938 Z M85.828125,12.2460938 L88.25,20 L82,15.1953125 L75.75,20 L78.171875,12.2460938 L72,7.5 L79.65625,7.5 L82,0 L84.34375,7.5 L92,7.5 L85.828125,12.2460938 Z M109.828125,12.2460938 L112.25,20 L106,15.1953125 L99.75,20 L102.171875,12.2460938 L96,7.5 L103.65625,7.5 L106,0 L108.34375,7.5 L116,7.5 L109.828125,12.2460938 Z' /></svg>");
	
	.rating-value {
		width: 0;
		height: 100%;
		background-color: var(--base-medium);
	}
}

.review-cell {
	display: flex;
	padding: 16px;
	background-color: var(--review-item-background);
	
	.profile-container {
		width: 25%;
		
		.person-picture {
			width: 48px;
			height: 48px;
			min-width: 48px;
			margin-right: 16px;
			
			.text-block {
				font-size: 24px;
				font-weight: 500;
			}
		}
		
		.profile-text-container {
			& > .text-block {
				font-size: 15px;
				
				&:not(:last-child) {
					margin-bottom: 16px;
				}
			}
		}
	}
	
	.rating-cell-content {
		flex: 1;
		
		& > .hyperlink-button {
			margin-top: 32px;
		}
	}
	
	@media all and (max-width: 1007px) {
		flex-direction: column;
		
		.profile-container {
			position: relative;
			width: auto;
			margin-bottom: 40px;
			
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
		
		.rating-cell-content {
				& > .hyperlink-button {
				margin-top: 20px;
			}
		}
	}
}

.content-dialog.review-content-dialog {
	max-width: initial;
	
	.content-dialog-content {
		position: relative;
		overflow-x: visible;
		
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
				
				.messages-wrapper {
					padding: 0 14px 24px;
				}
			}
		}
	}
}
</style>