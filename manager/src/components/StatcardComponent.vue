<template>
	<div class="statcard">
		<div class="px-3 pt-3">
			<p class="statcard-desc caption">{{name}}</p>
			<h2 class="statcard-number">
				<span>1,337</span>
				<small class="delta-indicator delta-negative">-118</small>
			</h2>
			<hr class="statcard-hr m-b-0">
		</div>
		<canvas width="520" height="175" data-chart="spark-line" :data-dataset="`[[${dataset}]]`" :data-labels="`[${labels || dataset}]`" :data-dataset-options="`[{borderColor: '${systemAccentColor}', backgroundColor:'${systemAccentColorLow}'}]`" class="sparkline" ref="canvas" />
	</div>
</template>

<style lang="less">
.statcard {
	position: relative;
	overflow: hidden;
	border-radius: 6px;
	box-shadow: 0 0 0 1px var(--base-low);
	
	.statcard-desc {
		text-transform: uppercase;
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
		// this.$refs["canvas"]
		Charts["spark-line"](this.$refs["canvas"])
	},
	computed: {
		systemAccentColor() {
			return getComputedStyle(document.body).getPropertyValue("--system-accent-color")
		},
		systemAccentColorLow() {
			const [r, g, b] = this.systemAccentColor.match(/\w\w/g).map(x => parseInt(x, 16));
			return `rgba(${r},${g},${b},0.15)`;
		}
	}
}
</script>
