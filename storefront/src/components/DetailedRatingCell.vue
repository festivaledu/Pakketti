<template>
	<div class="detailed-rating-container">
		<div class="detailed-rating-wrapper">
			<div class="current-rating-container">
				<p class="current-rating-count">{{ ratingValue.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits:1 }) }}</p>
				<CurrentRating :rating-data="ratingData" />
			</div>
			
			<div class="overall-rating-container" v-if="detailedRatingData">
				<div class="overall-rating" v-for="(_, index) in Array(5)" :key="index">
					<MetroStackPanel orientation="horizontal" vertical-alignment="center">
						<MetroTextBlock>{{ 5 - index }}</MetroTextBlock>
						<MetroFontIcon font-size="13px" glyph="&#xE735;" />
					</MetroStackPanel>
					
					<div class="rating-value">
						<div class="rating-value-fill" :style="{'width': `${(detailedRatingData.ratings[5 - index] / detailedRatingData.total) * 100}%`}" />
					</div>
					
					<MetroTextBlock text-style="caption" text-alignment="right" class="rating-percentage">{{ Math.floor((detailedRatingData.ratings[5 - index] / detailedRatingData.total) * 100) }}%</MetroTextBlock>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CurrentRating from '@/components/CurrentRating'

export default {
	name: "DetailedRatingCell",
	components: {
		CurrentRating
	},
	props: {
		ratingData: null
	},
	data() {
		return {
			detailedRatingData: null
		}
	},
	mounted() {
		this.detailedRatingData = {
			ratings: Array(5).fill(null).map((_, index) => {
				return this.ratingData.filter(_ => _.value == index + 1).length
			}).reduce((t, c, i) => ({
				...t,
				[i + 1]: c
			}), {}),
			total: this.ratingData.length
		}
	},
	computed: {
		ratingValue() {
			return this.ratingData.map(ratingObj => ratingObj.value).reduce((t, c) => t += c) / this.ratingData.length;
		},
		locale() {
			return window.navigator.language;
		}
	},
	filters: {
		number(value) {
			return new Intl.NumberFormat().format(value)
		}
	}
}
</script>

<style lang="less">
.detailed-rating-container {
	.detailed-rating-wrapper {
		display: flex;
		
		@media all and (max-width: 640px) {
			flex-direction: column;
		}
		
		.current-rating-container {
			margin-right: 24px;
			
			@media all and (max-width: 640px) {
				margin-bottom: 24px;
			}
			
			p.current-rating-count {
				margin-top: -24px; 
				font-size: 128px;
				font-weight: 200;
				line-height: 128px;
				letter-spacing: -4px;
			}
			
			.current-rating {
				margin-top: 12px;
				
				.rating-value {
					background-color: var(--base-high);
				}
				
				.text-block.caption {
					color: var(--base-high);
				}
			}
		}
		
		.overall-rating-container {
			flex: 1;
			
			.overall-rating {
				display: flex;
				height: 16px;
				
				&:not(:last-child) {
					margin-bottom: 16px;
				}
				
				.font-icon {
					margin: 0 4px;
				}
				
				.rating-value {
					flex: 1;
					height: 16px;
					background-color: var(--base-low);
					
					.rating-value-fill {
						height: 100%;
						background-color: var(--base-high);
					}
				}
				
				.rating-percentage {
					width: 32px;
					margin-left: 24px;
				}
			}
		}
	}
	
	& > button.system-accent-color {
		margin-top: 40px;
	}
}
</style>