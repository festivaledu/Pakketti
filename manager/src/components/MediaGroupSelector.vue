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
							:disabled="disabled"
							@click="_deleteFile(mediaObj)"
						/>
					</MetroStackPanel>
				</div>
			</div>
		</div>
		
		<div class="grid-view-item media-item" :class="{'disabled': disabled}" @dragenter="dragIn" @dragover="dragIn" @dragleave="dragOut" @drop="dropFile" ref="container">
			<input type="file" ref="file-selector" accept="image/png,image/jpeg" @change="fileChanged" multiple="multiple" />
			<div class="grid-view-item-content add-button" :class="{'disabled': disabled}" @click="openFileSelector" />
		</div>
	</div>
</template>

<script>
import * as BlobUtil from 'blob-util'
import crypto from "crypto-js"

export default {
	name: "MediaGroupSelector",
	props: {
		value: null,
		defaultImgSrc: String,
		disabled: Boolean
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
			let allowUpload = true
			let files = [...e.target.files];
			
			this.$refs["file-selector"].value = null;

			for (var file in files) {
				let sha256 = crypto.SHA256(files[file]).toString(crypto.enc.hex);

				if (this.value.find(screenshotObj => screenshotObj.sha256 == sha256)) {
					allowUpload = false;
					break;
				}
			}
			
			if (!allowUpload) {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.media.screenshot_upload_error_title'),
					content: this.$t('package_editor.media.screenshot_upload_error_message_multiple'),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
				
				return;
			}
			
			files.forEach(file => {
				this._handleFile(file);
			});
		},
		
		_handleFile(file) {
			this.$emit("fileChanged", file)
		},
		async _deleteFile(mediaObj) {
			let confirmDialog = new metroUI.ContentDialog({
				title: this.$t('package_editor.media.delete_item_title'),
				content: this.$t('package_editor.media.delete_item_body'),
				commands: [{ text: this.$t('app.cancel') }, { text: this.$t('app.ok'), primary: true }]
			});
			
			if (await confirmDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
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
	
	&.disabled {
		pointer-events: none;
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
		
		&.disabled {
			opacity: 0.4;
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