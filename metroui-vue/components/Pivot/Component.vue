<template>
	<div class="pivot">
		<div class="title-content" v-if="title || this.$slots['title']">
			<MetroTextBlock v-if="title && !this.$slots['title']" :text="title" />
			<slot name="title" />
		</div>
		
		<div class="pivot-header">
			<div class="left-header" v-if="this.$slots['left-header']">
				<slot name="left-header" />
			</div>
			<div class="header-clipper" ref="header-clipper">
				<div class="pivot-header-item"
					:class="{'selected': currentItem === _uuid}"
					:data-item-uuid="_uuid" v-for="(_uuid, index) in Object.keys(headerItems)"
					:key="index"
					:disabled="headerItems[_uuid].disabled"
					@click="navigate(_uuid)">
					<MetroTextBlock :text="headerItems[_uuid].header" />
				</div>
			</div>
			<div class="right-header" v-if="this.$slots['right-header']">
				<slot name="right-header" />
			</div>
		</div>
		
		<div class="pivot-items" ref="pivot-items">
			<slot />
		</div>
	</div>
</template>

<script>
import uuid from 'uuid/v4'

export default {
	name: "MetroPivot",
	props: {
		title: String
	},
	data() {
		return {
			items: {},
			headerItems: {},
			itemOrder: [],
			currentItem: null
		}
	},
	created() {
		this.headerItems = this.$slots.default.reduce((out, node) => {
			let _uuid = uuid();
			node.__uuid__ = _uuid;
			
			out[_uuid] = {
				header: node.componentOptions.propsData.header,
				disabled: node.componentOptions.propsData.disabled
			}
			this.itemOrder.push(_uuid);
			
			return out;
		}, {});
	},
	mounted() {
		this.items = this.$slots.default.reduce((out, node) => ({
			...out,
			[node.__uuid__]: node.elm
		}), {});
		
		if (this.itemOrder.length) {
			this.navigate(this.itemOrder[0]);
		}
	},
	methods: {
		async navigate(itemUuid) {
			const pivot = this;
			
			if (!this.items[itemUuid]) return;
			
			if (this.currentItem) {
				let currentIndex = this.itemOrder.indexOf(this.currentItem);
				let navigateIndex = this.itemOrder.indexOf(itemUuid);
				
				if (navigateIndex === currentIndex) return;
				
				let previousItem = this.currentItem;
				this.currentItem = itemUuid
				
				if (navigateIndex > currentIndex) {
					this.items[previousItem].classList.add("item-out-right-left");
					
					await new Promise(resolve => setTimeout(() => {
						this.items[previousItem].classList.remove("item-active");
						this.items[previousItem].classList.remove("item-out-right-left");
						
						this.items[itemUuid].classList.add("item-active");
						this.items[itemUuid].classList.add("item-in-right-left");
						resolve();
					}, 200));
				} else if (navigateIndex <= currentIndex) {
					this.items[previousItem].classList.add("item-out-left-right");
					
					await new Promise(resolve => setTimeout(() => {
						this.items[previousItem].classList.remove("item-active");
						this.items[previousItem].classList.remove("item-out-left-right");
						
						this.items[itemUuid].classList.add("item-active");
						this.items[itemUuid].classList.add("item-in-left-right");
						resolve();
					}, 200));
				}
				
				setTimeout(() => {
					this.items[itemUuid].classList.remove("item-in-right-left");
					this.items[itemUuid].classList.remove("item-in-left-right");
				}, 400)
			} else {
				this.currentItem = itemUuid;
				
				this.items[itemUuid].classList.add("item-active");
				this.items[itemUuid].classList.add("item-in-right-left");
				
				await new Promise(resolve => setTimeout(() => {
					this.items[itemUuid].classList.remove("item-in-right-left");
					resolve();
				}, 500));
			}
		}
	}
}
</script>
