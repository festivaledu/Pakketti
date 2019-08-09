<template>
	<div :class="`command-bar ${isOpen ? 'expanded' : 'collapsed'}`">
		<div class="command-bar-content">
			<div class="content" v-if="this.$slots['content']">
				<slot name="content" />
			</div>
			
			<div class="primary-commands">
				<MetroStackPanel orientation="horizontal">
					<slot v-if="!this.$slots['primary-commands']" />
					<slot name="primary-commands" />
				</MetroStackPanel>
			</div>
			
			<div class="more-button" @click="toggle">
				<MetroSymbolIcon symbol="more" />
			</div>
		</div>
		
		<div class="secondary-commands" v-if="this.$slots['secondary-commands']">
			<MetroStackPanel orientation="vertical">
				<slot name="secondary-commands" />
			</MetroStackPanel>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroCommandBar",
	data() {
		return {
			isOpen: false
		}
	},
	mounted() {
		this.$el.querySelectorAll(".app-bar-button").forEach(item => {
			item.addEventListener("click", this.close);
		});
	},
	methods: {
		toggle() {
			this.isOpen = !this.isOpen;
		},
		open() {
			this.isOpen = true;
		},
		close() {
			this.isOpen = false;
		}
	}
}
</script>
