<template>
	<div class="grid-view">
		<div class="grid-view-item media-selector" @dragenter="dragIn" @dragover="dragIn" @dragleave="dragOut" @drop="dropFile" ref="container">
			<input type="file" ref="file-selector" accept="image/png,image/jpeg" @change="fileChanged" />
			<template v-if="!selectedImageBlob && !value">
				<div class="grid-view-item-content add-button" @click="openFileSelector" />
			</template>
			
			<template v-else>
				<div class="media-container">
					<div class="media-preview">
						<img :src="selectedImageBlob" v-if="selectedImageBlob" />
						<img :src="defaultImgSrc" v-if="!selectedImageBlob" />
					</div>
					
					<div class="media-toolbar">
						<MetroStackPanel orientation="horizontal" horizontal-alignment="right">
							<MetroAppBarButton icon="delete" :label="$t('app.actions.delete')" @click="_deleteFile" />
						</MetroStackPanel>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import * as BlobUtil from 'blob-util'

export default {
	name: "MediaItemSelector",
	props: {
		value: null,
		defaultImgSrc: String
	},
	data: () => ({
		selectedImageBlob: null
	}),
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
		},
		
		
		_handleFile(file) {
			const reader = new FileReader();
			reader.onload = (progress) => {
				const blob = window.URL.createObjectURL(BlobUtil.arrayBufferToBlob(progress.target.result));
				this.selectedImageBlob = blob;
			}
			reader.readAsArrayBuffer(file);
			
			this.$emit("input", file.type)
			this.$emit("fileChanged", file)
		},
		async _deleteFile() {
			let confirmDialog = new metroUI.ContentDialog({
				title: this.$t('package_editor.media.delete_item_title'),
				content: this.$t('package_editor.media.delete_item_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await confirmDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				this.selectedImageBlob = null;
				this.$refs["file-selector"].value = null;
				
				this.$emit("input", null);
				this.$emit("fileChanged", null);
			}
		},
	}
}
</script>

<style lang="less">
.grid-view-item.media-selector {
	align-self: initial;
	
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
		
		.media-toolbar {
			padding: 0 2px 2px;
		}
	}
}
</style>