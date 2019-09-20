import Vue from 'vue';
import uuid from 'uuid/v4';

const NodeRenderer = class {
	constructor(element) {
		const NodeConstructor = Vue.extend({
			props: ['node'],
			render(h) {
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
};

const ContentDialogResult = {
	None: 0,
	Primary: 1,
	Secondary: 2
};

class ContentDialog {
	constructor(params = {}) {
		const dialog = this;
		
		dialog.params = {
			title: null,
			content: null,
			commands: []
		};
		Object.assign(dialog.params, params);
		
		dialog.background = document.createElement("div");
		dialog.background.className = "content-dialog-background";
		
		dialog.container = document.createElement("div");
		dialog.container.className = "content-dialog";
		
		let content = document.createElement("div");
		content.className = "content-dialog-content";
		dialog.container.appendChild(content);
		
		if (dialog.params.title && dialog.params.title.length) {
			let title = document.createElement("p");
			title.className="text-block sub-title";
			title.innerHTML = dialog.params.title;
			content.appendChild(title);
		}
		
		if (dialog.params.content) {
			if (typeof dialog.params.content === "object") {
				content.appendChild(new NodeRenderer(dialog.params.content));
			} else if (typeof dialog.params.content === "function") {
				content.appendChild(new NodeRenderer(dialog.params.content(dialog)));
			} else {
				let parsedHTML = (new DOMParser()).parseFromString(dialog.params.content, "text/html");
				if (parsedHTML.body.children.length) {
					for (var i = 0; i < parsedHTML.body.children.length; i++) {
						content.appendChild(parsedHTML.body.children[i].cloneNode(true));
					}
				} else {
					let contentText = document.createElement("p");
					contentText.innerText = dialog.params.content;
					content.appendChild(contentText);
				}
			}
		}
		
		if (params.commands && params.commands.length) {
			let commands = document.createElement("div");
			commands.className = "content-dialog-commands";
			dialog.container.appendChild(commands);
			
			params.commands.slice(0, 3).filter(Boolean).forEach((command, index) => {
				let commandButton = document.createElement("button");
				commandButton.innerText = command.text;
				commandButton.className = command.primary ? "system-accent-color primary" : "";
				commandButton.disabled = (command.primary && [
					...content.querySelectorAll("input, textarea, select")
				].some(input => input.minLength > 0 || input.required));
				
				commandButton.addEventListener("click", () => {
					if (typeof command.action === "function") {
						command.action();
					}
					
					if (dialog._promiseResolve) {
						if (command.primary) {
							dialog._promiseResolve(ContentDialogResult.Primary);
						} else if (command.secondary) {
							dialog._promiseResolve(ContentDialogResult.Secondary);
						} else {
							dialog._promiseResolve(ContentDialogResult.None);
						}
					}
					
					dialog.hide();
				});
				
				commands.appendChild(commandButton);
			});
			
			content.querySelectorAll("input, textarea, select").forEach(item => {
				item.addEventListener("input", () => {
					let primaryCommand = commands.querySelector(".primary");
					
					if (primaryCommand) {
						primaryCommand.disabled = [
							...content.querySelectorAll("input, textarea, select")
						].some(input => {
							return (input.value.length < input.minLength) || (input.required && !input.value.length)
						});
					}
				});
			});
		}
	}
	
	show() {
		const dialog = this;
		if (!document.querySelector("div.content-dialog-background")) {
			document.body.appendChild(dialog.background);
			dialog.background.classList.remove("animate-out");
		} else {
			document.querySelector(".content-dialog-background").classList.remove("animate-out");
		}
		
		document.body.appendChild(dialog.container);
		
		dialog.container.style.width = `${Math.round(dialog.container.clientWidth / 2) * 2}px`;
		dialog.container.style.height = `${Math.round(dialog.container.clientHeight / 2) * 2}px`;
		
		dialog.container.classList.add("animate-in");
		dialog.container.classList.remove("animate-out");
		
		dialog.eventListener = this._resize.bind(dialog);
		window.addEventListener("resize", dialog.eventListener, true);
	}
	
	async showAsync() {
		const dialog = this;

		dialog.show();

		let promise = new Promise((resolve) => {
			dialog._promiseResolve = resolve;
		});
		return promise;
	}
	
	hide() {
		const dialog = this;
		
		window.removeEventListener("resize", dialog.eventListener, true);

		dialog.container.classList.add("animate-out");
		if (document.querySelectorAll(".content-dialog").length < 2) {
			document.querySelector(".content-dialog-background").classList.add("animate-out");
		}
		setTimeout(() => {
			document.body.removeChild(dialog.container);
			if (!document.querySelector(".content-dialog")) {
				document.body.removeChild(document.querySelector(".content-dialog-background"));
			}
		}, 400);
	}
	
	get text() {
		const dialog = this;
		const output = {};
		
		if (dialog.container.querySelector("input, textarea, select")) {
			dialog.container.querySelectorAll("input, textarea, select").forEach(input => {
				if (input.name) output[input.name] = input.value;
			});
		}
		
		return output;
	}
	
	_resize() {
		const dialog = this;
		
		dialog.container.style.width = null;
		dialog.container.style.height = null;
		
		setTimeout(() => {
			dialog.container.style.width = `${Math.round(dialog.container.clientWidth / 2) * 2}px`;
			dialog.container.style.height = `${Math.round(dialog.container.clientHeight / 2) * 2}px`;
		});
	}
}

const NodeRenderer$1 = class {
	constructor(element) {
		const NodeConstructor = Vue.extend({
			props: ['node'],
			render(h) {
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
};

HTMLElement.prototype.parentNodeOfClass = function(className) {
	var node = this.parentNode;
	while (node) {
		// console.log(node);
		if (node.classList && node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode;
	}

	return null;
};

class Flyout {
	constructor(params = {}) {
		const flyout = this;
		
		flyout.params = {
			content: null
		};
		Object.assign(flyout.params, params);
		
		flyout.container = document.createElement("div");
		flyout.container.className = "flyout";
		
		let content = document.createElement("div");
		content.className = "flyout-content";
		flyout.container.appendChild(content);
		
		if (flyout.params.content) {
			if (typeof flyout.params.content === "object") {
				content.appendChild(new NodeRenderer$1(flyout.params.content));
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
		let offset = element.getBoundingClientRect();

		if (offset.top - (height + 8) >= 0) {
			Object.assign(flyout.container.style, {
				top: null,
				bottom: `${Math.round((window.innerHeight - (offset.top - 8)) / 2) * 2}px`
			});
			
			flyout.container.classList.add("animate-bottom");
		} else if (offset.top + (offset.height + 8) <= window.innerHeight) {
			Object.assign(flyout.container.style, {
				top: `${Math.round((offset.top + (offset.height + 8)) / 2) * 2}px`,
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

HTMLElement.prototype.parentNodeOfClass = function(className) {
	var node = this.parentNode;
	while (node) {
		// console.log(node);
		if (node.classList && node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode;
	}

	return null;
};

class MenuFlyout {
	constructor(params = {}) {
		const flyout = this;
		
		flyout.params = {
			items: []
		};
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
		let offset = element.getBoundingClientRect();

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

const NodeRenderer$2 = class {
	constructor(element) {
		const NodeConstructor = Vue.extend({
			props: ['node'],
			render(h) {
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
};

var findInRow = (node) => {
	var i = 0;
	while (node.previousSibling) {
		node = node.previousSibling;
		if (node.nodeType === 1) { ++i; }
	}

	return i;
};

class index {
	constructor(params) {
		const notification = this;
		
		notification.params = params;

		notification.notificationCenter = document.createElement("div");
		notification.notificationCenter.className = "notification-center";

		notification.wrapper = document.createElement("div");
		notification.wrapper.className = "notification-wrapper";

		notification.container = document.createElement("div");
		notification.container.className = "notification acrylic acrylic-60";
		notification.wrapper.appendChild(notification.container);

		let dismissButton = document.createElement("div");
		dismissButton.className = "dismiss-button";
		dismissButton.innerHTML = "<i class=\"icon chrome-back-mirrored\"></i>";
		dismissButton.addEventListener("click", () => {
			notification.hide("slide-out");
		});
		notification.container.appendChild(dismissButton);

		notification.payload = params.payload;
		notification._displayTimeout = null;
		notification.container.addEventListener("mouseover", () => {
			clearTimeout(notification._displayTimeout);
		});
		notification.___mousoutListener = notification._resetTimeout.bind(notification);
		notification.container.addEventListener("mouseout", notification.___mouseoutListener);

		notification._dismissAction = params.dismissAction;
		notification.container.addEventListener("mousedown", (e) => {
			if (e.target == notification.container) {
				notification.container.classList.add("active-state");
			}
		});
		notification.container.addEventListener("mouseup", (e) => {
			if (e.target == notification.container) {
				clearTimeout(notification._displayTimeout);
				notification.container.classList.remove("active-state");

				if (typeof notification._dismissAction === "function") {
					notification._dismissAction(notification.payload, notification);
			}

				notification.hide("dismissing");
			}
		});

		if (params.icon) {
			let iconContainer = document.createElement("div");
			iconContainer.className = "notification-icon";
			notification.container.appendChild(iconContainer);

			if (typeof params.icon === "object") {
				iconContainer.appendChild(new NodeRenderer$2(params.icon));
			} else {
				let parsedHTML = (new DOMParser()).parseFromString(params.icon, "text/html");
				if (parsedHTML.body.children.length) {
					for (var i = 0; i < parsedHTML.body.children.length; i++) {
						iconContainer.appendChild(parsedHTML.body.children[i].cloneNode(true));
					}
				} else {
					let icon = document.createElement("i");
					icon.className = `icon ${params.icon}`;
					iconContainer.appendChild(icon);
				}
			}
		}

		let content = document.createElement("div");
		content.className = "content";
		notification.container.appendChild(content);

		if (params.title && params.title.length) {
			let title = document.createElement("p");
			title.className = "title-label";
			title.innerText = params.title;
			content.appendChild(title);
		}

		if (params.content) {
			if (typeof params.content === "object") {
				content.appendChild(new NodeRenderer$2(params.content));
			} else {
				let parsedHTML = (new DOMParser()).parseFromString(params.content, "text/html");
				if (parsedHTML.body.children.length) {
					for (var i = 0; i < parsedHTML.body.children.length; i++) {
						content.appendChild(parsedHTML.body.children[i].cloneNode(true));
					}
				} else {
					let contentText = document.createElement("p");
					contentText.innerText = params.content;
					content.appendChild(contentText);
				}
			}
		}

		let inputs = document.createElement("div");
		inputs.className = "notification-inputs";
		if (params.inputs) {
			notification.container.appendChild(inputs);

			if (typeof params.inputs === "object") {
				inputs.appendChild(new NodeRenderer$2(params.inputs));
			} else {
				let parsedHTML = (new DOMParser()).parseFromString(params.inputs, "text/html");
				if (parsedHTML.body.children.length) {
					for (var i = 0; i < parsedHTML.body.children.length; i++) {
						content.appendChild(parsedHTML.body.children[i].cloneNode(true));
					}
				}
			}
		}

		let buttons = document.createElement("div");
		buttons.className = "notification-buttons";
		if (params.buttons && params.buttons.length) {
			notification.container.appendChild(buttons);

			params.buttons.forEach(_button => {
				let button = document.createElement("button");
				button.innerText = _button.text;
				button.className = _button.validate ? "validated" : "";
				button.disabled = (_button.validate && [...inputs.querySelectorAll("input, select")].some(inputEl => inputEl.dataset.minlength || inputEl.dataset.required == "true"));

				button.addEventListener("click", () => {
					if (typeof _button.action === "function") {
						_button.action(notification.payload, notification);
					}

					if (notification._promiseResolve) {
						notification._promiseResolve(findInRow(button));
					}

					notification.hide("dismissing-action");
				});

				buttons.appendChild(button);
			});
		}

		inputs.querySelectorAll("input, select").forEach(item => {
			item.addEventListener("input", () => {
				clearTimeout(notification._displayTimeout);
				notification._displayTimeout = null;
				notification.container.removeEventListener("mouseout", notification.___mouseoutListener);

				let validatedButton = buttons.querySelector(".validated");

				if (validatedButton) {
					validatedButton.disabled = [...inputs.querySelectorAll("input, select")].some(inputEl => (inputEl.value.length < inputEl.dataset.minlength) || (inputEl.dataset.required == "true" && !inputEl.value.length));
				}
			});
		});
	}

	_resetTimeout() {
		const notification = this;
		
		if (notification.params.reminder === true) return;

		if (notification.container.classList.contains("slide-out") ||
			notification.container.classList.contains("dismissing") ||
			notification.container.classList.contains("dismissing-action")) {
			return;
		}

		clearTimeout(notification._displayTimeout);
		notification._displayTimeout = setTimeout(() => {
			notification.hide("slide-out");
		}, 6000);
	}

	_removeFromParent() {
		const notification = this;

		setTimeout(() => {
			notification.notificationCenter.removeChild(notification.wrapper);

			setTimeout(() => {
				notification.notificationCenter.querySelectorAll(".notification-wrapper").forEach(item => {
					var notificationHeight = 0;

					var node = item;
					while (node.nextElementSibling) {
						notificationHeight += (node.clientHeight + 12);
						node = node.nextElementSibling;
					}

					item.style.marginBottom = `${notificationHeight}px`;
				});
			});
		}, 450);
	}

	/**
	 * Displays a notification on the screen
	 */
	show() {
		const notification = this;

		if (!document.querySelector(".notification-center")) {
			document.body.appendChild(notification.notificationCenter);
		} else {
			notification.notificationCenter = document.querySelector(".notification-center");
		}

		notification.notificationCenter.querySelectorAll(".notification-wrapper").forEach(item => {
			var notificationHeight = 0;

			var node = item;
			while (node) {
				notificationHeight += (node.clientHeight + 12);
				node = node.nextElementSibling;
			}

			item.style.marginBottom = `${notificationHeight}px`;
		});

		notification.notificationCenter.appendChild(notification.wrapper);
		notification.container.classList.add("slide-in");
		notification.container.classList.remove("slide-out");
		notification.container.classList.remove("dismissing");
		notification.container.classList.remove("dismissing-action");

		setTimeout(() => {
			notification.container.classList.remove("slide-in");
		}, 600);

		this._resetTimeout();
	}

	/**
	 * Displays a notification asynchroneously and returns a promise,
	 * which later returns the index of the pressed button (if any, else -1)
	 */
	async showAsync() {
		const notification = this;

		notification.show();

		notification._promise = new Promise((resolve) => {
			notification._promiseResolve = resolve;
		});

		return notification._promise;
	}

	/**
	 * Hides a notification and removes it from the screen
	 */
	hide(hideType) {
		const notification = this;

		clearTimeout(notification._displayTimeout);
		notification._displayTimeout = null;

		notification.container.classList.remove("slide-in");
		notification.container.classList.add(hideType);

		if (notification._promise && typeof notification._promise.result === "undefined") {
			notification._promiseResolve(-1);
		}

		this._removeFromParent();
	}

	/**
	 * Returns the text (if only one input/select) or an array of texts (if multiple) entered into the dialog
	 */
	get text() {
		const notification = this;

		if (notification.container.querySelectorAll("input, select").length > 1) {
			var output = [];

			notification.container.querySelectorAll("input, select").forEach(item => {
				output.push(item.value);
			});

			return output;
		} else if (notification.container.querySelector("input, select")) {
			return notification.container.querySelector("input, select").value;
		}

		return null;
	}
}



var Classes = /*#__PURE__*/Object.freeze({
	ContentDialog: ContentDialog,
	ContentDialogResult: ContentDialogResult,
	Flyout: Flyout,
	MenuFlyout: MenuFlyout,
	Notification: index
});

//
//
//
//
//
//
//
//

var script = {
	name: "MetroView",
	data() {
		return {
			container: null,
			params: {
				isPrimaryView: false,
			},
			_currentPage: null,
			pages: {},
			_items: {},
			_history: []
		}
	},
	props: {
		viewId: String,
		isPrimaryView: Boolean,
	},
	mounted() {
		let view = this;
		view.container = this.$el;
		
		for (var param in this.$props) {
			view.params[param] = this.$props[param];
		}
		
		if (view.params.isPrimaryView) {
			view.container.classList.add("view-active");
		}
		
		view._currentPage = null;
		view.pages = {};
		view._items = {};
		view._history = [];
		
		view.container.querySelectorAll(".pages > .page").forEach((item, index) => {
			if (item.hasAttribute("data-page-id")) {
				// view.pages[item.getAttribute("data-page-id")] = new metroUI.Page(item, {
				// 	parentView: view,
				// 	isPrimaryPage: index == 0
				// });

				view.pages[item.getAttribute("data-page-id")] = item.__vue__;
				item.__vue__.params = Object.assign(item.__vue__.params, {
					parentView: view
				});

				if (index == 0) {
					item.__vue__.show();
					view._currentPage = view.pages[item.getAttribute("data-page-id")];
					view._history.push(item.getAttribute("data-page-id"));
				}
			}
		});
	},
	methods: {
		navigate(pageName, _options) {
			const view = this;

			var options = {
				url: null,
				addHistory: true
			};
			for (var option in _options) {
				options[option] = _options[option];
			}

			let page = view.pages[pageName];
			if (page) {
				if (page.isVisible()) return;
				page.show();
				view._currentPage = page;

				if (options.addHistory) {
					view._history.push(pageName);
				}
			}
		},
		goBack() {
			const view = this;
			if (view._history.length > 1) {
				view._currentPage.hide();

				let lastPage = view.pages[view._history[view._history.length - 2]];
				if (lastPage) {
					lastPage.show();

					view._history.pop();
				}
			}
		},
		show() {
			let view = this;
			document.querySelectorAll(".views .view").forEach((item) => {
				if (item == view.container) {
					item.classList.add("view-active");
					item.dispatchEvent(new Event("viewShow"));
				} else {
					item.classList.remove("view-active");
					item.dispatchEvent(new Event("viewHide"));
				}
			});
		},
		hide() {
			this.container.classList.remove("view-active");
			this.container.dispatchEvent(new Event("viewHide"));
		},
		
		querySelector(query) {
			return this.container.querySelector(query);
		},
		querySelectorAll(query) {
			return this.container.querySelectorAll(query);
		}
	}
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "view", attrs: { "data-view-id": _vm.viewId } },
    [_c("div", { staticClass: "pages" }, [_vm._t("default")], 2)]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var View = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const elementIsParentOfPage = (element, page) => {
	var node = element;
	while (node) {
		if (node.classList.contains("page")) break;
		node = node.parentNode;
	}
	return (node && node == page.container);
};

HTMLElement.prototype.parentNodeOfClass = function(className) {
	var node = this.parentNode;
	while (node) {
		// console.log(node);
		if (node.classList && node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode;
	}
	
	return null;
};



var script$1 = {
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
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "page",
      class: {
        "flex-container":
          this.$slots["top-app-bar"] || this.$slots["bottom-app-bar"]
      },
      attrs: { "data-page-id": _vm.pageId }
    },
    [
      this.$slots["top-app-bar"]
        ? _c("div", { staticClass: "top-app-bar" }, [_vm._t("top-app-bar")], 2)
        : _vm._e(),
      _vm._v(" "),
      _c("div", { staticClass: "page-content" }, [_vm._t("default")], 2),
      _vm._v(" "),
      this.$slots["bottom-app-bar"]
        ? _c(
            "div",
            { staticClass: "bottom-app-bar" },
            [_vm._t("bottom-app-bar")],
            2
          )
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var Page = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//

var script$2 = {
	name: "MetroAppBarButton",
	props: {
		icon: String,
		label: String,
		disabled: Boolean
	},
	methods: {
		emit(eventName) {
			this.$emit(eventName);
		}
	}
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "app-bar-button",
      attrs: { disabled: _vm.disabled },
      on: {
        click: function($event) {
          return _vm.emit("click")
        }
      }
    },
    [
      !_vm.icon ? _vm._t("icon") : _vm._e(),
      _vm._v(" "),
      _vm.icon ? _c("i", { class: "icon " + _vm.icon }) : _vm._e(),
      _vm._v(" "),
      _c("label", [_vm._v(_vm._s(_vm.label))])
    ],
    2
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = undefined;
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppBarButton = normalizeComponent_1(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    undefined,
    undefined
  );

//
//
//
//

var script$3 = {
	name: "MetroAppBarSeparator"
};

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "app-bar-separator" })
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  const __vue_inject_styles__$3 = undefined;
  /* scoped */
  const __vue_scope_id__$3 = undefined;
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppBarSeparator = normalizeComponent_1(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    undefined,
    undefined
  );

//
//
//
//
//
//
//

var script$4 = {
	name: "MetroButton",
	props: {
		content: String,
		disabled: Boolean
	},
	methods: {
		emit(eventName, eventData) {
			this.$emit(eventName, eventData);
		}
	}
};

/* script */
const __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "button",
    {
      attrs: { disabled: _vm.disabled },
      on: {
        click: function($event) {
          return _vm.emit("click", $event)
        }
      }
    },
    [
      _vm._t("default"),
      _vm._v(" "),
      !this.$slots.default ? [_vm._v(_vm._s(_vm.content))] : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  const __vue_inject_styles__$4 = undefined;
  /* scoped */
  const __vue_scope_id__$4 = undefined;
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var Button = normalizeComponent_1(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    undefined,
    undefined
  );

//

var script$5 = {
	name: "MetroCheckbox",
	props: {
		name: String,
		content: String,
		disabled: Boolean,
		value: Boolean
	},
	data() {
		return {
			uuid: uuid()
		}
	},
	methods: {
		_onChange(e) {
			if (e.target.checked) {
				this.$emit("checked", e);
			} else {
				this.$emit("unchecked", e);
			}
			
			this.$emit("input", e.target.checked);
		}
	}
};

/* script */
const __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "checkbox", attrs: { disabled: _vm.disabled } },
    [
      _c("input", {
        attrs: { type: "checkbox", name: _vm.name, id: _vm.uuid },
        domProps: { checked: _vm.value },
        on: { change: _vm._onChange }
      }),
      _vm._v(" "),
      _c("label", { attrs: { for: _vm.uuid } }, [_vm._v(_vm._s(_vm.content))])
    ]
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  const __vue_inject_styles__$5 = undefined;
  /* scoped */
  const __vue_scope_id__$5 = undefined;
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CheckBox = normalizeComponent_1(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    undefined,
    undefined
  );

//

var script$6 = {
	name: "MetroComboBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		itemsSource: null,
		disabled: Boolean,
		value: null,
		noUpdate: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			dropDownOpen: false,
			selectedIndex: -1,
			_value: this.$props.value,
			eventListener: null
		}
	},
	mounted() {
		this.$nextTick(function () {			
			Object.assign(this.$refs["popup"].style, {
				minWidth: `${this.$refs["content"].clientWidth}px`
			});
		});
	},
	updated() {
		if (!this.noUpdate) {
			this.$nextTick(function () {
				this.$data._value = this.value;
				if (this.itemsSource instanceof Array) {
					this.selectedIndex = this.itemsSource.indexOf(this.value);
				} else {
					this.selectedIndex = Object.keys(this.itemsSource).indexOf(this.value);
				}
			});
		}
	},
	methods: {
		_openDropDown(event) {
			this.dropDownOpen = true;
			
			this.$refs["popup"].parentElement.removeChild(this.$refs["popup"]);
			document.body.appendChild(this.$refs["popup"]);
			
			this.$nextTick(() => {
				const width = this.$refs["popup"].clientWidth;
				const height = this.$refs["popup"].clientHeight;
				let offset = this.$refs["content"].getBoundingClientRect();
				let selectionOffset = Math.max(this.selectedIndex, 0) * -32;

				Object.assign(this.$refs["popup"].style, {
					top: `${Math.max(Math.min(window.innerHeight - (height + 1), offset.top - 4 + selectionOffset), 0)}px`,
					left: `${Math.max(Math.min(window.innerWidth - (width + 1), offset.left), 0)}px`,
					minWidth: `${this.$refs["content"].clientWidth}px`
					// transform: `translate3d(0, ${selectionOffset}px, 0)`
				});
			});
			
			event.stopPropagation();
			
			this.eventListener = this._closeDropDown_internal.bind(this);
			document.addEventListener("click", this.eventListener, true);
		},
		_closeDropDown_internal(event) {
			if (!event.target.parentNodeOfClass("combo-box-popup")) {
				event.preventDefault();
				event.stopPropagation();

				this._closeDropDown(event);
			}
		},
		_closeDropDown(event, item) {
			this.dropDownOpen = false;
			document.removeEventListener("click", this.eventListener, true);
			
			event.stopPropagation();
			
			if (!item) return;
			
			this.$data._value = item;
			
			if (this.itemsSource instanceof Array) {
				this.selectedIndex = this.itemsSource.indexOf(item);
			} else {
				this.selectedIndex = Object.keys(this.itemsSource).indexOf(item);
			}
			this.$refs["select"].value = item;
			
			this.$emit("input", this.$data._value);
		}
	},
	computed: {
		items() {
			if (this.itemsSource instanceof Array) {
				return this.itemsSource.reduce((out, item) => ({
					...out,
					[item]: item
				}), {});
			} else if (this.itemsSource instanceof Object) {
				return this.itemsSource;
			}
		}
	}
};

/* script */
const __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "combo-box", attrs: { disabled: _vm.disabled } },
    [
      _vm.header ? _c("label", [_vm._v(_vm._s(_vm.header))]) : _vm._e(),
      _vm._v(" "),
      _c(
        "select",
        { ref: "select", attrs: { name: _vm.name } },
        _vm._l(_vm.items, function(value, key) {
          return _c(
            "option",
            {
              key: key,
              domProps: { value: key, selected: _vm.$data._value === key }
            },
            [_vm._v(_vm._s(value))]
          )
        }),
        0
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          ref: "content",
          staticClass: "combo-box-content",
          on: {
            click: function($event) {
              return _vm._openDropDown($event)
            }
          }
        },
        [
          _vm.placeholderText && !this.$data._value
            ? _c("MetroTextBlock", [_vm._v(_vm._s(_vm.placeholderText))])
            : _vm._e(),
          _vm._v(" "),
          this.$data._value
            ? _c("MetroTextBlock", [
                _vm._v(_vm._s(_vm.items[this.$data._value]))
              ])
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticClass: "drop-down-glyph" })
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.dropDownOpen,
              expression: "dropDownOpen"
            }
          ],
          ref: "popup",
          staticClass: "combo-box-popup"
        },
        [
          _c(
            "div",
            { staticClass: "combo-box-items" },
            _vm._l(_vm.items, function(value, key) {
              return _c(
                "div",
                {
                  key: key,
                  staticClass: "combo-box-item",
                  class: { selected: _vm.$data._value === key },
                  on: {
                    click: function($event) {
                      return _vm._closeDropDown($event, key)
                    }
                  }
                },
                [_vm._v(_vm._s(value))]
              )
            }),
            0
          )
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  const __vue_inject_styles__$6 = undefined;
  /* scoped */
  const __vue_scope_id__$6 = undefined;
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ComboBox = normalizeComponent_1(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$7 = {
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
};

/* script */
const __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: "command-bar " + (_vm.isOpen ? "expanded" : "collapsed") },
    [
      _c("div", { staticClass: "command-bar-content" }, [
        this.$slots["content"]
          ? _c("div", { staticClass: "content" }, [_vm._t("content")], 2)
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "primary-commands" },
          [
            _c(
              "MetroStackPanel",
              { attrs: { orientation: "horizontal" } },
              [
                !this.$slots["primary-commands"] ? _vm._t("default") : _vm._e(),
                _vm._v(" "),
                _vm._t("primary-commands")
              ],
              2
            )
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "more-button", on: { click: _vm.toggle } },
          [_c("MetroSymbolIcon", { attrs: { symbol: "more" } })],
          1
        )
      ]),
      _vm._v(" "),
      this.$slots["secondary-commands"]
        ? _c(
            "div",
            { staticClass: "secondary-commands" },
            [
              _c(
                "MetroStackPanel",
                { attrs: { orientation: "vertical" } },
                [_vm._t("secondary-commands")],
                2
              )
            ],
            1
          )
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  const __vue_inject_styles__$7 = undefined;
  /* scoped */
  const __vue_scope_id__$7 = undefined;
  /* module identifier */
  const __vue_module_identifier__$7 = undefined;
  /* functional template */
  const __vue_is_functional_template__$7 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CommandBar = normalizeComponent_1(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$8 = {
	name: "MetroDataGrid",
	props: {
		itemsSource: Array,
		columnNames: Object
	},
	computed: {
		columnKeys() {
			return this.$props.itemsSource.reduce((out, item) => {
				Object.keys(item).forEach(key => {
					if (out.indexOf(key) < 0) out.push(key);
				});
				
				return out;
			}, []);
		},
		columnNameList() {
			if (!this.$props.itemsSource || !this.$props.itemsSource.length) return [];
			
			if (this.$props.columnNames) {
				if (this.$props.columnNames instanceof Array) return this.$props.columnNames;
				
				let _existingKeys = this.$props.itemsSource.reduce((out, item) => {
					Object.keys(item).forEach(key => {
						out[key] = key;
					});
					
					return out;
				}, {});
				
				
				let _columnNames = [];
				Object.keys(_existingKeys).forEach(key => {
					if (!this.$props.columnNames[key] && _columnNames.indexOf(key) < 0) _columnNames.push(key);
					if (this.$props.columnNames[key] && _columnNames.indexOf(this.$props.columnNames[key]) < 0) _columnNames.push(this.$props.columnNames[key]);
				});
				
				return _columnNames;
			}
			
			
			return this.columnKeys;
		}
	}
};

/* script */
const __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "data-grid" }, [
    _c("div", { staticClass: "data-grid-wrapper" }, [
      _c(
        "div",
        { staticClass: "table" },
        [
          _c("div", { staticClass: "column-headers-border" }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "tr column-headers" },
            _vm._l(_vm.columnNameList, function(column, index) {
              return _c(
                "div",
                { key: index, staticClass: "th column-header-item" },
                [_vm._v(_vm._s(column))]
              )
            }),
            0
          ),
          _vm._v(" "),
          _vm._l(_vm.itemsSource, function(item, index) {
            return _c("div", { key: index, staticClass: "row-wrapper" }, [
              _c(
                "div",
                { staticClass: "tr row" },
                _vm._l(_vm.columnKeys, function(key) {
                  return _c(
                    "div",
                    { key: index + key, staticClass: "td cell" },
                    [
                      typeof item[key] === "boolean"
                        ? _c("MetroCheckbox", { attrs: { value: item[key] } })
                        : _c("span", [_vm._v(_vm._s(item[key]))])
                    ],
                    1
                  )
                }),
                0
              ),
              _vm._v(" "),
              _c("div", {
                staticClass: "row-background",
                style: "top: " + (index + 1) * 32 + "px"
              })
            ])
          })
        ],
        2
      )
    ])
  ])
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  const __vue_inject_styles__$8 = undefined;
  /* scoped */
  const __vue_scope_id__$8 = undefined;
  /* module identifier */
  const __vue_module_identifier__$8 = undefined;
  /* functional template */
  const __vue_is_functional_template__$8 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var DataGrid = normalizeComponent_1(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$9 = {
	name: "MetroFlipView",
	props: {
		initialIndex: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			page: this.$props.initialIndex,
			itemCount: -1
		}
	},
	mounted() {
		if (this.$refs["scroll-content"].querySelector(".flip-view-item")) {
			this.itemCount = this.$refs["scroll-content"].querySelectorAll(".flip-view-item").length;
		}
	},
	methods: {
		previousPage() {
			this.page = Math.max(this.page - 1, 0);
		},
		nextPage() {
			this.page = Math.min(this.page + 1, this.itemCount - 1);
		}
	},
	calculated: {
		flipViewItems() {
			return this.$slots.default;
		}
	}
};

/* script */
const __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "flip-view" },
    [
      _c("div", { staticClass: "scrolling-host" }, [
        _c(
          "div",
          {
            ref: "scroll-content",
            staticClass: "scroll-content",
            style: "transform: translate3d(-" + this.page * 100 + "%, 0, 0)"
          },
          [_vm._t("default")],
          2
        )
      ]),
      _vm._v(" "),
      _c(
        "MetroButton",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: this.page > 0,
              expression: "this.page > 0"
            }
          ],
          staticClass: "previous-button",
          on: { click: _vm.previousPage }
        },
        [
          _c("MetroFontIcon", {
            attrs: { "font-size": "12px", glyph: "&#xE0E2;" }
          })
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "MetroButton",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: this.page < this.itemCount - 1,
              expression: "this.page < this.itemCount - 1"
            }
          ],
          staticClass: "next-button",
          on: { click: _vm.nextPage }
        },
        [
          _c("MetroFontIcon", {
            attrs: { "font-size": "12px", glyph: "&#xE0E3;" }
          })
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  const __vue_inject_styles__$9 = undefined;
  /* scoped */
  const __vue_scope_id__$9 = undefined;
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var FlipView = normalizeComponent_1(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$a = {
	name: "MetroFlipViewItem"
};

/* script */
const __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "flip-view-item" }, [_vm._t("default")], 2)
};
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  const __vue_inject_styles__$a = undefined;
  /* scoped */
  const __vue_scope_id__$a = undefined;
  /* module identifier */
  const __vue_module_identifier__$a = undefined;
  /* functional template */
  const __vue_is_functional_template__$a = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var FlipViewItem = normalizeComponent_1(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$b = {
	name: "MetroFontIcon",
	props: {
		fontFamily: {
			type: String,
			default: "Segoe MDL2 Assets"
		},
		fontSize: {
			type: String,
			default: "20px"
		},
		fontStyle: {
			type: String,
			default: "normal"
		},
		glyph: String
	}
};

/* script */
const __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "font-icon" }, [
    _c("p", {
      style: {
        "font-family": _vm.fontFamily,
        "font-size": _vm.fontSize,
        "font-style": _vm.fontStyle
      },
      domProps: { innerHTML: _vm._s(_vm.glyph) }
    })
  ])
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  const __vue_inject_styles__$b = undefined;
  /* scoped */
  const __vue_scope_id__$b = undefined;
  /* module identifier */
  const __vue_module_identifier__$b = undefined;
  /* functional template */
  const __vue_is_functional_template__$b = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var FontIcon = normalizeComponent_1(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//

var script$c = {
	name: "MetroGridView",
	props: {
		itemsSource: Array,
		flowDirection: {
			type: String,
			default: "left-to-right",
			validator: value => {
				return ["left-to-right", "right-to-left"].indexOf(value) >= 0
			}
		},
		selectionMode: {
			type: String,
			default: "none",
			validator: value => {
				return ["none", "single", "multiple"].indexOf(value) >= 0
			}
		}
	},
	data() {
		return {
			selectedItems: []
		}
	},
	methods: {
		_selectItem(event, index) {
			switch (this.selectionMode) {
				case "none": return;
				case "single":
					if ((navigator.userAgent.match(/windows|linux/i) && event.ctrlKey) || (navigator.userAgent.match(/macintosh/i) && event.metaKey) || "ontouchend" in window) {
						if (this.selectedItems.indexOf(index) >= 0) {
							this.selectedItems = [];
						} else {
							this.selectedItems = [index];
						}
					} else {
						if (this.selectedItems.indexOf(index) >= 0) return;
						this.selectedItems = [index];
					}
					break;
				case "multiple":
					if ((navigator.userAgent.match(/windows|linux/i) && event.ctrlKey) || (navigator.userAgent.match(/macintosh/i) && event.metaKey) || "ontouchend" in window) {
						if (this.selectedItems.indexOf(index) >= 0) {
							this.selectedItems.splice(this.selectedItems.indexOf(index), 1);
						} else {
							this.selectedItems.push(index);
						}
					} else {
						this.selectedItems = [index];
					}
					break;
				default: return;
			}
			
			this.$emit("selectionChanged", this, {});
		}
	}
};

/* script */
const __vue_script__$c = script$c;

/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: "grid-view " + _vm.flowDirection },
    _vm._l(_vm.itemsSource, function(item, index) {
      return _c(
        "div",
        {
          key: index,
          staticClass: "grid-view-item",
          class: { selected: _vm.selectedItems.indexOf(index) >= 0 },
          on: {
            click: function($event) {
              return _vm._selectItem($event, index)
            }
          }
        },
        [
          _c(
            "div",
            { staticClass: "grid-view-item-content" },
            [_vm._t("item-template", null, { local: item })],
            2
          )
        ]
      )
    }),
    0
  )
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  const __vue_inject_styles__$c = undefined;
  /* scoped */
  const __vue_scope_id__$c = undefined;
  /* module identifier */
  const __vue_module_identifier__$c = undefined;
  /* functional template */
  const __vue_is_functional_template__$c = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var GridView = normalizeComponent_1(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    undefined,
    undefined
  );

//
//
//
//
//
//
//

var script$d = {
	name: "MetroHyperlinkButton",
	props: {
		content: String,
		navigateUri: String,
		disabled: Boolean
	},
	methods: {

		onClick(e) {
			if (!this.navigateUri) e.preventDefault();
			this.$emit("click", e);
		},
	}
};

/* script */
const __vue_script__$d = script$d;

/* template */
var __vue_render__$d = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "a",
    {
      staticClass: "hyperlink-button",
      attrs: {
        href: _vm.navigateUri ? _vm.navigateUri : "#",
        disabled: _vm.disabled
      },
      on: { click: _vm.onClick }
    },
    [
      _vm._t("default"),
      _vm._v(" "),
      !this.$slots.default ? [_vm._v(_vm._s(_vm.content))] : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  const __vue_inject_styles__$d = undefined;
  /* scoped */
  const __vue_scope_id__$d = undefined;
  /* module identifier */
  const __vue_module_identifier__$d = undefined;
  /* functional template */
  const __vue_is_functional_template__$d = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var HyperlinkButton = normalizeComponent_1(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

Array.prototype.firstObject = function() {
	return this[0];
};
Array.prototype.lastObject = function() {
	return this[this.length - 1];
};

var script$e = {
	name: "MetroMessages",
	props: {
		useTextarea: Boolean,
		disabled: Boolean,
		showInput: {
			type: Boolean,
			default: true
		},
		placeholderText: {
			type: String,
			default: "Type a text message"
		},
		messages: {
			type: Array,
			default: () => ([])
		}
	},
	data() {
		return {
			_messages: [],
			messageText: ""
		}
	},
	mounted() {
		this.$data._messages = [];
		this.messages.forEach(messageObj => {
			this.addMessage(messageObj);
		});
	},
	methods: {
		_onInput(e) {
			this.messageText = e.target.value;
			
			e.target.style.height = null;
			e.target.style.height = `${Math.min(70, e.target.scrollHeight)}px`;
			
			this._scrollToBottom();
		},
		_onKeyDown(e) {
			if (e.keyCode == 13 && !e.shiftKey) {
				this._sendMessage();
				e.preventDefault();
			}
		},
		_scrollToBottom() {
			setTimeout(() => {
				this.$refs["container"].scrollTo(0, this.$refs["container"].scrollHeight);
			});
		},
		_sendMessage() {
			if (!this.messageText.length) return;

			this.$emit("messageSent", this.messageText);
			this.messageText = "";
			this.$refs["input"].value = null;
			
			this.$refs["input"].style.height = null;
		},
		_renderMessage(messageText) {
			messageText = messageText.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
				return '&#'+i.charCodeAt(0)+';';
			 }).replace(/\n/g, "<br>");

			 if (typeof this.onMessageRender === "function") {
				messageText = this.onMessageRender(messageText);
			}

			return messageText
		},
		
		addMessage(message) {
			if (this.$data._messages.lastObject()) {
				const lastMessage = this.$data._messages.lastObject();

				if (lastMessage.type != "sent" && message.type == "sent") {
					message.hasTail = true;
					message.isFirst = true;
				} else if (lastMessage.type == "sent" && message.type == "sent") {
					lastMessage.hasTail = false;
					message.hasTail = true;
				}

				if (lastMessage.type != "received" && message.type == "received") {
					message.hasTail = true;
				} else if (lastMessage.type == "received" && message.type == "received") {
					if (message.author != lastMessage.author) {
						message.hasTail = true;
						message.isFirst = true;
					} else {
						message.hasTail = false;
					}
				}
			} else {
				message.hasTail = true;
				message.isFirst = true;
			}

			message.text = this._renderMessage(message.text);
			this.$data._messages.push(message);

			this._scrollToBottom();
		},
		addSystemMessage(text) {
			this.$data._messages.push({ type: "system", text: text });

			this._scrollToBottom();
		},
		setMessages(messageData) {
			this.$data._messages = [];
			messageData.forEach(messageObj => {
				this.addMessage(messageObj);
			});
		}
	},
	filters: {
		time(date) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
	}
};

/* script */
const __vue_script__$e = script$e;

/* template */
var __vue_render__$e = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "messages" },
    [
      _c(
        "div",
        { ref: "container", staticClass: "messages-container" },
        [
          _c(
            "MetroStackPanel",
            {
              staticClass: "messages-wrapper",
              attrs: { "vertical-alignment": "bottom" }
            },
            _vm._l(_vm.$data._messages, function(messageObj, index) {
              var _obj;
              return _c(
                "div",
                {
                  key: index,
                  class: ((_obj = { message: messageObj.type != "system" }),
                  (_obj["message-" + messageObj.type] = true),
                  (_obj["message-tail"] = messageObj.hasTail),
                  (_obj["message-first"] = messageObj.isFirst),
                  _obj)
                },
                [
                  [
                    _c("div", { staticClass: "message-content" }, [
                      _c(
                        "div",
                        { staticClass: "message-bubble" },
                        [
                          _c(
                            "MetroTextBlock",
                            { staticClass: "message-text" },
                            [
                              _c("span", {
                                domProps: { innerHTML: _vm._s(messageObj.text) }
                              })
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "MetroStackPanel",
                            {
                              staticClass: "message-info",
                              attrs: {
                                orientation: "horizontal",
                                "vertical-alignment": "center"
                              }
                            },
                            [
                              _c(
                                "MetroTextBlock",
                                {
                                  staticClass: "message-time",
                                  attrs: { "text-style": "caption" }
                                },
                                [
                                  _vm._v(
                                    _vm._s(_vm._f("time")(messageObj.date))
                                  )
                                ]
                              ),
                              _vm._v(" "),
                              _c(
                                "MetroTextBlock",
                                {
                                  staticClass: "message-name",
                                  attrs: {
                                    "text-style": "base",
                                    "text-alignment": "right"
                                  }
                                },
                                [
                                  _vm._v(
                                    _vm._s(
                                      messageObj.displayName ||
                                        messageObj.author
                                    )
                                  )
                                ]
                              )
                            ],
                            1
                          )
                        ],
                        1
                      )
                    ])
                  ],
                  _vm._v(" "),
                  messageObj.type === "system"
                    ? [_c("span", [_vm._v(_vm._s(messageObj.text))])]
                    : _vm._e()
                ],
                2
              )
            }),
            0
          )
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "MetroStackPanel",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.showInput,
              expression: "showInput"
            }
          ],
          staticClass: "messages-input",
          attrs: { orientation: "horizontal", "vertical-alignment": "top" }
        },
        [
          _c("textarea", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.messageText,
                expression: "messageText"
              }
            ],
            ref: "input",
            attrs: { placeholder: _vm.placeholderText, disabled: _vm.disabled },
            domProps: { value: _vm.messageText },
            on: {
              input: [
                function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.messageText = $event.target.value;
                },
                _vm._onInput
              ],
              keydown: _vm._onKeyDown
            }
          }),
          _vm._v(" "),
          _c(
            "MetroButton",
            {
              staticClass: "send-message",
              attrs: { disabled: !_vm.messageText.length },
              on: { click: _vm._sendMessage }
            },
            [_c("MetroSymbolIcon", { attrs: { symbol: "send" } })],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  const __vue_inject_styles__$e = undefined;
  /* scoped */
  const __vue_scope_id__$e = undefined;
  /* module identifier */
  const __vue_module_identifier__$e = undefined;
  /* functional template */
  const __vue_is_functional_template__$e = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var Messages = normalizeComponent_1(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$f = {
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
						this.expanded = false;
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
							this.expanded = false;
							
							setTimeout(() => {
								this.navigate(item.__vue__.$props.pageId);
							}, 350);
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
				this.expanded = !this.expanded;
			} else {
				this.collapsed = !this.collapsed;
			}
		},
		focusAutoSuggest() {
			if (!this.$el.querySelector(".auto-suggest-area input")) return;
			
			if (window.innerWidth < 1008) {
				this.expanded = true;
			} else {
				this.collapsed = false;
			}
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
};

/* script */
const __vue_script__$f = script$f;

/* template */
var __vue_render__$f = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: "navigation-view " + _vm.$data._paneDisplayMode },
    [
      _c(
        "MetroStackPanel",
        {
          staticClass: "pane-toggle-button-container",
          class: { collapsed: _vm.collapsed, expanded: _vm.expanded },
          attrs: { "horizontal-alignment": "left" }
        },
        [
          _vm.backButtonVisible
            ? _c(
                "MetroButton",
                {
                  staticClass: "navigation-view-back-button",
                  attrs: { disabled: _vm.history.length <= 1 },
                  on: { click: _vm.goBack }
                },
                [_c("MetroSymbolIcon", { attrs: { symbol: "back" } })],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _c(
            "MetroButton",
            {
              staticClass: "toggle-pane-button",
              class: { fill: _vm.paneTitle },
              on: { click: _vm.togglePane }
            },
            [
              _c("MetroSymbolIcon", {
                attrs: { symbol: "global-navigation-button" }
              })
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass: "pane-content acrylic acrylic-80",
          class: {
            collapsed: _vm.collapsed,
            expanded: _vm.expanded,
            "back-button-visible": _vm.backButtonVisible
          }
        },
        [
          _c(
            "MetroStackPanel",
            {
              staticClass: "pane-toggle-button-container",
              class: { collapsed: _vm.collapsed, expanded: _vm.expanded },
              attrs: { "horizontal-alignment": "left" }
            },
            [
              _c(
                "MetroButton",
                {
                  staticClass: "toggle-pane-button",
                  class: { fill: _vm.paneTitle },
                  on: { click: _vm.togglePane }
                },
                [
                  _c("MetroSymbolIcon", {
                    attrs: { symbol: "global-navigation-button" }
                  })
                ],
                1
              )
            ],
            1
          ),
          _vm._v(" "),
          _vm.paneTitle
            ? _c(
                "MetroStackPanel",
                {
                  staticClass: "pane-title",
                  attrs: {
                    orientation: "horizontal",
                    "vertical-alignment": "center"
                  }
                },
                [
                  _c("MetroTextBlock", {
                    attrs: { "text-style": "base", text: _vm.paneTitle }
                  })
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          this.$slots["auto-suggest-box"]
            ? _c(
                "MetroStackPanel",
                {
                  staticClass: "auto-suggest-area",
                  attrs: {
                    orientation: "horizontal",
                    "vertical-alignment": "center"
                  }
                },
                [
                  _vm._t("auto-suggest-box"),
                  _vm._v(" "),
                  _c(
                    "MetroButton",
                    {
                      staticClass: "auto-suggest-button",
                      on: { click: _vm.focusAutoSuggest }
                    },
                    [_c("MetroSymbolIcon", { attrs: { symbol: "find" } })],
                    1
                  )
                ],
                2
              )
            : _vm._e(),
          _vm._v(" "),
          _c(
            "MetroStackPanel",
            {
              ref: "menu-items",
              staticClass: "menu-items",
              attrs: { "vertical-alignment": "top" }
            },
            [_vm._t("menu-items")],
            2
          ),
          _vm._v(" "),
          _vm.settingsVisible || this.$slots["pane-footer"]
            ? _c(
                "MetroStackPanel",
                {
                  ref: "footer-content",
                  staticClass: "footer-content",
                  attrs: { "vertical-alignment": "top" }
                },
                [
                  _vm._t("pane-footer"),
                  _vm._v(" "),
                  _vm.settingsVisible
                    ? _c("MetroNavigationViewItem", {
                        ref: "settings-nav-pane-item",
                        attrs: {
                          icon: "setting",
                          content: "Settings",
                          "page-id": "settings"
                        }
                      })
                    : _vm._e()
                ],
                2
              )
            : _vm._e()
        ],
        1
      ),
      _vm._v(" "),
      _c("div", { staticClass: "content-root" }, [
        _vm.headerText || this.$slots["header"]
          ? _c(
              "div",
              {
                staticClass: "header-content",
                class: { "back-button-visible": _vm.backButtonVisible }
              },
              [
                _vm._t("header", null, { local: _vm.headerText }),
                _vm._v(" "),
                this.$slots["header"] === null
                  ? _c("MetroTextBlock", { attrs: { text: _vm.headerText } })
                  : _vm._e()
              ],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          { ref: "content-frame", staticClass: "content-frame" },
          [_vm._t("default")],
          2
        )
      ])
    ],
    1
  )
};
var __vue_staticRenderFns__$f = [];
__vue_render__$f._withStripped = true;

  /* style */
  const __vue_inject_styles__$f = undefined;
  /* scoped */
  const __vue_scope_id__$f = undefined;
  /* module identifier */
  const __vue_module_identifier__$f = undefined;
  /* functional template */
  const __vue_is_functional_template__$f = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var NavigationView = normalizeComponent_1(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$g = {
	name: "MetroNavigationViewItem",
	props: {
		icon: String,
		content: String,
		pageId: String,
		disabled: Boolean,
		selected: Boolean
	}
};

/* script */
const __vue_script__$g = script$g;

/* template */
var __vue_render__$g = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "navigation-view-item",
      class: { icon: _vm.icon || this.$slots.icon },
      attrs: { "data-page-id": _vm.pageId, disabled: _vm.disabled }
    },
    [
      _c("div", { staticClass: "navigation-view-item-inner" }, [
        _vm.icon || this.$slots.icon
          ? _c(
              "div",
              { staticClass: "navigation-view-item-icon" },
              [
                _vm._t("icon"),
                _vm._v(" "),
                _vm.icon && !this.$slots.icon
                  ? _c("MetroSymbolIcon", { attrs: { symbol: _vm.icon } })
                  : _vm._e()
              ],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "navigation-view-item-content" },
          [
            _vm._t("default"),
            _vm._v(" "),
            !this.$slots.default
              ? _c("MetroTextBlock", { attrs: { text: _vm.content } })
              : _vm._e()
          ],
          2
        )
      ])
    ]
  )
};
var __vue_staticRenderFns__$g = [];
__vue_render__$g._withStripped = true;

  /* style */
  const __vue_inject_styles__$g = undefined;
  /* scoped */
  const __vue_scope_id__$g = undefined;
  /* module identifier */
  const __vue_module_identifier__$g = undefined;
  /* functional template */
  const __vue_is_functional_template__$g = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var NavigationViewItem = normalizeComponent_1(
    { render: __vue_render__$g, staticRenderFns: __vue_staticRenderFns__$g },
    __vue_inject_styles__$g,
    __vue_script__$g,
    __vue_scope_id__$g,
    __vue_is_functional_template__$g,
    __vue_module_identifier__$g,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$h = {
	name: "MetroNavigationViewItemHeader",
	props: {
		content: String
	}
};

/* script */
const __vue_script__$h = script$h;

/* template */
var __vue_render__$h = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "navigation-view-item-header" },
    [_c("MetroTextBlock", { attrs: { textStyle: "base", text: _vm.content } })],
    1
  )
};
var __vue_staticRenderFns__$h = [];
__vue_render__$h._withStripped = true;

  /* style */
  const __vue_inject_styles__$h = undefined;
  /* scoped */
  const __vue_scope_id__$h = undefined;
  /* module identifier */
  const __vue_module_identifier__$h = undefined;
  /* functional template */
  const __vue_is_functional_template__$h = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var NavigationViewItemHeader = normalizeComponent_1(
    { render: __vue_render__$h, staticRenderFns: __vue_staticRenderFns__$h },
    __vue_inject_styles__$h,
    __vue_script__$h,
    __vue_scope_id__$h,
    __vue_is_functional_template__$h,
    __vue_module_identifier__$h,
    undefined,
    undefined
  );

//
//
//
//

var script$i = {
	name: "MetroNavigationViewItemSeparator"
};

/* script */
const __vue_script__$i = script$i;

/* template */
var __vue_render__$i = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "navigation-view-item-separator" })
};
var __vue_staticRenderFns__$i = [];
__vue_render__$i._withStripped = true;

  /* style */
  const __vue_inject_styles__$i = undefined;
  /* scoped */
  const __vue_scope_id__$i = undefined;
  /* module identifier */
  const __vue_module_identifier__$i = undefined;
  /* functional template */
  const __vue_is_functional_template__$i = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var NavigationViewItemSeparator = normalizeComponent_1(
    { render: __vue_render__$i, staticRenderFns: __vue_staticRenderFns__$i },
    __vue_inject_styles__$i,
    __vue_script__$i,
    __vue_scope_id__$i,
    __vue_is_functional_template__$i,
    __vue_module_identifier__$i,
    undefined,
    undefined
  );

