<template>
	<div class="file-selector">
		<input type="file" ref="file-selector" @change="fileChanged" accept="application/x-deb,application/x-debian-package,application/zip,application/gzip" :required="required" />
		
		<MetroTextBlock v-if="header" style="margin-bottom: 4px">{{ header }}</MetroTextBlock>
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center">
			<MetroButton @click="openFileSelector">{{ content }}</MetroButton>
			<MetroTextBlock style="margin-left: 12px" v-if="selectedFile">{{ selectedFile.name }} ({{ selectedFile.size | filesize }})</MetroTextBlock>
		</MetroStackPanel>
	</div>
</template>

<script>
export default {
	name: "FileSelector",
	props: {
		value: null,
		required: Boolean,
		header: String,
		content: String
	},
	data: () => ({
		selectedFile: null
	}),
	methods: {
		openFileSelector() {
			this.$refs["file-selector"].click();
		},
		fileChanged(e) {
			this._handleFile(e.target.files[0]);
		},
		
		_handleFile(file) {
			this.selectedFile = file;
			this.$refs["file-selector"].dispatchEvent(new Event("input"));
			this.$emit("input", file);
		}
	},
	filters: {
		filesize(size) {
			if (isNaN(size)) { size = 0 }
			if (size < 1024) { return size + ' B' }
			if ((size /= 1024) < 1024) { return size.toFixed(0) + ' KB' }
			if ((size /= 1024) < 1024) { return size.toFixed(2) + ' MB' }
		}
	}
}
</script>

<style lang="less">
.file-selector {
	input[type="file"] {
		position: absolute;
		top: -9999px;
		left: -9999px;
		display: none;
	}
}
</style>