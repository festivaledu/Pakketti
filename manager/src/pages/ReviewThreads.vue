<template>
	<MetroPage page-id="reviews">
		<vue-headful :title="`${$t('root.item_reviews')} – ${$t('app.name')}`" />
		
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" />
			</MetroCommandBar>
		</template>
		
		<template v-if="reviewData && !reviewData.length">
			<MetroTextBlock>{{ $t('dashboard.reviews_no_items') }}</MetroTextBlock>
		</template>
		
		<template v-if="packageData && reviewData && reviewData.length">
			<div class="grid-view">
				<div class="grid-view-item" v-for="(reviewObj, index) in reviewData" :key="index">
					<div class="review-container">
						<div class="review-description-container">
							<MetroRatingControl :value="reviewObj.rating.value" />
							<MetroStackPanel orientation="vertical">
								<MetroStackPanel orientation="vertical" vertical-alignment="top">
									<MetroTextBlock text-style="base">{{ reviewObj.title }}</MetroTextBlock>
									<MetroTextBlock>
										<v-clamp autoresize :max-lines="3">{{ reviewObj.messages.lastObject().text }}</v-clamp>
									</MetroTextBlock>
								</MetroStackPanel>
								
								<MetroStackPanel orientation="vertical" vertical-alignment="top" class="mt-2">
									<MetroTextBlock text-style="caption">
										{{ _getPackageInfo(reviewObj.packageId).name }} • {{ _getPackageInfo(reviewObj.packageId).identifier }}
									</MetroTextBlock>
									
									<MetroTextBlock text-style="caption" v-if="reviewObj.device">
										{{ reviewObj.device.platform == 'iphoneos' ?
											(DeviceStrings[reviewObj.device.product] || $t('devices.unknown_product')) :
											reviewObj.device.product
										}},
										{{ Platforms.platforms[reviewObj.device.platform] ?
											$t(`package_editor.info.platform.${reviewObj.device.platform}`) :
											$t('devices.unknown_platform')
										}}
										{{ reviewObj.device.version }}
									</MetroTextBlock>
									
									<MetroTextBlock text-style="caption">
										{{ $t('reviews.last_updated') }}: {{ reviewObj.messages.lastObject().createdAt | dateTime }}
									</MetroTextBlock>
								</MetroStackPanel>
							</MetroStackPanel>
						</div>
						
						<MetroStackPanel orientation="horizontal" class="review-toolbar">
							<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="reviewDeleteButtonClicked(reviewObj)" />
							<MetroAppBarButton icon="view" :label="$t('app.actions.view')" @click="reviewViewButtonClicked(reviewObj)" />
						</MetroStackPanel>
					</div>
				</div>
			</div>
		</template>
	</MetroPage>
</template>

<script>
import { AccountAPI, PackageAPI } from '@/scripts/ApiUtil'
import Platforms from '../../../platforms.json'
import DeviceStrings from '../../../deviceStrings.json'

import VClamp from 'vue-clamp'

