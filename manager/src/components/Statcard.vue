<template>
	<div class="statcard">
		<div class="px-3 pt-3 mb-2">
			<MetroTextBlock text-style="caption" class="statcard-description">{{ name }}</MetroTextBlock>
			<h2 class="statcard-number" v-if="currentValue >= 0">
				<span>{{ currentValue | number }}</span>
				<MetroTextBlock text-style="caption" v-if="!isNaN(deltaValue)" class="delta-indicator" :class="{'delta-neutral': deltaValue == 0 || isNaN(deltaValue), 'delta-positive': deltaValue > 0, 'delta-negative': deltaValue < 0}">{{ Math.abs(deltaValue) }}</MetroTextBlock>
			</h2>
			<hr class="statcard-hr mb-0">
		</div>
		<canvas width="520" height="175" data-chart="sparkline" :data-dataset="`[[${dataset}]]`" :data-labels="`[${labels || dataset}]`" :data-dataset-options="`[{borderColor: '${systemAccentColor}', backgroundColor:'transparent'}]`" class="sparkline" ref="canvas" />
	</div>
</template>

<style lang="less">
.statcard {
	position: relative;
	overflow: hidden;
	border-radius: 6px;
	box-shadow: 0 0 0 1px var(--base-low);
	
	.statcard-description {
		text-transform: uppercase;
	}
	
	.statcard-number {
		span {
			display: inline-block;
			font-size: 34px;
			font-weight: 200;
			margin-bottom: 12px;
		}
	}
	
	.delta-indicator {
		display: inline-block;
		padding: 0.4em;
		font-size: 12px;
		vertical-align: middle;
		
		&:before {
			font-family: "Segoe MDL2 Assets";
			font-size: 8pt;
			margin-right: 4px;
		}
		
		&.delta-negative {
			color: #E64759;
			
			&:before {
				content: "\E74B";
			}
		}
		&.delta-neutral {
			color: var(--base-high);
			
			&:before {
				font-family: "Segoe UI";
				content: "\00B1";
			}
		}
		&.delta-positive {
			color: #1BC98E;
			
			&:before {
				content: "\E74A";
			}
		}
	}
	
	.statcard-hr {
		box-shadow: 0 1px 0 0 var(--base-low);
		height: 1px;
		margin: 0 -1rem;
	}
	
	canvas {
		width: 260px;
		height: 83px;
		display: block;
	}
}
</style>

<script>
export default {
	name: "Statcard",
	props: ["name", "dataset", "labels"],
	mounted() {
		
		Charts["sparkline"](this.$refs["canvas"])
	},
	computed: {
		systemAccentColor() {
			return getComputedStyle(document.body).getPropertyValue("--system-accent-color")
		},
		systemAccentColorLow() {
			const [r, g, b] = this.systemAccentColor.match(/\w\w/g).map(x => parseInt(x, 16));
			return `rgba(${r},${g},${b},0.15)`;
		},
		
		currentValue() {
			return this.dataset[this.dataset.length - 1];
		},
		deltaValue() {
			if (this.dataset.length <= 1) return NaN;
			return this.dataset[this.dataset.length - 1] - this.dataset[this.dataset.length - 2];
		}
	},
	filters: {
		number(value) {
			return new Intl.NumberFormat("en-US").format(value)
		}
	}
}
</script>