//

var script$j = {
	name: "MetroRadioButton",
	props: {
		groupName: String,
		name: null,
		content: String,
		disabled: Boolean,
		value: null
	},
	data() {
		return {
			uuid: uuid()
		}
	},
	methods: {
		_onChange(e) {
			if (e.target.checked) {
				this.$emit("checked", e);
			} else {
				this.$emit("unchecked", e);
			}
			
			this.$emit("input", e.target.value);
		}
	},
	computed: {
		checked() {
			return this.value === this.name;
		}
	}
};

/* script */
const __vue_script__$j = script$j;

/* template */
var __vue_render__$j = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "radio-button",
      attrs: { disabled: _vm.disabled },
      on: { change: _vm._onChange }
    },
    [
      _c("input", {
        attrs: { type: "radio", id: _vm.uuid, name: _vm.groupName },
        domProps: { checked: _vm.checked, value: _vm.name }
      }),
      _vm._v(" "),
      _c("label", { attrs: { for: _vm.uuid } }, [_vm._v(_vm._s(_vm.content))])
    ]
  )
};
var __vue_staticRenderFns__$j = [];
__vue_render__$j._withStripped = true;

  /* style */
  const __vue_inject_styles__$j = undefined;
  /* scoped */
  const __vue_scope_id__$j = undefined;
  /* module identifier */
  const __vue_module_identifier__$j = undefined;
  /* functional template */
  const __vue_is_functional_template__$j = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var RadioButton = normalizeComponent_1(
    { render: __vue_render__$j, staticRenderFns: __vue_staticRenderFns__$j },
    __vue_inject_styles__$j,
    __vue_script__$j,
    __vue_scope_id__$j,
    __vue_is_functional_template__$j,
    __vue_module_identifier__$j,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$k = {
	name: "MetroRatingControl",
	props: {
		name: String,
		value: {
			type: Number,
			default: -1
		},
		required: Boolean,
	},
	data() {
		return {
			_value: this.$props.value,
			hoverValue: 0
		}
	},
	methods: {
		setHoverValue(value) {
			this.hoverValue = value;
		},
		setValue(value) {
			this.$data._value = value;
			this.$emit("input", this.$data._value);
		}
	}
};

/* script */
const __vue_script__$k = script$k;

/* template */
var __vue_render__$k = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "rating-control",
      on: {
        mouseleave: function($event) {
          return _vm.setHoverValue(0)
        }
      }
    },
    [
      _c("input", {
        directives: [
          {
            name: "model",
            rawName: "v-model",
            value: _vm.$data._value,
            expression: "$data._value"
          }
        ],
        attrs: {
          type: "number",
          min: "1",
          max: "5",
          name: _vm.name,
          required: _vm.required,
          readonly: ""
        },
        domProps: { value: _vm.$data._value },
        on: {
          input: function($event) {
            if ($event.target.composing) {
              return
            }
            _vm.$set(_vm.$data, "_value", $event.target.value);
          }
        }
      }),
      _vm._v(" "),
      _c(
        "MetroStackPanel",
        {
          attrs: { orientation: "horizontal", "horizontal-alignment": "left" }
        },
        _vm._l(Array(5), function(_, index) {
          return _c(
            "div",
            {
              key: "bg_" + index,
              staticStyle: { width: "22px", height: "22px" },
              on: {
                mouseenter: function($event) {
                  return _vm.setHoverValue(index + 1)
                },
                click: function($event) {
                  return _vm.setValue(index + 1)
                }
              }
            },
            [_c("MetroSymbolIcon", { attrs: { icon: "favorite-star-fill" } })],
            1
          )
        }),
        0
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass: "foreground-content",
          class: { colored: _vm.$data._value > 0 }
        },
        [
          !_vm.hoverValue && _vm.$data._value >= 0
            ? _c(
                "MetroStackPanel",
                {
                  attrs: {
                    orientation: "horizontal",
                    "horizontal-alignment": "left"
                  }
                },
                _vm._l(Array(_vm.$data._value), function(_, index) {
                  return _c("MetroSymbolIcon", {
                    key: "fg_" + index,
                    attrs: { icon: "favorite-star-fill" }
                  })
                }),
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.hoverValue >= 0
            ? _c(
                "MetroStackPanel",
                {
                  attrs: {
                    orientation: "horizontal",
                    "horizontal-alignment": "left"
                  }
                },
                _vm._l(Array(_vm.hoverValue), function(_, index) {
                  return _c("MetroSymbolIcon", {
                    key: "fg_" + index,
                    class: { "hover-state": index === _vm.hoverValue - 1 },
                    attrs: { icon: "favorite-star-fill" }
                  })
                }),
                1
              )
            : _vm._e()
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$k = [];
__vue_render__$k._withStripped = true;

  /* style */
  const __vue_inject_styles__$k = undefined;
  /* scoped */
  const __vue_scope_id__$k = undefined;
  /* module identifier */
  const __vue_module_identifier__$k = undefined;
  /* functional template */
  const __vue_is_functional_template__$k = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var RatingControl = normalizeComponent_1(
    { render: __vue_render__$k, staticRenderFns: __vue_staticRenderFns__$k },
    __vue_inject_styles__$k,
    __vue_script__$k,
    __vue_scope_id__$k,
    __vue_is_functional_template__$k,
    __vue_module_identifier__$k,
    undefined,
    undefined
  );

//
//
//
//
//
//
//

var script$l = {
	name: "MetroTextBlock",
	props: {
		text: null,
		textStyle: {
			type: String,
			default: "body"
		},
		textAlignment: {
			type: String,
			default: "left"
		}
	}
};

/* script */
const __vue_script__$l = script$l;

/* template */
var __vue_render__$l = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "p",
    {
      class: "text-block " + _vm.textStyle,
      style: { "text-align": _vm.textAlignment }
    },
    [
      _vm._t("default"),
      _vm._v(" "),
      !this.$slots.default ? [_vm._v(_vm._s(_vm.text))] : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$l = [];
__vue_render__$l._withStripped = true;

  /* style */
  const __vue_inject_styles__$l = undefined;
  /* scoped */
  const __vue_scope_id__$l = undefined;
  /* module identifier */
  const __vue_module_identifier__$l = undefined;
  /* functional template */
  const __vue_is_functional_template__$l = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var TextBlock = normalizeComponent_1(
    { render: __vue_render__$l, staticRenderFns: __vue_staticRenderFns__$l },
    __vue_inject_styles__$l,
    __vue_script__$l,
    __vue_scope_id__$l,
    __vue_is_functional_template__$l,
    __vue_module_identifier__$l,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$m = {
	name: "MetroTextBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		disabled: Boolean,
		readOnly: Boolean,
		value: null,
		
		minlength: {
			type: Number,
			default: 0
		},
		maxlength: {
			type: Number,
			default: -1
		},
		required: false,
		
		textarea: false
	},
	methods: {
		onInput(e) {
			this.$emit("input", e.target.value);
		},
		onFocus(e) {
			this.$emit("focus", e);
		},
		onBlur(e) {
			this.$emit("blur", e);
		},
		onKeyDown(e) {
			this.$emit("keydown", e);
		},
		onKeyUp(e) {
			this.$emit("keyup", e);
		}
	}
};

/* script */
const __vue_script__$m = script$m;

/* template */
var __vue_render__$m = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "text-box", attrs: { disabled: _vm.disabled } },
    [
      _vm.header ? _c("label", [_vm._v(_vm._s(_vm.header))]) : _vm._e(),
      _vm._v(" "),
      !_vm.textarea
        ? _c("input", {
            attrs: {
              type: "text",
              name: _vm.name,
              placeholder: _vm.placeholderText,
              minlength: _vm.minlength,
              maxlength: _vm.maxlength,
              required: _vm.required,
              autocomplete: "off",
              readonly: _vm.readOnly
            },
            domProps: { value: _vm.value },
            on: {
              input: _vm.onInput,
              focus: _vm.onFocus,
              blur: _vm.onBlur,
              keydown: _vm.onKeyDown,
              keyup: _vm.onKeyUp
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.textarea
        ? _c("textarea", {
            attrs: {
              name: _vm.name,
              placeholder: _vm.placeholderText,
              minlength: _vm.minlength,
              maxlength: _vm.maxlength,
              required: _vm.required,
              autocomplete: "off",
              readonly: _vm.readOnly
            },
            domProps: { value: _vm.value },
            on: {
              input: _vm.onInput,
              focus: _vm.onFocus,
              blur: _vm.onBlur,
              keydown: _vm.onKeyDown,
              keyup: _vm.onKeyUp
            }
          })
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$m = [];
__vue_render__$m._withStripped = true;

  /* style */
  const __vue_inject_styles__$m = undefined;
  /* scoped */
  const __vue_scope_id__$m = undefined;
  /* module identifier */
  const __vue_module_identifier__$m = undefined;
  /* functional template */
  const __vue_is_functional_template__$m = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var TextBox = normalizeComponent_1(
    { render: __vue_render__$m, staticRenderFns: __vue_staticRenderFns__$m },
    __vue_inject_styles__$m,
    __vue_script__$m,
    __vue_scope_id__$m,
    __vue_is_functional_template__$m,
    __vue_module_identifier__$m,
    undefined,
    undefined
  );

//

var script$n = {
	name: "MetroToggleSwitch",
	props: {
		header: String,
		onContent: {
			type: String,
			default: "On",
		},
		offContent: {
			type: String,
			default: "Off",
		},
		disabled: Boolean,
		value: Boolean
	},
	data() {
		return {
			uuid: uuid(),
			checked: this.$props.value
		}
	},
	methods: {
		_onChange(e) {
			this.$data.checked = e.target.checked;
			
			if (e.target.checked) {
				this.$emit("checked", e);
			} else {
				this.$emit("unchecked", e);
			}
			
			this.$emit("toggled", e.target.checked);
			this.$emit("input", e.target.checked);
		}
	}
};

/* script */
const __vue_script__$n = script$n;

/* template */
var __vue_render__$n = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "toggle-switch", attrs: { disabled: _vm.disabled } },
    [
      _vm.header
        ? _c("label", { staticClass: "header" }, [_vm._v(_vm._s(_vm.header))])
        : _vm._e(),
      _vm._v(" "),
      _c("input", {
        attrs: { type: "checkbox", id: _vm.uuid },
        domProps: { checked: _vm.value },
        on: { change: _vm._onChange }
      }),
      _vm._v(" "),
      _c("label", { staticClass: "switch-knob", attrs: { for: _vm.uuid } }, [
        _c("p", { staticClass: "item-content" }, [
          _vm._v(_vm._s(_vm.checked ? _vm.onContent : _vm.offContent))
        ])
      ])
    ]
  )
};
var __vue_staticRenderFns__$n = [];
__vue_render__$n._withStripped = true;

  /* style */
  const __vue_inject_styles__$n = undefined;
  /* scoped */
  const __vue_scope_id__$n = undefined;
  /* module identifier */
  const __vue_module_identifier__$n = undefined;
  /* functional template */
  const __vue_is_functional_template__$n = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ToggleSwitch = normalizeComponent_1(
    { render: __vue_render__$n, staticRenderFns: __vue_staticRenderFns__$n },
    __vue_inject_styles__$n,
    __vue_script__$n,
    __vue_scope_id__$n,
    __vue_is_functional_template__$n,
    __vue_module_identifier__$n,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$o = {
	name: "MetroPasswordBox",
	props: {
		name: String,
		header: String,
		placeholderText: String,
		disabled: Boolean,
		readOnly: Boolean,
		value: null,
		
		minLength: 0,
		maxLength: -1,
		required: false
	},
	methods: {
		onInput(e) {
			this.$emit("input", e.target.value);
		},
		onFocus(e) {
			this.$emit("focus", e);
		},
		onBlur(e) {
			this.$emit("blur", e);
		},
		onKeyDown(e) {
			this.$emit("keydown", e);
		},
		onKeyUp(e) {
			this.$emit("keyup", e);
		}
	}
};

/* script */
const __vue_script__$o = script$o;

/* template */
var __vue_render__$o = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "password-box", attrs: { disabled: _vm.disabled } },
    [
      _vm.header ? _c("label", [_vm._v(_vm._s(_vm.header))]) : _vm._e(),
      _vm._v(" "),
      _c("input", {
        attrs: {
          type: "password",
          name: _vm.name,
          placeholder: _vm.placeholderText,
          minlength: _vm.minLength,
          maxlength: _vm.maxLength,
          required: _vm.required,
          readonly: _vm.readOnly
        },
        domProps: { value: _vm.value },
        on: {
          input: _vm.onInput,
          focus: _vm.onFocus,
          blur: _vm.onBlur,
          keydown: _vm.onKeyDown,
          keyup: _vm.onKeyUp
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$o = [];
__vue_render__$o._withStripped = true;

  /* style */
  const __vue_inject_styles__$o = undefined;
  /* scoped */
  const __vue_scope_id__$o = undefined;
  /* module identifier */
  const __vue_module_identifier__$o = undefined;
  /* functional template */
  const __vue_is_functional_template__$o = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var PasswordBox = normalizeComponent_1(
    { render: __vue_render__$o, staticRenderFns: __vue_staticRenderFns__$o },
    __vue_inject_styles__$o,
    __vue_script__$o,
    __vue_scope_id__$o,
    __vue_is_functional_template__$o,
    __vue_module_identifier__$o,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$p = {
	name: "MetroPersonPicture",
	props: {
		initials: String,
		displayName: String,
		profilePicture: String,
		badgeText: String,
		badgeGlyph: String
	},
	computed: {
		initialsText() {
			if (this.$props.initials) {
				return this.$props.initials;
			}
			
			if (this.$props.displayName) {
				var names = this.$props.displayName.replace(/_/g, ' ').split(' '),
					initials = names[0].substring(0, 1).toUpperCase();
				
				if (names.length > 1) {
					initials += names[names.length - 1].substring(0, 1).toUpperCase();
				}
				return initials;
			}
		}
	}
};

/* script */
const __vue_script__$p = script$p;

/* template */
var __vue_render__$p = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "person-picture" },
    [
      !_vm.initials && !_vm.displayName && !_vm.profilePicture
        ? _c("MetroSymbolIcon", { attrs: { symbol: "contact" } })
        : _vm._e(),
      _vm._v(" "),
      (_vm.initials || _vm.displayName) && !_vm.profilePicture
        ? _c("MetroTextBlock", {
            staticClass: "initials",
            attrs: { text: _vm.initialsText }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.profilePicture
        ? _c("img", {
            staticClass: "profile-picture",
            attrs: { src: _vm.profilePicture }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.badgeText || _vm.badgeGlyph
        ? _c("div", { staticClass: "badge" }, [
            _c("span", [_vm._v(_vm._s(_vm.badgeText))])
          ])
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$p = [];
__vue_render__$p._withStripped = true;

  /* style */
  const __vue_inject_styles__$p = undefined;
  /* scoped */
  const __vue_scope_id__$p = undefined;
  /* module identifier */
  const __vue_module_identifier__$p = undefined;
  /* functional template */
  const __vue_is_functional_template__$p = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var PersonPicture = normalizeComponent_1(
    { render: __vue_render__$p, staticRenderFns: __vue_staticRenderFns__$p },
    __vue_inject_styles__$p,
    __vue_script__$p,
    __vue_scope_id__$p,
    __vue_is_functional_template__$p,
    __vue_module_identifier__$p,
    undefined,
    undefined
  );

//

var script$q = {
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
			};
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
			
			if (!this.items[itemUuid]) return;
			
			if (this.currentItem) {
				let currentIndex = this.itemOrder.indexOf(this.currentItem);
				let navigateIndex = this.itemOrder.indexOf(itemUuid);
				
				if (navigateIndex === currentIndex) return;
				
				let previousItem = this.currentItem;
				this.currentItem = itemUuid;
				
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
				}, 400);
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
};

/* script */
const __vue_script__$q = script$q;

/* template */
var __vue_render__$q = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "pivot" }, [
    _vm.title || this.$slots["title"]
      ? _c(
          "div",
          { staticClass: "title-content" },
          [
            _vm.title && !this.$slots["title"]
              ? _c("MetroTextBlock", { attrs: { text: _vm.title } })
              : _vm._e(),
            _vm._v(" "),
            _vm._t("title")
          ],
          2
        )
      : _vm._e(),
    _vm._v(" "),
    _c("div", { staticClass: "pivot-header" }, [
      this.$slots["left-header"]
        ? _c("div", { staticClass: "left-header" }, [_vm._t("left-header")], 2)
        : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { ref: "header-clipper", staticClass: "header-clipper" },
        _vm._l(Object.keys(_vm.headerItems), function(_uuid, index) {
          return _c(
            "div",
            {
              key: index,
              staticClass: "pivot-header-item",
              class: { selected: _vm.currentItem === _uuid },
              attrs: {
                "data-item-uuid": _uuid,
                disabled: _vm.headerItems[_uuid].disabled
              },
              on: {
                click: function($event) {
                  return _vm.navigate(_uuid)
                }
              }
            },
            [
              _c("MetroTextBlock", {
                attrs: { text: _vm.headerItems[_uuid].header }
              })
            ],
            1
          )
        }),
        0
      ),
      _vm._v(" "),
      this.$slots["right-header"]
        ? _c(
            "div",
            { staticClass: "right-header" },
            [_vm._t("right-header")],
            2
          )
        : _vm._e()
    ]),
    _vm._v(" "),
    _c(
      "div",
      { ref: "pivot-items", staticClass: "pivot-items" },
      [_vm._t("default")],
      2
    )
  ])
};
var __vue_staticRenderFns__$q = [];
__vue_render__$q._withStripped = true;

  /* style */
  const __vue_inject_styles__$q = undefined;
  /* scoped */
  const __vue_scope_id__$q = undefined;
  /* module identifier */
  const __vue_module_identifier__$q = undefined;
  /* functional template */
  const __vue_is_functional_template__$q = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var Pivot = normalizeComponent_1(
    { render: __vue_render__$q, staticRenderFns: __vue_staticRenderFns__$q },
    __vue_inject_styles__$q,
    __vue_script__$q,
    __vue_scope_id__$q,
    __vue_is_functional_template__$q,
    __vue_module_identifier__$q,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$r = {
	name: "MetroPivotItem",
	props: {
		header: String,
		disabled: Boolean
	}
};

/* script */
const __vue_script__$r = script$r;

/* template */
var __vue_render__$r = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "pivot-item", attrs: { disabled: _vm.disabled } },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__$r = [];
__vue_render__$r._withStripped = true;

  /* style */
  const __vue_inject_styles__$r = undefined;
  /* scoped */
  const __vue_scope_id__$r = undefined;
  /* module identifier */
  const __vue_module_identifier__$r = undefined;
  /* functional template */
  const __vue_is_functional_template__$r = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var PivotItem = normalizeComponent_1(
    { render: __vue_render__$r, staticRenderFns: __vue_staticRenderFns__$r },
    __vue_inject_styles__$r,
    __vue_script__$r,
    __vue_scope_id__$r,
    __vue_is_functional_template__$r,
    __vue_module_identifier__$r,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//

var script$s = {
	name: "MetroProgressBar",
	props: {
		value: 0,
		minimum: {
			type: Number,
			default: 0
		},
		maximum: {
			type: Number,
			default: 100
		},
		indeterminate: Boolean
	},
	computed: {
		indicatorWidth() {
			return Math.min(Math.max(((this.value - this.minimum) * 100) / (this.maximum - this.minimum), 0), 100);
		}
	}
};

/* script */
const __vue_script__$s = script$s;

/* template */
var __vue_render__$s = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "progress-bar" }, [
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: !_vm.indeterminate,
            expression: "!indeterminate"
          }
        ],
        staticClass: "determinate-root"
      },
      [
        _c("div", {
          staticClass: "progress-bar-indicator",
          style: "width: " + _vm.indicatorWidth + "%"
        })
      ]
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.indeterminate,
            expression: "indeterminate"
          }
        ],
        staticClass: "indeterminate-root"
      },
      _vm._l(Array(5), function(item, index) {
        return _c("div", {
          key: index,
          staticClass: "ellipse",
          style:
            "transform: translate3d(" +
            index * -8 +
            "px, 0, 0); animation-delay: " +
            (-3880 + index * 100) +
            "ms"
        })
      }),
      0
    )
  ])
};
var __vue_staticRenderFns__$s = [];
__vue_render__$s._withStripped = true;

  /* style */
  const __vue_inject_styles__$s = undefined;
  /* scoped */
  const __vue_scope_id__$s = undefined;
  /* module identifier */
  const __vue_module_identifier__$s = undefined;
  /* functional template */
  const __vue_is_functional_template__$s = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ProgressBar = normalizeComponent_1(
    { render: __vue_render__$s, staticRenderFns: __vue_staticRenderFns__$s },
    __vue_inject_styles__$s,
    __vue_script__$s,
    __vue_scope_id__$s,
    __vue_is_functional_template__$s,
    __vue_module_identifier__$s,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$t = {
	name: "MetroProgressRing",
	props: {
		active: Boolean
	}
};

/* script */
const __vue_script__$t = script$t;

/* template */
var __vue_render__$t = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.active,
          expression: "active"
        }
      ],
      staticClass: "progress-ring"
    },
    _vm._l(Array(6), function(item, index) {
      return _c("div", {
        key: index,
        staticClass: "ellipse",
        style: "animation-delay: " + (-4260 + index * 166) + "ms"
      })
    }),
    0
  )
};
var __vue_staticRenderFns__$t = [];
__vue_render__$t._withStripped = true;

  /* style */
  const __vue_inject_styles__$t = undefined;
  /* scoped */
  const __vue_scope_id__$t = undefined;
  /* module identifier */
  const __vue_module_identifier__$t = undefined;
  /* functional template */
  const __vue_is_functional_template__$t = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ProgressRing = normalizeComponent_1(
    { render: __vue_render__$t, staticRenderFns: __vue_staticRenderFns__$t },
    __vue_inject_styles__$t,
    __vue_script__$t,
    __vue_scope_id__$t,
    __vue_is_functional_template__$t,
    __vue_module_identifier__$t,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//

var script$u = {
	name: "MetroPathIcon",
	props: {
		data: String
	}
};

/* script */
const __vue_script__$u = script$u;

/* template */
var __vue_render__$u = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "path-icon" }, [
    _c(
      "svg",
      {
        attrs: {
          width: "20px",
          height: "20px",
          viewBox: "0 0 20 20",
          version: "1.1",
          xmlns: "http://www.w3.org/2000/svg"
        }
      },
      [_c("path", { attrs: { d: _vm.data } })]
    )
  ])
};
var __vue_staticRenderFns__$u = [];
__vue_render__$u._withStripped = true;

  /* style */
  const __vue_inject_styles__$u = undefined;
  /* scoped */
  const __vue_scope_id__$u = undefined;
  /* module identifier */
  const __vue_module_identifier__$u = undefined;
  /* functional template */
  const __vue_is_functional_template__$u = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var PathIcon = normalizeComponent_1(
    { render: __vue_render__$u, staticRenderFns: __vue_staticRenderFns__$u },
    __vue_inject_styles__$u,
    __vue_script__$u,
    __vue_scope_id__$u,
    __vue_is_functional_template__$u,
    __vue_module_identifier__$u,
    undefined,
    undefined
  );

