<template>
	<div class="page" :class="{'flex-container': this.$slots['top-app-bar'] || this.$slots['bottom-app-bar']}" :data-page-id="pageId">
		<div class="top-app-bar" v-if="this.$slots['top-app-bar']">
			<slot name="top-app-bar" />
		</div>
		
		<div class="page-content">
			<slot />
		</div>
		
		<div class="bottom-app-bar" v-if="this.$slots['bottom-app-bar']">
			<slot name="bottom-app-bar" />
		</div>
	</div>
</template>

<script>
const elementIsParentOfPage = (element, page) => {
	var node = element;
	while (node) {
		if (node.classList.contains("page")) break;
		node = node.parentNode;
	}
	return (node && node == page.container);
}

HTMLElement.prototype.parentNodeOfClass = function(className) {
	var node = this.parentNode;
	while (node) {
		// console.log(node);
		if (node.classList && node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode
	}
	
	return null;
}



export default {
	name: "MetroPage",
	data() {
		return {
			container: null,
			params: {
				parentView: null,
				parentPage: null,
				isPrimaryPage: false,
				title: null
			},
			_scrollTop: null
		}
	},
	props: {
		pageId: String,
		title: String,
		isPrimaryPage: Boolean
	},
	mounted() {
		let page = this;
		page.container = this.$el;
		
		for (var param in this.$props) {
			page.params[param] = this.$props[param];
		}
		
		if (page.params.isPrimaryPage) {
			page.container.classList.add("page-active");
		}
		
		page._scrollTop = null;
		
		// Accent Color Selector
		page.accentColorSelectors = [];
		
		page.querySelectorAll("div.accent-color-selector").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.accentColorSelectors.push(item.__vue__);
			}
		});
		
		// Auto Suggest
		page.autoSuggestBoxes = [];

		page.querySelectorAll("div.auto-suggest").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.autoSuggestBoxes.push(item.__vue__);
			}
		});
		
		// Background Theme Selector
		page.backgroundThemeSelectors = [];
		
		page.querySelectorAll("div.background-theme-selector").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.backgroundThemeSelectors.push(item.__vue__);
			}
		});
		
		// CommandBar
		page.commandBars = [];
		
		page.querySelectorAll("div.command-bar").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.commandBars.push(item.__vue__);
			}
		});
		
		// Lists
		page.lists = [];

		page.querySelectorAll("div.list").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.lists.push(item.__vue__);
			}
		});
		
		// Messages
		page.messages = [];
		
		page.querySelectorAll("div.messages-container").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.messages.push(item.__vue__);
			}
		});
		
		// Navigation View
		page.navigationView = null;
		if (page.querySelector("div.navigation-view")) {
			let navView = page.querySelector("div.navigation-view");
			
			if (elementIsParentOfPage(navView, page)) {
				/*page.navigationView = new metroUI.NavigationView(page.querySelector("div.navigation-view"), {
					parentView: page.params.parentView,
					parentPage: page
				})*/
				page.navigationView = navView.__vue__;
			}
		}
		
		// PersonPicture
		page.personPictures = [];

		page.querySelectorAll("div.person-picture").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.personPictures.push(item.__vue__);
			}
		});
		
		// Pivot
		page.pivot = [];
		
		page.querySelectorAll("div.pivot").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.pivot.push(item.__vue__);
			}
		});
		
		// Progress Bars
		page.progressBars = [];

		page.querySelectorAll("div.progress:not(.indeterminate)").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.progressBars.push(item.__vue__);
			}
		});
		
		// Sliders
		page.sliders = [];

		page.querySelectorAll("div.slider").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.sliders.push(item.__vue__);
			}
		});

		// Switches
		page.switches = [];

		page.querySelectorAll("div.toggle-switch").forEach((item, index) => {
			if (elementIsParentOfPage(item, page)) {
				page.switches.push(item.__vue__);
			}
		});
	},
	methods: {
		show() {
			let page = this;

			if (page.params.parentPage) {
				page.params.parentPage.querySelectorAll(".page").forEach((item) => {
					if (item == page.container) {
						item.classList.add("page-active");
						item.dispatchEvent(new Event("pageShow"));
					} else if (item.parentNodeOfClass("page") == page.container.parentNodeOfClass("page") && item.classList.contains("page-active")) {
						item.classList.remove("page-active");
						item.dispatchEvent(new Event("pageHide"));
					}
				});
			} else if (page.params.parentView) {
				page.params.parentView.querySelectorAll(".pages > .page").forEach((item) => {
					if (item == page.container) {
						item.classList.add("page-active");
						item.dispatchEvent(new Event("pageShow"));
					} else if (item.parentNodeOfClass("page") == page.container.parentNodeOfClass("page") && item.classList.contains("page-active")) {
						item.classList.remove("page-active");
						item.dispatchEvent(new Event("pageHide"));
					}
				});
			}
		},
		hide() {
			this.container.classList.remove("page-active");
			this.container.dispatchEvent(new Event("pageHide"));
		},
		isVisible() {
			return this.container.classList.contains("page-active");
		},
		pageData() {
			const page = this;
			
			return {
				id: page.container.getAttribute("data-page-id"),
				container: page.container,
				view: page.params.parentView,
				parentPage: page.params.parentPage,
				title: page.params.title
			}
		},
		
		querySelector(query) {
			return this.container.querySelector(query);
		},
		querySelectorAll(query) {
			return this.container.querySelectorAll(query);
		}
	}
}
</script>
