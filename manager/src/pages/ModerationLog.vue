<template>
	<MetroPage page-id="logs">
		<vue-headful :title="`${$t('root.item_moderation_log')} - ${$t('app.name')}`" />
		
		<template slot="bottom-app-bar">
			<MetroCommandBar>
				<MetroAppBarButton icon="repeat-all" :label="$t('app.actions.reload')" @click="refresh" />
			</MetroCommandBar>
		</template>
		
		<div class="data-grid log-item-list" v-if="logItemData">
			<div class="data-grid-wrapper">
				<div class="table">
					<div class="column-headers-border" />
					<div class="tr column-headers">
						<div class="th column-header-item">{{ $t('requests.type.title') }}</div>
						<div class="th column-header-item">{{ $t('packages.created') }}</div>
						<div class="th column-header-item align-right">{{ $t('packages.actions') }}</div>
					</div>
					<div class="row-wrapper" v-for="(logItemObj, index) in logItemData" :key="index">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock>{{ $t(`moderation_log.type.${logItemObj.type}`) }}</MetroTextBlock>
								<MetroTextBlock text-style="caption">{{ logItemObj.detailText }}</MetroTextBlock>
							</div>
							<div class="td cell">
								<MetroTextBlock>{{ logItemObj.createdAt | dateTime }}</MetroTextBlock>
							</div>
							<div class="td cell align-right">
								<MetroButton @click="showActionMenu($event, logItemObj)">
									<MetroSymbolIcon icon="more" />
								</MetroButton>
							</div>
						</div>
						<div class="row-background" :style="{'top': `${(index * 47) + 32}px`}" />
					</div>
					
					<div class="row-wrapper" v-if="!logItemData.length">
						<div class="tr row">
							<div class="td cell">
								<MetroTextBlock text-style="caption">{{ $t('moderation_log.no_items') }}</MetroTextBlock>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</MetroPage>
</template>

<script>
import { AccountAPI, PackageAPI, LogAPI } from '@/scripts/ApiUtil'
import { UserRole, LogItemType } from "@/scripts/Enumerations"

export default {
	name: "ModerationLog",
	data: () => ({
		logItemData: null
	}),
	beforeRouteEnter: async (to, from, next) => {
		let _logItemData = await LogAPI.getLogItems();
		
		next(vm => {
			vm.logItemData = _logItemData;
			
			vm.$parent.setHeader(vm.$t('root.item_moderation_log'));
			vm.$parent.setSelectedMenuItem("logs");
		});
	},
	methods: {
		showActionMenu(e, logItemObj) {
			let flyout = new metroUI.MenuFlyout({
				items: [{
					icon: "view",
					text: this.$t('app.actions.view'),
					action: () => this.viewLogItem(logItemObj)
				}]
			});
			
			flyout.showAt(e.target);
		},
		async viewLogItem(logItemObj) {			
			let accountData = null;
			if (logItemObj.affectedAccountId) {
				accountData = await AccountAPI.getUser({
					"account.id": logItemObj.affectedAccountId
				})
			}
			
			let packageData = null;
			let reviewData = null;
			if (logItemObj.affectedPackageId) {
				packageData = (await PackageAPI.getPackages({
					"package.id": logItemObj.affectedPackageId,
					include: "reviews"
				}))[0];
				
				if (logItemObj.affectedReviewId) {
					reviewData = packageData.reviews.find(_ => _.id == logItemObj.affectedReviewId);
				}
			}
			
			let dialog = new metroUI.ContentDialog({
				title: this.$t('moderation_log.view_log_item'),
				content: () => {
					return (
						<div class="row" style="width: 500px">
							<div class="col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBlock text-style="base">{this.$t('moderation_log.type.title')}</MetroTextBlock>
									<MetroTextBlock>{this.$t(`moderation_log.type.${logItemObj.type}`)}</MetroTextBlock>
								</div>
								
								<div class="mb-4">
									<MetroTextBlock text-style="base">{this.$t('requests.detail_text_header')}</MetroTextBlock>
									<MetroTextBlock>{logItemObj.detailText}</MetroTextBlock>
								</div>
							</div>
							
							<div class="col-12 col-md-6">
								<div class="mb-4">
									<MetroTextBlock text-style="base">{this.$t('requests.affected.account')}</MetroTextBlock>
									<MetroTextBlock>{accountData ? `${accountData.username} (${accountData.email || this.$t('requests.affected.na')})` : this.$t('requests.affected.na')}</MetroTextBlock>
								</div>
								<div class="mb-4">
									<MetroTextBlock text-style="base">{this.$t('requests.affected.package')}</MetroTextBlock>
									<MetroTextBlock>{packageData ? `${packageData.name} (${packageData.identifier})` : this.$t('requests.affected.na')}</MetroTextBlock>
								</div>
								<div class="mb-4">
									<MetroTextBlock text-style="base">{this.$t('requests.affected.review')}</MetroTextBlock>
									<MetroTextBlock>{reviewData ? `${reviewData.title} (${new Date(reviewData.createdAt).toLocaleString()})` : this.$t('requests.affected.na')}</MetroTextBlock>
								</div>
							</div>
						</div>
					)
				},
				commands: [{ text: this.$t('app.actions.close'), primary: true }]
			});
			
			dialog.show();
		},
		async refresh() {
			this.logItemData = await LogAPI.getLogItems();
		}
	},
	computed: {
		accountId() {
			return this.$store.state.accountId;
		},
		isModerator() {
			return this.$store.state.role & UserRole.MODERATOR == UserRole.MODERATOR;
		},
		isAdministrator() {
			return this.$store.state.role & UserRole.ADMINISTRATOR == UserRole.ADMINISTRATOR;
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
.page[data-page-id="logs"] {
	.data-grid {
		.row {
			.cell:not(:first-child) {
				color: var(--base-medium);
			}
		}
		
		&.log-item-list {
			.table {
				width: 100%;
			}
			
			.row {
				height: 47px;
			}
			.row-background {
				height: 47px;
				
				&:after {
					height: 47px;
				}
			}
			
			.toggle-switch,
			.rating-control {
				pointer-events: none;
				min-width: auto;
			}
		}
	}
}
</style>