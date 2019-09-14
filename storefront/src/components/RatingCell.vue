<template>
	<div class="review-cell">
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="top" class="profile-container">
			<MetroPersonPicture initials="BW" />
			
			<div class="profile-text-container">
				<MetroTextBlock text-style="base">Bruce Wayne</MetroTextBlock>
				<MetroTextBlock text-style="base">Device (Platform Version)</MetroTextBlock>
			</div>
		</MetroStackPanel>
		
		<div class="rating-cell-content">
			<MetroStackPanel orientation="horizontal" vertical-orientation="center">
				<div class="rating-stars">
					<div class="rating-value" :style="{'width': `${(reviewData.rating.value / 5) * 100}%`}" />
				</div>
				<MetroTextBlock>{{ reviewData.createdAt | date }}</MetroTextBlock>
			</MetroStackPanel>
			
			<MetroTextBlock>
				<span v-html="reviewData.messages[0].text" />
			</MetroTextBlock>
			
			<MetroHyperlinkButton v-if="reviewData.messages.length > 1">
				<MetroTextBlock text-style="base">Show {{ reviewData.messages.length }} messages</MetroTextBlock>
			</MetroHyperlinkButton>
		</div>
	</div>
</template>

<style lang="less">
.encoded-svg-mask(@svg) {
	@url: `encodeURIComponent(@{svg})`;
	mask-image: url("data:image/svg+xml;charset=utf-8,@{url}");
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
</style>

<script>
export default {
	name: "RatingCell",
	props: {
		reviewData: null
	},
	filters: {
		date(value) {
			return new Date(value).toLocaleDateString();
		}
	}
}
</script>