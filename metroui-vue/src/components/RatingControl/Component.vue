<template>
	<div class="rating-control" @mouseleave="setHoverValue(0)">
		<input type="number" min="1" max="5" :name="name" :required="required" v-model="$data._value" readonly />
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left">
			<div style="width: 22px; height: 22px;" v-for="(_, index) in Array(5)" :key="`bg_${index}`" @mouseenter="setHoverValue(index + 1)" @click="setValue(index + 1)">
				<MetroSymbolIcon icon="favorite-star-fill" />
			</div>
		</MetroStackPanel>
		
		<div class="foreground-content" :class="{'colored': $data._value > 0}">
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" v-if="!hoverValue && $data._value >= 0">
				<MetroSymbolIcon icon="favorite-star-fill" v-for="(_, index) in Array($data._value)" :key="`fg_${index}`" />
			</MetroStackPanel>
			<MetroStackPanel orientation="horizontal" horizontal-alignment="left" v-if="hoverValue >= 0">
				<MetroSymbolIcon icon="favorite-star-fill" :class="{'hover-state': index === hoverValue - 1}" v-for="(_, index) in Array(hoverValue)" :key="`fg_${index}`" />
			</MetroStackPanel>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroRatingControl",
	props: {
		name: String,
		value: {
			type: Number,
			default: -1
		},
		required: Boolean,
	},
	data() {
		return {
			_value: this.$props.value,
			hoverValue: 0
		}
	},
	methods: {
		setHoverValue(value) {
			this.hoverValue = value
		},
		setValue(value) {
			this.$data._value = value;
			this.$emit("input", this.$data._value);
		}
	}
}
</script>
