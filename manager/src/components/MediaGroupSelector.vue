<template>
	<div class="grid-view">
		<div class="grid-view-item media-item" v-for="(mediaObj) in value" :key="mediaObj.id">
			<div class="media-container">
				<div class="media-preview">
					<img :src="`${defaultImgSrc}/${mediaObj.id}`" />
				</div>
				
				<div class="media-toolbar">
					<MetroStackPanel orientation="horizontal" horizontal-alignment="right">
						<MetroAppBarButton
							icon="delete"
							:label="$t('app.actions.delete')"
							@click="_deleteFile(mediaObj)"
						/>
					</MetroStackPanel>
				</div>
			</div>
		</div>
		
		<div class="grid-view-item media-item" @dragenter="dragIn" @dragover="dragIn" @dragleave="dragOut" @drop="dropFile" ref="container">
			<input type="file" ref="file-selector" accept="image/png,image/jpeg" @change="fileChanged" />
			<div class="grid-view-item-content add-button" @click="openFileSelector" />
		</div>
	</div>
</template>

<script>
import * as BlobUtil from 'blob-util'

export default {
	name: "MediaGroupSelector",
	props: {
		value: null,
		defaultImgSrc: String
	},
	methods: {
		dragIn(e) {
			e.preventDefault();
			e.stopPropagation();
			
			this.$refs["container"].classList.add("drop-available");
		},
		dragOut(e) {
			e.preventDefault();
			e.stopPropagation();
			
			this.$refs["container"].classList.remove("drop-available");
		},
		dropFile(e) {
			e.preventDefault();
			e.stopPropagation();
			
			this.$refs["container"].classList.remove("drop-available");
			
			let file = e.dataTransfer.files[0];
			if (["image/jpeg", "image/png"].includes(file.type)) this._handleFile(file);
		},
		
		openFileSelector() {
			this.$refs["file-selector"].click();
		},
		fileChanged(e) {
			this._handleFile(e.target.files[0]);
			this.$refs["file-selector"].value = null;
		},
		
		_handleFile(file) {
			// const reader = new FileReader();
			// reader.onload = (progress) => {
			// 	const blob = window.URL.createObjectURL(BlobUtil.arrayBufferToBlob(progress.target.result));
			// 	this.selectedImageBlob = blob;
			// }
			// reader.readAsArrayBuffer(file);
			
			this.$emit("fileChanged", file)
		},
		async _deleteFile(mediaObj) {
			let confirmDialog = new metroUI.ContentDialog({
				title: "Delete this item?",
				content: "<p>Are you sure you want to delete this item?<br>This action cannot be undone.</p>",
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await confirmDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
			// 	this.selectedImageBlob = null;
				this.$refs["file-selector"].value = null;
				
				this.$emit("fileDeleted", mediaObj);
			}
		},
	}
}
</script>

<style lang="less">
.grid-view-item.media-item {
	align-self: normal;
	
	input[type="file"] {
		position: absolute;
		visibility: hidden;
	}
	
	&.drop-available {
		box-shadow: inset 0 0 0 2px #00FF00;
	}
	
	&::before {
		content: '';
		display: block;
		padding-top: 100%;
	}
	
	.grid-view-item-content.add-button {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		
		&:after {
			content: "\E710";
			font-family: "Segoe MDL2 Assets";
			font-size: 48px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
		}
	}
	
	.media-container {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		
		.media-preview {
			flex: 1 0 auto;
			flex-basis: 0;
			overflow: hidden;
			padding: 8px;
			text-align: center;
			
			img {
				max-width: 100%;
				max-height: 100%;
			}
		}
	}
}
</style>