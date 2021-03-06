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

export default class MenuFlyout {
	constructor(params = {}) {
		const flyout = this;
		
		flyout.params = {
			items: []
		}
		Object.assign(flyout.params, params);
		
		flyout.container = document.createElement("div");
		flyout.container.className = "menu-flyout";
		
		flyout.itemList = document.createElement("div");
		flyout.itemList.className = "menu-flyout-items";
		flyout.container.appendChild(flyout.itemList);
		
		flyout.params.items.forEach(item => {
			let menuItem = document.createElement("div");
			menuItem.className = "menu-flyout-item";

			if (item.icon) {
				let menuItemIcon = document.createElement("div");
				menuItemIcon.className = "menu-flyout-item-icon";
				menuItem.appendChild(menuItemIcon);
			
				let icon = document.createElement("i");
				icon.className = `icon ${item.icon}`;
				menuItemIcon.appendChild(icon);
			} else if (item.symbol) {
				let menuItemIcon = document.createElement("div");
				menuItemIcon.className = "menu-flyout-item-icon";
				menuItem.appendChild(menuItemIcon);
			
				let icon = document.createElement("i");
				icon.className = `symbol ${item.icon}`;
				menuItemIcon.appendChild(icon);
			}
			
			if (item.text) {
				let menuItemContent = document.createElement("span");
				menuItemContent.className = "menu-flyout-item-content";
				menuItemContent.innerText = item.text;
				menuItem.appendChild(menuItemContent);
			}

			if (item.disabled) {
				menuItem.classList.add("disabled");
			}

			menuItem.addEventListener("click", () => {
				if (typeof item.action === "function") {
					item.action();
				}

				flyout.hide();
			});

			flyout.itemList.appendChild(menuItem);
		});
		
		// let content = document.createElement("div");
		// content.className = "flyout-content";
		// flyout.container.appendChild(content);
		
		// if (flyout.params.content) {
		// 	if (typeof flyout.params.content === "object") {
		// 		content.appendChild(new NodeRenderer(flyout.params.content));
		// 	} else {
		// 		let parsedHTML = (new DOMParser()).parseFromString(flyout.params.content, "text/html");
		// 		if (parsedHTML.body.children.length) {
		// 			for (var i = 0; i < parsedHTML.body.children.length; i++) {
		// 				content.appendChild(parsedHTML.body.children[i].cloneNode(true));
		// 			}
		// 		} else {
		// 			let contentText = document.createElement("p");
		// 			contentText.innerText = flyout.params.content;
		// 			content.appendChild(contentText);
		// 		}
		// 	}
		// }
	}
	
	_hide_internal(event) {
		const flyout = this;
		
		if (!event.target.parentNodeOfClass("menu-flyout")) {
			event.preventDefault();
			event.stopPropagation();

			flyout.hide();
		}
	}
	
	showAt(element) {
		const flyout = this;
		
		if (!element) return;
		
		flyout.container.classList.remove("animate-out");
		flyout.container.style.maxHeight = null;
		document.body.appendChild(flyout.container);
		
		const width = flyout.container.clientWidth;
		const height = flyout.container.clientHeight;
		let offset = element.getBoundingClientRect()

		if (offset.top - height >= 0) {
			Object.assign(flyout.container.style, {
				top: null,
				bottom: `${Math.round((window.innerHeight - offset.top) / 2) * 2}px`
			});
			
			flyout.container.classList.add("animate-bottom");
		} else if (offset.top + offset.height <= window.innerHeight) {
			Object.assign(flyout.container.style, {
				top: `${Math.round((offset.top + offset.height) / 2) * 2}px`,
				bottom: null
			});
			
			flyout.container.classList.add("animate-top");
		}
		
		Object.assign(flyout.container.style, {
			left: `${Math.max(Math.min(window.innerWidth - width, (offset.left + (offset.width / 2)) - width / 2), 0)}px`
		});
		
		setTimeout(() => {
			flyout.container.style.maxHeight = `${height}px`;
		}, 0);
		
		flyout.eventListener = this._hide_internal.bind(flyout);

		document.addEventListener("click", flyout.eventListener, true);
	}
	
	hide() {
		const flyout = this;

		document.removeEventListener("click", flyout.eventListener, true);
		flyout.container.classList.add("animate-out");
		flyout.container.classList.remove("animate-top");
		flyout.container.classList.remove("animate-bottom");
		setTimeout(() => {
			document.body.removeChild(flyout.container);
		}, 400);
	}
}