//
//
//
//
//
//
//

var script$v = {
	name: "MetroSymbolIcon",
	props: {
		symbol: String,
		icon: String
	}
};

/* script */
const __vue_script__$v = script$v;

/* template */
var __vue_render__$v = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "symbol-icon" }, [
    _vm.symbol && !_vm.icon
      ? _c("i", { class: "symbol " + _vm.symbol })
      : _vm._e(),
    _vm._v(" "),
    !_vm.symbol && _vm.icon ? _c("i", { class: "icon " + _vm.icon }) : _vm._e()
  ])
};
var __vue_staticRenderFns__$v = [];
__vue_render__$v._withStripped = true;

  /* style */
  const __vue_inject_styles__$v = undefined;
  /* scoped */
  const __vue_scope_id__$v = undefined;
  /* module identifier */
  const __vue_module_identifier__$v = undefined;
  /* functional template */
  const __vue_is_functional_template__$v = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var SymbolIcon = normalizeComponent_1(
    { render: __vue_render__$v, staticRenderFns: __vue_staticRenderFns__$v },
    __vue_inject_styles__$v,
    __vue_script__$v,
    __vue_scope_id__$v,
    __vue_is_functional_template__$v,
    __vue_module_identifier__$v,
    undefined,
    undefined
  );

//
//
//
//
//
//

