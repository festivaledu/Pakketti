<template>
	<div :class="`navigation-view ${$data._paneDisplayMode}`">
		<MetroStackPanel class="pane-toggle-button-container" horizontal-alignment="left" :class="{'collapsed': collapsed, 'expanded': expanded}">
			<MetroButton class="navigation-view-back-button" v-if="backButtonVisible" :disabled="history.length <= 1" @click="goBack">
				<MetroSymbolIcon symbol="back" />
			</MetroButton>
			<MetroButton class="toggle-pane-button" :class="{'fill': paneTitle}" @click="togglePane">
				<MetroSymbolIcon symbol="global-navigation-button" />
			</MetroButton>
		</MetroStackPanel>
			
		<div class="pane-content acrylic acrylic-80" :class="{'collapsed': collapsed, 'expanded': expanded, 'back-button-visible': backButtonVisible}">
			<MetroStackPanel class="pane-toggle-button-container" horizontal-alignment="left" :class="{'collapsed': collapsed, 'expanded': expanded}">
				<MetroButton class="toggle-pane-button" :class="{'fill': paneTitle}" @click="togglePane">
					<MetroSymbolIcon symbol="global-navigation-button" />
				</MetroButton>
			</MetroStackPanel>
			
			<MetroStackPanel orientation="horizontal" vertical-alignment="center" class="pane-title" v-if="paneTitle">
				<MetroTextBlock text-style="base" :text="paneTitle" />
			</MetroStackPanel>
			
			<MetroStackPanel orientation="horizontal" vertical-alignment="center" class="auto-suggest-area" v-if="this.$slots['auto-suggest-box']">
				<slot name="auto-suggest-box" />
				
				<MetroButton class="auto-suggest-button" @click="focusAutoSuggest">
					<MetroSymbolIcon symbol="find" />
				</MetroButton>
			</MetroStackPanel>
			
			<MetroStackPanel class="menu-items" vertical-alignment="top" ref="menu-items">
				<slot name="menu-items" />
			</MetroStackPanel>
			
			<MetroStackPanel class="footer-content" vertical-alignment="top" v-if="settingsVisible || this.$slots['pane-footer']" ref="footer-content" >
				<slot name="pane-footer" />
				<MetroNavigationViewItem ref="settings-nav-pane-item" v-if="settingsVisible" icon="setting" content="Settings" page-id="settings" />
			</MetroStackPanel>
		</div>
		
		<div class="content-root">
			<div class="header-content" :class="{'back-button-visible': backButtonVisible}" v-if="headerText || this.$slots['header']">
				<slot name="header" :local="headerText" />
				<MetroTextBlock v-if="this.$slots['header'] === null" :text="headerText" />
			</div>
			
			<div class="content-frame" ref="content-frame">
				<slot />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroNavigationView",
	props: {
		settingsVisible: {
			type: Boolean,
			default: true
		},
		backButtonVisible: {
			type: Boolean,
			default: true
		},
		paneTitle: String,
		header: null,
		paneDisplayMode: {
			type: String,
			default: "",
			validator: value => {
				return ["left", "left-compact", "left-minimal", "top", ""].indexOf(value) >= 0
			}
		}
	},
	data() {
		return {
			headerText: this.$props.header,
			
			collapsed: false,
			expanded: false,
			_paneDisplayMode: this.$props.paneDisplayMode,
			minimal: this.$props.paneDisplayMode === "left-minimal",
			top: this.$props.paneDisplayMode === "top",
			
			menuItems: {},
			pages: {},
			currentPage: null,
			history: []
		}
	},
	mounted() {
		const nav = this;
		
		this.$refs["content-frame"].querySelectorAll(".page").forEach(item => {
			if (item.hasAttribute("data-page-id")) {
				if (this.pages[item.getAttribute("data-page-id")]) {
					throw new Error("NavigationView pages must have unique identifiers!");
				}
				
				this.pages[item.getAttribute("data-page-id")] = item;
			}
		});
		
		this.$refs["menu-items"].$el.querySelectorAll(".navigation-view-item").forEach(item => {
			if (item.hasAttribute("data-page-id")) {
				if (this.menuItems[item.getAttribute("data-page-id")]) {
					throw new Error("NavigationView menu items must have unique identifiers!");
				}
				
				this.menuItems[item.getAttribute("data-page-id")] = item;
				
				item.addEventListener("click", () => {
					this.navigate(item.getAttribute("data-page-id"));
					
					this.$emit("selectionChanged", item, {
						selectedItem: item,
						isSettingsSelected: item === this.$refs["settings-nav-pane-item"]
					});

					if ((this.$data._paneDisplayMode === "left-compact" || this.$data._paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.$data._paneDisplayMode !== "left")) {
						this.expanded = false
					}
				});
			}
		});
			
		if (this.$refs["footer-content"]) {
			this.$refs["footer-content"].$el.querySelectorAll(".navigation-view-item").forEach(item => {
				if (item.__vue__.$props.pageId) {
					if (this.menuItems[item.__vue__.$props.pageId]) {
						throw new Error("NavigationView menu items must have unique identifiers!");
					}
					
					this.menuItems[item.__vue__.$props.pageId] = item;
					
					item.addEventListener("click", () => {
						if ((this.$data._paneDisplayMode === "left-compact" || this.$data._paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.$data._paneDisplayMode !== "left")) {
							this.expanded = false
							
							setTimeout(() => {
								this.navigate(item.__vue__.$props.pageId);
							}, 350)
						} else {
							this.navigate(item.__vue__.$props.pageId);
						}
						
						nav.$emit("selectionChanged", item, {
							selectedItem: item,
							isSettingsSelected: item === this.$refs["settings-nav-pane-item"].$el
						});
					});
				}
			});
		}
	},
	methods: {
		async navigate(pageId, data = {}) {
			if (this.currentPage === pageId) return;
			if (!this.pages[pageId]) return;
			
			if (this.history.lastObject() !== pageId) this.history.push(pageId);
			
			if (this.menuItems[pageId]) {
				if (this.menuItems[this.currentPage]) this.menuItems[this.currentPage].classList.remove("selected");
				
				this.menuItems[pageId].classList.add("selected");
			}
			
			if (this.currentPage) {
				this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatingFrom"));
				this.pages[this.currentPage].classList.add("page-fade-out");
				
				await new Promise(resolve => setTimeout(() => {
					this.pages[this.currentPage].classList.remove("page-fade-out");
					this.pages[this.currentPage].classList.remove("page-active");
					
					resolve();
				}, 150));
				this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatedFrom"));
			}
			
			this.pages[pageId].dispatchEvent(new CustomEvent("navigatingTo"));
			this.currentPage = pageId;
			
			this.pages[pageId].classList.add("page-active");
			this.pages[pageId].classList.add("page-slide-in");
			
			setTimeout(() => {
				this.pages[pageId].classList.remove("page-slide-in");
			}, 400);
			
			this.pages[pageId].dispatchEvent(new CustomEvent("navigatedTo", {
				detail: {
					...data,
					pageId: pageId
				}
			}));
		},
		async goBack() {
			if (this.history.length <= 1) return;
			
			let lastPage = this.history[this.history.length - 2];
			this.history.pop();

			if (!this.pages[lastPage] || this.currentPage === lastPage) return;
			
			if (this.menuItems[lastPage]) {
				if (this.menuItems[this.currentPage]) this.menuItems[this.currentPage].classList.remove("selected");
				
				this.menuItems[lastPage].classList.add("selected");
			}
			
			if (this.currentPage) {
				this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatingBackFrom"));
				this.pages[this.currentPage].classList.add("page-slide-out");
				
				await new Promise(resolve => setTimeout(() => {
					this.pages[this.currentPage].classList.remove("page-slide-out");
					this.pages[this.currentPage].classList.remove("page-active");
					
					resolve();
				}, 350));
				this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatedBackFrom"));
			}
			
			this.pages[lastPage].dispatchEvent(new CustomEvent("navigatingBackTo"));
			this.currentPage = lastPage;
			
			this.pages[lastPage].classList.add("page-active");
			this.pages[lastPage].classList.add("page-fade-in");
			
			setTimeout(() => {
				this.pages[lastPage].classList.remove("page-fade-in");
			}, 150);
			
			// this.pages[lastPage].__vue__.$emit("loaded", this.pages[lastPage], {
			// 	pageId: lastPage
			// });
			this.pages[lastPage].dispatchEvent(new CustomEvent("navigatedBackTo"));
		},
		setHeader(headerText) {
			this.headerText = headerText;
		},
		setSelectedMenuItem(pageId) {
			Object.values(this.menuItems).forEach(menuItem => {
				menuItem.classList.remove("selected");
			});
				
			if (this.menuItems[pageId]) {
				this.menuItems[pageId].classList.add("selected");
			}
		},
		
		togglePane() {
			if ((this.$data._paneDisplayMode === "left-compact" || this.$data._paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.$data._paneDisplayMode !== "left")) {
				this.expanded = !this.expanded
			} else {
				this.collapsed = !this.collapsed
			}
		},
		focusAutoSuggest() {
			if (!this.$el.querySelector(".auto-suggest-area input")) return;
			
			if (window.innerWidth < 1008) {
				this.expanded = true
			} else {
				this.collapsed = false
			}
			
			const nav = this;
			setTimeout(() => {
				!this.$el.querySelector(".auto-suggest-area input").focus();
			}, 0);
		},
		setPaneDisplayMode(displayMode) {
			this.$data._paneDisplayMode = displayMode;
			this.minimal = (displayMode === "left-minimal");
			this.top = (displayMode === "top");
		}
	}
}
</script>
