<template>
	<div class="grid-view-item media-selector" @dragenter="dragIn" @dragover="dragIn" @dragleave="dragOut" @drop="dropFile">
		<template v-if="!selectedImageBlob">
			<div class="grid-view-item-content add-button" />
		</template>
		
		<template v-else>
			<div class="media-container">
				<div class="media-preview">
					<img :src="selectedImageBlob" />
				</div>
				<div class="media-toolbar">
					
					<MetroStackPanel orientation="horizontal" horizontal-alignment="right">
						<MetroAppBarButton icon="delete" label="Delete" />
					</MetroStackPanel>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="less">
.grid-view-item.media-selector {
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
		pointer-events: none;
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
		margin-top: -100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		
		.media-preview {
			padding: 8px;
			text-align: center;
			
			img {
				max-width: 100%;
			}
		}
	}
}
</style>

<script>
import * as BlobUtil from 'blob-util'

export default {
	name: "MediaSelector",
	props: {
		value: null
	},
	data: () => ({
		selectedImageBlob: null
	}),
	methods: {
		dragIn(e) {
			e.preventDefault();
			e.stopPropagation();
			
			console.log("drag");
			e.target.classList.add("drop-available");
		},
		dragOut(e) {
			e.preventDefault();
			e.stopPropagation();
			
			console.log("drag");
			e.target.classList.remove("drop-available");
		},
		dropFile(e) {
			e.preventDefault();
			e.stopPropagation();
			
			console.log("drop");
			e.target.classList.remove("drop-available");
			
			let file = e.dataTransfer.files[0];
			if (["image/jpeg", "image/png"].includes(file.type)) this._handleFile(file);
		},
		
		_handleFile(file) {
			console.log(file);
			
			const reader = new FileReader();
			reader.onload = (progress) => {
				const blob = window.URL.createObjectURL(BlobUtil.arrayBufferToBlob(progress.target.result));
				this.selectedImageBlob = blob;
			}
			reader.readAsArrayBuffer(file);
			
			this.$emit("input", file.type)
			this.$emit("fileChosen", file)
		}
	}
}
</script>