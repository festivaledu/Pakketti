import Vue from "vue";

const NodeRenderer = class {
	constructor(element) {
		const NodeConstructor = Vue.extend({
			props: ['node'],
			render(h, context) {
				return this.node ? this.node : ''
			}
		});

		const nodeRenderer = new NodeConstructor({
			propsData: {
				node: element
			}
		});
		nodeRenderer.$mount();

		return nodeRenderer.$el;
	}
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

export default class ContentDialog {
	constructor(params = {}) {
		const flyout = this;
		
		flyout.params = {
			content: null
		}
		Object.assign(flyout.params, params);
		
		flyout.container = document.createElement("div");
		flyout.container.className = "flyout";
		
		let content = document.createElement("div");
		content.className = "flyout-content";
		flyout.container.appendChild(content);
		
		if (flyout.params.content) {
			if (typeof flyout.params.content === "object") {
				content.appendChild(new NodeRenderer(flyout.params.content));
			} else {
				let parsedHTML = (new DOMParser()).parseFromString(flyout.params.content, "text/html");
				if (parsedHTML.body.children.length) {
					for (var i = 0; i < parsedHTML.body.children.length; i++) {
						content.appendChild(parsedHTML.body.children[i].cloneNode(true));
					}
				} else {
					let contentText = document.createElement("p");
					contentText.innerText = flyout.params.content;
					content.appendChild(contentText);
				}
			}
		}
	}
	
	_hide_internal(event) {
		const flyout = this;
		
		if (!event.target.parentNodeOfClass("flyout")) {
			event.preventDefault();
			event.stopPropagation();

			flyout.hide();
		}
	}
	
	showAt(element) {
		const flyout = this;
		
		if (!element) return;
		
		flyout.container.classList.remove("animate-out");
		document.body.appendChild(flyout.container);
		
		const width = flyout.container.clientWidth;
		const height = flyout.container.clientHeight;
		let offset = element.getBoundingClientRect()

		if (offset.top - (height + 8) >= 0) {
			Object.assign(flyout.container.style, {
				top: null,
				bottom: `${window.innerHeight - (offset.top - 8)}px`
			});
			
			flyout.container.classList.add("animate-bottom");
		} else if (offset.top + (offset.height + 8) <= window.innerHeight) {
			Object.assign(flyout.container.style, {
				top: `${offset.top + (offset.height + 8)}px`,
				bottom: null
			});
			
			flyout.container.classList.add("animate-top");
		}
		
		Object.assign(flyout.container.style, {
			left: `${Math.max(Math.min(window.innerWidth - width, (offset.left + (offset.width / 2)) - width / 2), 0)}px`
		});
		
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