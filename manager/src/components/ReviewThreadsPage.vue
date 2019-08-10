<template>
	<MetroPage page-id="reviews" @navigatedTo.native="onPageShow">
		<MetroListView :pane-title="$t('root.item_reviews')" ref="list-view">
			<template slot="menu-items">
				<template v-if="reviewData.length">
					<div class="list-view-item"
						:class="{'selected': selectedThread && (selectedThread === reviewObj.id)}"
						@click="threadSelected(reviewObj.id)"
						v-for="(reviewObj) in reviewData"
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
										<span class="detail-text-label align-right">{{ reviewObj.createdAt | dateTime }}</span>
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
						<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" />
						<MetroAppBarSeparator />
						<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" :disabled="!selectedThread" />
					</MetroCommandBar>
				</template>
				<MetroMessages :placeholder-text="$t('reviews.messages_placeholder')" ref="messages" v-show="selectedThread" />
			</MetroPage>
		</MetroListView>
	</MetroPage>
</template>

<style lang="less">
.page[data-page-id="reviews"] {
	& > .page-content {
		height: 100%;
		padding: 0 !important
	}
	
	.list-view .list-view-item {
		height: 76px;
		
		.list-view-item-content {
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

<script>
import { PackageAPI } from "@/scripts/ApiUtil";
import { AccountAPI } from "@/scripts/ApiUtil";

import MetroListView from '@/components/ListViewComponent'

export default {
	name: "ReviewThreadsPage",
	components: {
		MetroListView
	},
	data() {
		return {
			packageData: [],
			reviewData: [],
			selectedThread: null
		}
	},
	mounted() {
		this.$refs["list-view"].navigate("messages");
	},
	methods: {
		async onPageShow(event) {
			this.$parent.setHeader("");
			
			this.packageData = await PackageAPI.getPackages();
			this.reviewData = await PackageAPI.getReviews();
		},
		getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		},
		getReviewLastMessage(reviewObj) {
			return reviewObj.messages[reviewObj.messages.length - 1].text;
		},
		async threadSelected(threadId) {
			let thread = this.reviewData.find(reviewObj => reviewObj.id === threadId);
			if (!thread) return;
			
			// thread.messages.find(messageObj => messageObj.
			let packageOwnerAccountData = await AccountAPI.getUser(this.packageData.find(packageObj => packageObj.id === thread.packageId).accountId);
			let reviewerAccountData = await AccountAPI.getUser(thread.accountId);
			
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
		accountId() {
			return this.$store.state.accountId;
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