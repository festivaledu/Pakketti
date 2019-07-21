<template>
	<div class="page" data-page-id="reviews" @pageShow="pageShow">
		<metro-list-view :history="false" menuTitle="Reviews" acrylic="acrylic-80" ref="messagesView">
			<template slot="list-items">
				<template v-if="reviewData.length">
					<template v-for="(reviewObj) in reviewData">
						<div class="list-view-item" :class="{'selected': selectedThread && (selectedThread === reviewObj.id)}" @click="threadSelected(reviewObj.id)" :key="reviewObj.id">
							<div class="list-view-item-inner">
								<div class="list-view-item-content row">
									<div class="col-fill">
										<span class="text-label">{{ reviewObj.title }}</span>
										<span class="detail-text-label">{{ getPackageInfo(reviewObj.packageId).name }} – {{ getPackageInfo(reviewObj.packageId).identifier }}</span>
									</div>
									<div>
										<span class="detail-text-label align-right">{{ reviewObj.createdAt | date }}</span>
										<div class="review-rating-view">
											<div class="rating-star" v-for="i in reviewObj.rating.value" :key="`${reviewObj.id}${i}`" />
											<div class="rating-star outline" v-for="i in (5 - reviewObj.rating.value)" :key="`${reviewObj.id}${i + reviewObj.rating.value}`" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</template>
			</template>
			
			<template slot="pages">
				<div class="page" data-page-id="messages">
					<metro-messages ref="messageContainer" :showEmojiSelector="false" :useTextarea="true" />
				</div>
			</template>
		</metro-list-view>
	</div>
</template>

<style lang="less">
.page[data-page-id="reviews"] {
	.col-fill {
		flex: 1;
		min-width: 0;
	}
	
	.review-rating-view {
		display: flex;
		justify-content: flex-end;
		width: 72px;
		height: 20px;
		
		.rating-star {
			width: 12px;
			height: 20px;
			
			&:after {
				font-size: 12px;
				font-family: "Segoe MDL2 Assets";
			}
			
			&:not(.outline):after {
				content: "\E735";
				color: var(--system-accent-color);
			}
			
			&.outline:after {
				content: "\E734";
				color: var(--base-medium);
			}
		}
	}
	
	.list-view .list-view-item {
		height: 64px;
		
		.list-view-item-content {
			margin-left: 0;
			margin-right: 0;
			padding-right: 16px;
			
			.col-fill {
				padding-right: 15px;
			}
			
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
	
	.messages-container .messages-wrapper .message .message-text {
		word-break: normal;
	}
}
</style>

<script>
import { PackageAPI } from "@/scripts/ApiUtil";

export default {
	name: "ReviewThreadsPage",
	data() {
		return {
			packageData: [],
			reviewData: [],
			selectedThread: null
		}
	},
	mounted() {
		this.$refs["messagesView"].navigate("messages");
	},
	methods: {
		async pageShow() {
			this.packageData = await PackageAPI.getPackages();
			this.reviewData = await PackageAPI.getReviews();
		},
		getPackageInfo(packageId) {
			return this.packageData.find(packageObj => packageObj.id == packageId);
		},
		getReviewLastMessage(reviewObj) {
			return reviewObj.messages[reviewObj.messages.length - 1].text;
		},
		threadSelected(threadId) {
			let thread = this.reviewData.find(reviewObj => reviewObj.id === threadId);
			if (!thread) return;
			
			this.selectedThread = threadId;
			let messages = thread.messages.map(messageObj => {
				return {
					author: messageObj.accountId,
					displayName: "Cockfotze",
					date: new Date(messageObj.createdAt),
					text: messageObj.text,
					type: "received"
				}
			});
			if (this.$refs["messageContainer"]) {
				this.$refs["messageContainer"].setMessages(messages);
			}
		}
	},
	filters: {
		date(value) {
			return new Date(value).toLocaleDateString("en-US");
		},
		dateTime(value) {
			return new Date(value).toLocaleString("en-US");
		}
	}
}
</script>