var script$w = {
	name: "MetroStackPanel",
	props: {
		orientation: {
			type: String,
			default: "vertical",
			validator: value => {
				return ["horizontal", "vertical"].indexOf(value) >= 0;
			}
		},
		horizontalAlignment: {
			type: String,
			default: "stretch",
			validator: value => {
				return ["left", "center", "right", "stretch"].indexOf(value) >= 0;
			}
		},
		verticalAlignment: {
			type: String,
			default: "stretch",
			validator: value => {
				return ["top", "center", "bottom", "stretch"].indexOf(value) >= 0;
			}
		}
	}
};

/* script */
const __vue_script__$w = script$w;

/* template */
var __vue_render__$w = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      class:
        "stack-panel " +
        _vm.orientation +
        " x-" +
        _vm.horizontalAlignment +
        " y-" +
        _vm.verticalAlignment
    },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__$w = [];
__vue_render__$w._withStripped = true;

  /* style */
  const __vue_inject_styles__$w = undefined;
  /* scoped */
  const __vue_scope_id__$w = undefined;
  /* module identifier */
  const __vue_module_identifier__$w = undefined;
  /* functional template */
  const __vue_is_functional_template__$w = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var StackPanel = normalizeComponent_1(
    { render: __vue_render__$w, staticRenderFns: __vue_staticRenderFns__$w },
    __vue_inject_styles__$w,
    __vue_script__$w,
    __vue_scope_id__$w,
    __vue_is_functional_template__$w,
    __vue_module_identifier__$w,
    undefined,
    undefined
  );