export default {
	name: "ReviewThreads",
	components: {
		VClamp
	},
	data: () => ({
		packageData: null,
		reviewData: null,
		Platforms: Platforms,
		DeviceStrings: DeviceStrings
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages();
		let _reviewData = await PackageAPI.getReviews();
		
		next(vm => {
			vm.packageData = _packageData;
			vm.reviewData = _reviewData;
			
			if (to.params.reviewId && _reviewData.find(reviewObj => reviewObj.id == to.params.reviewId)) {
				vm.reviewItemClicked(_reviewData.find(reviewObj => reviewObj.id == to.params.reviewId));
			}
			
			vm.$parent.setHeader(vm.$t('root.item_reviews'));
			vm.$parent.setSelectedMenuItem("reviews");
		})
	},
	methods: {
		async refresh() {
			this.packageData = await PackageAPI.getPackages();
			this.reviewData = await PackageAPI.getReviews();
		},
		async reviewViewButtonClicked(reviewObj) {			
			let packageOwnerAccountData = await AccountAPI.getUser({
				"account.id": this.packageData.find(packageObj => packageObj.id === reviewObj.packageId).accountId
			});
			let reviewerAccountData = await AccountAPI.getUser({
				"account.id": reviewObj.accountId
			});
			
			let messages = reviewObj.messages.map(messageObj => ({
				author: messageObj.accountId,
				displayName: [packageOwnerAccountData, reviewerAccountData].find(accountObj => accountObj.id === messageObj.accountId).username,
				date: new Date(messageObj.createdAt),
				text: messageObj.text,
				type: messageObj.accountId === this.accountId ? "sent" : "received"
			}));
			
			let dialog = new metroUI.ContentDialog({
				className:"review-content-dialog",
				content: (dialog) => (
					<div class="review-viewer">
						<MetroStackPanel orientation="horizontal" class="review-viewer-chrome">
							<MetroTextBlock>{ this.$t('root.item_reviews') }</MetroTextBlock>
							<MetroButton onclick={() => dialog.hide.apply(dialog)}>
								<MetroSymbolIcon symbol="cancel" />
							</MetroButton>
						</MetroStackPanel>
						
						<div class="review-viewer-header">
							<MetroTextBlock>{ this._getPackageInfo(reviewObj.packageId).name } • { this._getPackageInfo(reviewObj.packageId).identifier }</MetroTextBlock>
							<MetroStackPanel orientation="horizontal" vertical-alignment="center">
								<MetroStackPanel orientation="vertical">
									<MetroTextBlock text-style="sub-title">{reviewObj.title}</MetroTextBlock>
									{reviewObj.device &&
									<MetroTextBlock class="mt-2">
										{ reviewObj.device.platform == 'iphoneos' ?
											(DeviceStrings[reviewObj.device.product] || this.$t('devices.unknown_product')) :
											reviewObj.device.product
										},
										&nbsp;
										{ Platforms.platforms[reviewObj.device.platform] ?
											this.$t(`package_editor.info.platform.${reviewObj.device.platform}`) :
											this.$t('devices.unknown_platform')
										}
										&nbsp;
										{ reviewObj.device.version }
									</MetroTextBlock>
									}
								</MetroStackPanel>
								<MetroRatingControl value={reviewObj.rating.value} />
							</MetroStackPanel>
						</div>
						
						<MetroMessages messages={messages} disabled={!this._isParticipatingReview(reviewObj)} onMessageSent={(text) => this.addMessage(reviewObj, text)} />
					</div>
				)
			});
			
			if (await dialog.showAsync() == metroUI.ContentDialogResult.None) {
				if (this.$route.params.reviewId) {
					this.$router.replace(`/${this.$route.path.split("/")[1]}`);
				}
			}
		},
		async reviewDeleteButtonClicked(reviewObj) {
			let deleteDialog = new metroUI.ContentDialog({
				title: this.$t('reviews.delete_review_confirm_title'),
				content: this.$t('reviews.delete_review_confirm_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let result = await PackageAPI.deletePackageReview({
					"package.id": reviewObj.packageId,
					"review.id": reviewObj.id
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
		async addMessage(reviewObj, text) {
			let packageObj = this.packageData.find(packageObj => packageObj.id === reviewObj.packageId);
			
			let result = await PackageAPI.addPackageReviewMessage({
				"package.id": packageObj.id,
				"review.id": reviewObj.id
			}, {
				text: text
			});
			
			if (result.error) {
				new metroUI.ContentDialog({
					title: this.$t('app.operational_error_title'),
					content: this.$t('app.operational_error_message', { code: result.error.code, name: result.error.name, message: result.error.message }),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
			} else {
				await this.refresh();
				
				let packageOwnerAccountData = await AccountAPI.getUser({
					"account.id": this.packageData.find(packageObj => packageObj.id === reviewObj.packageId).accountId
				});
				let reviewerAccountData = await AccountAPI.getUser({
					"account.id": reviewObj.accountId
				});
				
				let messages = this.reviewData.find(_ => _.id === reviewObj.id).messages.map(messageObj => ({
					author: messageObj.accountId,
					displayName: [packageOwnerAccountData, reviewerAccountData].find(accountObj => accountObj.id === messageObj.accountId).username,
					date: new Date(messageObj.createdAt),
					text: messageObj.text,
					type: messageObj.accountId === this.accountId ? "sent" : "received"
				}));
				
				document.querySelector(".messages").__vue__.setMessages(messages);
			}
		},
		
		_getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		},
		_isParticipatingReview(reviewObj) {
			return [this._getPackageInfo(reviewObj.packageId).accountId, reviewObj.accountId].indexOf(this.accountId) >= 0;
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
	},
	filters: {
		date(value) {
			return new Date(value).toLocaleDateString();
		},
		dateTime(value) {
			return new Date(value).toLocaleString();
		}
	}
}
</script>

<style lang="less">
.page[data-page-id="reviews"] {
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
			
			.review-container {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.review-description-container {
					display: flex;
					flex-direction: column;
					flex: 1 0 auto;
					flex-basis: 0;
					overflow: hidden;
					padding: 8px;
					text-align: center;
					
					.rating-control {
						pointer-events: none;
					}
					
					& > .stack-panel {
						flex: 1;
						justify-content: space-between;
					}
				}
				
				.review-toolbar {
					padding: 0 2px 2px;
				}
			}
		}		
	}
}

.review-content-dialog {
	max-width: initial;
	box-shadow: 0 0 0 1px var(--base-low);
	
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
			
			.rating-control {
				pointer-events: none;
				height: 22px;
			}
			
			.messages {
				flex: 1;
				min-height: 0;
			}
		}
	}
}
</style>