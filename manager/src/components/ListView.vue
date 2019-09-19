<template>
	<div :class="`list-view ${paneDisplayMode}`">			
		<div class="pane-content" :class="{'collapsed': collapsed, 'expanded': expanded}">
			
			<MetroStackPanel orientation="horizontal" vertical-alignment="center" class="pane-title" v-if="paneTitle">
				<MetroTextBlock text-style="base" :text="paneTitle" />
			</MetroStackPanel>
			
			<MetroStackPanel class="menu-items" vertical-alignment="top" ref="menu-items">
				<slot name="menu-items" />
			</MetroStackPanel>
			
			<MetroStackPanel class="footer-content" vertical-alignment="top" v-if="this.$slots['pane-footer']" ref="footer-content" >
				<slot name="pane-footer" />
			</MetroStackPanel>
		</div>
		
		<div class="content-root">
			<div class="header-content" v-if="headerText">
				<MetroTextBlock :text="headerText" />
			</div>
			
			<div class="content-frame" ref="content-frame">
				<slot />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "MetroListView",
	props: {
		paneTitle: String,
		header: null,
		paneDisplayMode: {
			type: String,
			default: "",
			validator: value => {
				return ["left", "left-compact", "left-minimal", ""].indexOf(value) >= 0
			}
		}
	},
	data() {
		return {
			headerText: this.$props.header,
			
			collapsed: false,
			expanded: false,
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
					throw new Error("ListView pages must have unique identifiers!");
				}
				
				this.pages[item.getAttribute("data-page-id")] = item;
			}
		});
		
		this.$refs["menu-items"].$el.querySelectorAll(".list-view-item").forEach(item => {
			if (item.hasAttribute("data-page-id")) {
				if (this.menuItems[item.getAttribute("data-page-id")]) {
					throw new Error("ListView menu items must have unique identifiers!");
				}
				
				this.menuItems[item.getAttribute("data-page-id")] = item;
				
				item.addEventListener("click", () => {
					this.navigate(item.getAttribute("data-page-id"));
					
					this.$emit("selectionChanged", item, {
						selectedItem: item,
						isSettingsSelected: item === this.$refs["settings-nav-pane-item"]
					});

					if ((this.paneDisplayMode === "left-compact" || this.paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.paneDisplayMode !== "left")) {
						this.expanded = false
					}
				});
			}
		});
		
		if (this.$refs["footer-content"]) {
			this.$refs["footer-content"].$el.querySelectorAll(".list-view-item").forEach(item => {
				if (item.__vue__.$props.pageId) {
					if (this.menuItems[item.__vue__.$props.pageId]) {
						throw new Error("ListView menu items must have unique identifiers!");
					}
					
					this.menuItems[item.__vue__.$props.pageId] = item;
					
					item.addEventListener("click", () => {
						if ((this.paneDisplayMode === "left-compact" || this.paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.paneDisplayMode !== "left")) {
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
		
		setHeader(headerText) {
			this.headerText = headerText;
		},
		
		togglePane() {
			if ((this.paneDisplayMode === "left-compact" || this.paneDisplayMode === "left-minimal") || (window.innerWidth < 1008 && this.paneDisplayMode !== "left")) {
				this.expanded = !this.expanded
			} else {
				this.collapsed = !this.collapsed
			}
		}
	},
}
</script>

<style lang="less">
@keyframes page-fade-out {
	0% { opacity: 1; }
	100% { opacity: 0; }
}

@keyframes page-fade-in {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes page-slide-out {
	0% {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}
	90% { opacity: 0; }
	100% {
		transform: translate3d(0, 75px, 0);
		opacity: 0;
	}
}

@keyframes page-slide-in {
	0% {
		transform: translate3d(0, 75px, 0);
		opacity: 0;
	}
	50% { opacity: 1; }
	100% {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}
}

._button() {
	button {
		height: 40px;
		background-color: transparent;
		
		&:not(:disabled) {
			&:hover:not(:active) {
				box-shadow: none;
				background-color: var(--list-low);
			}
			
			&:active {
				background-color: var(--list-medium-low);
			}
		}
		
		i.icon,
		i.symbol {
			font-size: 16px;
		}
		
		&.toggle-pane-button.fill {
			align-self: stretch;
		}
	}
}


.list-view {
	display: flex;
	position: relative;
	width: 100%;
	height: 100%;
	
	.stack-panel.pane-toggle-button-container {
		position: absolute;
		align-items: flex-start;
		
		._button();
	}
	
	.pane-content {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--chrome-medium);
		overflow: hidden;
		z-index: 50;
		transition: width 350ms cubic-bezier(0.1, 0.9, 0.2, 1);
		
		._button();
		
		.stack-panel.pane-toggle-button-container {
			display: none;
			flex-direction: column;
			width: 320px;
			max-width: 100%;
		}
		
		.pane-title {
			width: 100%;
			height: 40px;
			min-width: 320px;
			pointer-events: none;
			
			.text-block {
				font-weight: 700;
				margin-left: 8px;
			}
			
			& + .auto-suggest-area {
				margin-top: 0 !important;
			}
		}
		
		.auto-suggest-area {
			margin-top: 40px;
			min-width: 320px;
			height: 40px;
			
			.text-box,
			.auto-suggest-box {
				margin: 0 16px 0 10px;
			}
		}
		
		.menu-items {
			flex: 1;
			margin: 10px 0 20px;
			overflow-x: hidden;
			
			.list-view-item {
				position: relative;
				width: 100%;
				height: 40px;
				min-width: 320px;
				flex-shrink: 0;
				user-select: none;
				-webkit-user-select: none;
				-moz-user-select: none;
				cursor: default;
				overflow: hidden;

				.list-view-item-inner {
					display: flex;
					align-items: center;
					width: 100%;
					height: 100%;
					
					.list-view-item-content {
						flex: 1;
						padding-left: 16px;
						max-height: 40px;
					}
					
					.list-view-item-icon {
						width: 40px;
						height: 40px;
						
						.font-icon
						.path-icon,
						.symbol-icon {
							width: 16px;
							height: 16px;
							margin: 12px;
						
							i.icon,
							i.symbol,
							svg {
								width: 16px;
								height: 16px;
								font-size: 16px;
								line-height: 16px;
							}
						}
						
						& + .list-view-item-content {
							padding-left: 0;
						}
					}
				}
				
				&:not(:disabled) {
					&:hover:not(:active) {
						background-color: var(--list-low) !important;
					}
					
					&:active {
						background-color: var(--list-medium-low) !important;
						
						.list-view-item-inner {
							transform: scale(0.99);
						}
					}
				}
				
				&.disabled,
				&[disabled] {
					color: var(--base-medium-low);
					pointer-events: none;
				}

				&.selected:after {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					width: 6px;
					height: 24px;
					background-color: var(--system-accent-color);
					transform: translate3d(0, -50%, 0);
				}
			}
		}
		
		.footer-content {
			margin-bottom: 10px;
		}
	}
	
	.content-root {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100vh;
		max-width: 100vw;
		overflow: hidden;
		
		.header-content {
			height: 40px;
			margin-top: 5px;
			margin-left: 12px;
			
			.text-block {
				font-size: 24px;
				font-weight: 300;
			}
			
			& + .content-frame .page .page-content {
				padding-top: 0;
			}
		}
		
		.content-frame {
			flex: 1;
			min-height: 0;
			max-height: 100vh;
			
			.page  {
				&:not(.page-active) {
					display: none;
				}
				
				.page-content {
					padding: 12px;
				}
				
				&.page-fade-out {
					animation: page-fade-out 150ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
				}
				
				&.page-fade-in {
					animation: page-fade-in 250ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
				}
				
				&.page-slide-out .page-content {
					animation: page-slide-out 150ms cubic-bezier(0.755, 0.05, 0.855, 0.06) forwards;
				}
				
				&.page-slide-in .page-content {
					animation: page-slide-in 400ms cubic-bezier(0, 1.0, 0.168, 0.976);
				}
				
				
			}
		}
	}
	
	
	._collapsed(@width) {
		width: @width;
				
		.auto-suggest-area {
			& > *:not(.auto-suggest-button) {
				display: none;
			}
			
			.auto-suggest-button {
				display: block;
			}
		}
		
		.menu-items {
			.list-view-item-header {
				height: 20px;
				
				.text-block {
					transition: transform 350ms cubic-bezier(0.1, 0.9, 0.2, 1);
					transform: translate3d(0, -40px, 0);
				}
			}
		}
		
		.pane-title,
		.list-view-item {
			.text-block {
				opacity: 0;
			}
		}
	}
	
	._expanded() {
		width: 320px;
		max-width: 100%;
		
		.auto-suggest-area {
			& > *:not(.auto-suggest-button) {
				display: block;
			}
			
			.auto-suggest-button {
				display: none;
			}
		}
		
		.menu-items {
			.list-view-item-header {
				height: 40px;
				
				.text-block {
					transform: translate3d(0, 0, 0);
				}
			}
		}
		
		.pane-title,
		.list-view-item {
			.text-block {
				opacity: 1;
			}
		}
	}
	
	.left() {
		.stack-panel.pane-toggle-button-container {
			width: 320px;
			z-index: 51;
			transition: width 350ms cubic-bezier(0.1, 0.9, 0.2, 1);
			
			&.collapsed {
				width: 40px;
			}
		}
		
		.pane-content {
			flex-shrink: 0;
			
			&.back-button-visible {
				padding-top: 40px;
			}
			
			._expanded();
			&.collapsed {
				._collapsed(40px);
			}
		}
	}
	
	.left-compact() {
		.stack-panel.pane-toggle-button-container {
			width: 40px;
			z-index: 51;
			transition: width 350ms cubic-bezier(0.1, 0.9, 0.2, 1);
			
			&.expanded {
				width: 320px;
			}
		}
		
		.pane-content {
			position: absolute;
			z-index: 1;
			
			&.back-button-visible {
				padding-top: 40px;
			}
			
			& + .content-root {
				margin-left: 40px;
			}
			
			._collapsed(40px);
			&.expanded {
				._expanded();
			}
		}
	}
	
	.left-minimal() {
		.stack-panel.pane-toggle-button-container {
			flex-direction: row;
		}
		
		.pane-content {
			position: absolute;
			
			.stack-panel.pane-toggle-button-container {
				display: flex;
				flex-direction: column;
			}
			
			.pane-title,
			.auto-suggest-area,
			.list-view-item,
			.list-view-item-header {
				min-width: auto;
			}
			
			._collapsed(0px);
			&.expanded {
				._expanded();
			}
		}
		
		.content-root {
			.header-content {
				margin-left: 52px;
				
				&.back-button-visible {
					margin-left: 92px;
				}
				
				& + .content-frame {
					margin-top: 0;
				}
			}
			
			.content-frame {
				margin-top: 40px;
			}
		}
	}
	
	
	.top() {
		flex-direction: column;
		z-index: 0;
		
		.stack-panel.pane-toggle-button-container {
			z-index: 2;
			
			.toggle-pane-button {
				display: none;
			}
		}
		
		.pane-content {
			width: 100%;
			height: 40px;
			flex-direction: row;
			z-index: 1;
			
			.pane-title {
				display: none;
			}
			
			.auto-suggest-area {
				order: 2;
				
				.text-box,
				.auto-suggest-box {
					margin: 0 12px;
				}
				
				.auto-suggest-button {
					display: none;
				}
			}
			
			
			.list-view-item,
			.list-view-item-header {
				width: auto;
				min-width: auto;
			}
			
			.list-view-item {
				.list-view-item-icon {
					width: 16px;
					height: 16px;
					margin-left: 16px;
					
					.font-icon
					.path-icon,
					.symbol-icon {
						margin: 0;
					}
				}
				
				.list-view-item-content {
					margin: 0 16px 0 8px;
				}
				
				&.selected:after {
					top: auto;
					left: 16px;
					right: 16px;
					bottom: 4px;
					width: auto;
					height: 2px;
				}
			}
			
			.list-view-item-separator {
				width: 21px;
				
				&:after {
					width: 1px;
					height: 20px;
					margin: 10px;
				}
			}
			
			.menu-items {
				order: 1;
				margin: 0;
				flex-direction: row;
			}
			
			.footer-content {
				order: 3;
				margin: 0;
				flex-direction: row;
				
				.list-view-item {
					.list-view-item-icon {
						margin: 0 16px;
					}
					
					.list-view-item-content {
						display: none;
					}
				}
			}
			
			&.back-button-visible {
				.menu-items {
					margin-left: 40px;
				}
			}
		}
	}
	
	&:not(.left):not(.left-compact):not(.left-minimal):not(.top) {
		@media all and (max-width: 640px) {
			.left-minimal();
		}
		
		@media all and (min-width: 641px) and (max-width: 1007px) {
			.left-compact();
		}
		
		@media all and (min-width: 1008px) {
			.left();
		}
	}
	
	&.left {
		.left();
	}
	&.left-compact {
		.left-compact();
	}
	&.left-minimal {
		.left-minimal();
	}
	&.top {
		.top();
	}
}
</style>