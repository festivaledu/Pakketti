<template>
	<div class="data-grid">
		<div class="data-grid-wrapper">
		<div class="table">
			<div class="column-headers-border"></div>
			<div class="tr column-headers">
				<div class="th column-header-item" v-for="(column, index) in columnNameList" :key="index">{{ column }}</div>
			</div>
			
			<div class="row-wrapper" v-for="(item, index) in itemsSource" :key="index">
				<div class="tr row" >
					<div class="td cell" v-for="key in columnKeys" :key="index + key">
						<MetroCheckbox v-if="typeof item[key] === 'boolean'" :value="item[key]" />
						<span v-else>{{ item[key] }}</span>
					</div>
				</div>
				<div class="row-background" :style="`top: ${(index + 1) * 32}px`"></div>
			</div>
		</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroDataGrid",
	props: {
		itemsSource: Array,
		columnNames: Object
	},
	computed: {
		columnKeys() {
			return this.$props.itemsSource.reduce((out, item) => {
				Object.keys(item).forEach(key => {
					if (out.indexOf(key) < 0) out.push(key);
				});
				
				return out;
			}, []);
		},
		columnNameList() {
			if (!this.$props.itemsSource || !this.$props.itemsSource.length) return [];
			
			if (this.$props.columnNames) {
				if (this.$props.columnNames instanceof Array) return this.$props.columnNames;
				
				let _existingKeys = this.$props.itemsSource.reduce((out, item) => {
					Object.keys(item).forEach(key => {
						out[key] = key;
					});
					
					return out;
				}, {});
				
				
				let _columnNames = [];
				Object.keys(_existingKeys).forEach(key => {
					if (!this.$props.columnNames[key] && _columnNames.indexOf(key) < 0) _columnNames.push(key);
					if (this.$props.columnNames[key] && _columnNames.indexOf(this.$props.columnNames[key]) < 0) _columnNames.push(this.$props.columnNames[key]);
				});
				
				return _columnNames;
			}
			
			
			return this.columnKeys;
		}
	}
}
</script>
