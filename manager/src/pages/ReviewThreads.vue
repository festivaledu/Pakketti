<template>
	<MetroPage page-id="reviews">
		<vue-headful :title="$t('root.item_reviews')" />
		
		<MetroListView :pane-title="$t('root.item_reviews')" ref="list-view">
			<template slot="menu-items">
				<template v-if="reviewData.length">
					<div class="list-view-item"
						:class="{'selected': selectedThread && (selectedThread === reviewObj.id)}"
						@click="threadSelected(reviewObj.id)"
						v-for="(reviewObj) in sortedReviews"
						:key="reviewObj.id"
					>
						<div class="list-view-item-inner">
							<div class="list-view-item-content">
								<MetroStackPanel vertical-alignment="top">
									<MetroStackPanel>
										<span class="text-label">{{ reviewObj.title }}</span>
										<span class="detail-text-label">{{ getPackageInfo(reviewObj.packageId).name }} – {{ getPackageInfo(reviewObj.packageId).identifier }}</span>
									</MetroStackPanel>
									
									<MetroStackPanel orientation="horizontal" vertical-alignment="center">
										<span class="detail-text-label align-right">{{ reviewObj.messages.lastObject().createdAt | dateTime }}</span>
										<MetroRatingControl :value="reviewObj.rating.value" style="pointer-events: none" />
									</MetroStackPanel>
								</MetroStackPanel>
							</div>
						</div>
					</div>
				</template>
			</template>
			<MetroPage page-id="messages">
				<template slot="bottom-app-bar">
					<MetroCommandBar>
						<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" @click="refresh" />
						<MetroAppBarSeparator />
						<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" :disabled="!selectedThread || !isOwnedReview" @click="deleteReview(selectedThread)" />
					</MetroCommandBar>
				</template>
				<MetroMessages :placeholder-text="$t('reviews.messages_placeholder')" ref="messages" v-show="selectedThread" @messageSent="addMessage" :disabled="!isOwnedReview" />
			</MetroPage>
		</MetroListView>
	</MetroPage>
</template>

<script>
import { PackageAPI, AccountAPI } from "@/scripts/ApiUtil";
import { UserRole } from "@/scripts/Enumerations"

import MetroListView from '@/components/ListView'

export default {
	name: "ReviewThreads",
	components: {
		MetroListView
	},
	data: () => ({
		packageData: [],
		reviewData: [],
		selectedThread: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _packageData = await PackageAPI.getPackages();
		let _reviewData = await PackageAPI.getReviews();
		
		next(vm => {
			vm.packageData = _packageData;
			vm.reviewData = _reviewData;
			
			vm.selectedThread = null;
			vm.threadSelected(to.params.reviewId || null);
			
			vm.$refs["list-view"].navigate("messages");
			
			vm.$parent.setHeader(null);
			vm.$parent.setSelectedMenuItem("reviews");
		});
	},
	methods: {
		async refresh() {
			this.packageData = await PackageAPI.getPackages();
			this.reviewData = await PackageAPI.getReviews();
			
			this.threadSelected(this.selectedThread);
		},
		async deleteReview(reviewId) {
			let deleteDialog = new metroUI.ContentDialog({
				title: `Delete this review?`,
				content: "Are you sure you want to delete this review? This action cannot be undone.",
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await deleteDialog.showAsync() === metroUI.ContentDialogResult.Primary) {
				let reviewObj = this.reviewData.find(reviewObj => reviewObj.id === reviewId);
				let packageObj = this.packageData.find(packageObj => packageObj.id === reviewObj.packageId);
				
				let result = await PackageAPI.deletePackageReview({
					"package.id": packageObj.id,
					"review.id": reviewObj.id
				});

				if (result.error) {
					console.error(result.error);
				} else {
					this.refresh();
				}
			}
		},
		async addMessage(text) {
			let reviewObj = this.reviewData.find(reviewObj => reviewObj.id === this.selectedThread);
			let packageObj = this.packageData.find(packageObj => packageObj.id === reviewObj.packageId);
			
			let result = await PackageAPI.addPackageReviewMessage({
				"package.id": packageObj.id,
				"review.id": reviewObj.id
			}, {
				text: text
			});
			
			if (result.error) {
				console.error(result.error);
			} else {
				this.refresh();
			}
		},
		
		getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		},
		getReviewLastMessage(reviewObj) {
			return reviewObj.messages[reviewObj.messages.length - 1].text;
		},
		async threadSelected(threadId) {
			let thread = this.reviewData.find(reviewObj => reviewObj.id === threadId);
			if (!thread) {
				this.selectedThread = null;
				this.$refs["list-view"].setHeader("");
				return;
			}
			
			// thread.messages.find(messageObj => messageObj.
			let packageOwnerAccountData = await AccountAPI.getUser({
				"account.id": this.packageData.find(packageObj => packageObj.id === thread.packageId).accountId
			});
			let reviewerAccountData = await AccountAPI.getUser({
				"account.id": thread.accountId
			});
			
			this.selectedThread = threadId;
			let messages = thread.messages.map(messageObj => {
				return {
					author: messageObj.accountId,
					displayName: [packageOwnerAccountData, reviewerAccountData].find(accountObj => accountObj.id === messageObj.accountId).username,
					date: new Date(messageObj.createdAt),
					text: messageObj.text,
					type: messageObj.accountId === this.accountId ? "sent" : "received"
				}
			});
			
			this.$refs["list-view"].setHeader(thread.title);
			if (this.$refs["messages"]) {
				this.$refs["messages"].setMessages(messages);
			}
		}
	},
	computed: {
		sortedReviews() {
			return this.reviewData.sort((a, b) => new Date(b.messages.lastObject().createdAt).getTime() - new Date(a.messages.lastObject().createdAt).getTime());
		},
		
		accountId() {
			return this.$store.state.accountId;
		},
		isDeveloper() {
			return this.$store.state.role & UserRole.DEVELOPER == UserRole.DEVELOPER;
		},
		isModerator() {
			return this.$store.state.role & UserRole.MODERATOR == UserRole.MODERATOR;
		},
		isAdministrator() {
			return this.$store.state.role & UserRole.ADMINISTRATOR == UserRole.ADMINISTRATOR;
		},
		isOwnedReview() {
			if (!this.selectedThread) return false;
			
			let review = this.reviewData.find(reviewObj => reviewObj.id === this.selectedThread);
			if (review.accountId == this.accountId) return true;
			if (this.getPackageInfo(review.packageId).accountId == this.accountId) return true;
			if (this.isModerator || this.isAdministrator) return true;
			
			return false;
		}
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
	& > .page-content {
		height: 100%;
		padding: 0 !important
	}
	
	.list-view .list-view-item {
		height: 76px;
		
		.list-view-item-content {
			max-width: 100%;
			margin-left: 0;
			margin-right: 0;
			padding-right: 16px;
			max-height: 76px !important;
			
			span {
				display: block;
				line-height: 22px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				
				&.text-label {
					font-weight: 600;
				}
				
				&.detail-text-label {
					color: var(--base-medium);
				}
			}
		}
	}
}
</style>