const components = [
	View,
	Page,
	
	AppBarButton,
	AppBarSeparator,
	Button,
	CheckBox,
	ComboBox,
	CommandBar,
	DataGrid,
	FlipView,
	FlipViewItem,
	FontIcon,
	GridView,
	HyperlinkButton,
	Messages,
	NavigationView,
	NavigationViewItem,
	NavigationViewItemHeader,
	NavigationViewItemSeparator,
	RadioButton,
	RatingControl,
	TextBlock,
	TextBox,
	ToggleSwitch,
	PasswordBox,
	PersonPicture,
	Pivot,
	PivotItem,
	ProgressBar,
	ProgressRing,
	
	PathIcon,
	SymbolIcon,
	StackPanel
];

var index$1 = Vue => {
	components.forEach(item => Vue.component(item.name, item));
};

var Components = /*#__PURE__*/Object.freeze({
	'default': index$1
});

// const metroUI = Vue => {
// 	Object.values(Components).forEach(Component => {
// 		Vue.use(Component)
// 	})
// }

// Object.keys(Classes).forEach(ClassKey => {
// 	metroUI[ClassKey] = Classes[ClassKey]
// })

// window.metroUI = metroUI;
// export default metroUI;

const metroUI = window.metroUI = {};
Object.keys(Classes).forEach(ClassKey => {
	metroUI[ClassKey] = Classes[ClassKey];
});

function install(Vue) {
	Object.values(Components).forEach(Component => {
		Vue.use(Component);
	});
}

var index$2 = { 
	components: Components,
	install: install
};

export default index$2;
export { Classes, Components };
