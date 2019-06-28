import crypto from "crypto";
import Vue from "vue";

/**
 * Helper methods to get the first and last objects in an array
 */
Array.prototype.firstObject = function() {
	return this[0];
}
Array.prototype.lastObject = function() {
	return this[this.length - 1];
}



/**
 * Returns the index of a node in a parent node
 * @param {HTMLElement} node The node to get the index for
 */
var findInRow = (node) => {
	var i = 0;
	while (node = node.previousSibling) {
		if (node.nodeType === 1) { ++i; }
	}

	return i;
}

/**
 * Gets the absolute position of an element on the current page
 * @param {HTMLElement} element The node to get the absolute position for
 */
var cumulativeOffset = (element) => {
	var top = 0, left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	return {
		top: top,
		left: left
	};
};

/**
 *
 */
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



/**
 * Vue NodeRenderer helper
 */
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



/**
 * Our global metroUI object
 * We're also adding it to the window object to access it from anywhere
 */
var metroUI = window.metroUI = {};

// Store all views in here
metroUI.views = {};



/**
 * The 'View' class contains references to Pages, allows
 * navigating between them and its visibility can be toggled
 */
metroUI.View = class {
	constructor(element, params) {
		let view = this;
		view.container = element;

		view.params = {
			isPrimaryView: false
		};
		for (var param in params) {
			view.params[param] = params[param];
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
				view.pages[item.getAttribute("data-page-id")] = new metroUI.Page(item, {
					parentView: view,
					isPrimaryPage: index == 0
				});

				if (index == 0) {
					view._currentPage = view.pages[item.getAttribute("data-page-id")];
					view._history.push(item.getAttribute("data-page-id"));
				}
			}
		});
	}

	/**
	 * Navigate to a page this view references
	 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this view
	 * @param {Object} _options An object containing the 'addHistory' flag to specify the use of history
	 */
	navigate(pageName, _options) {
		const view = this;

		var options = {
			//url: null,
			addHistory: true
		}
		for (var option in _options) {
			options[option] = _options[option];
		}

		let page = view.pages[pageName];
		if (page) {
			if (page.isVisible) return;
			page.show();
			view._currentPage = page;

			if (options.addHistory) {
				view._history.push(pageName);
			}
		}
	}

	/**
	 * Show the last page stored in the hitory array
	 */
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
	}

	/**
	 * Show this view while hiding any other view
	 */
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
	}

	/**
	 * Hide this view
	 */
	hide() {
		this.container.classList.remove("view-active");
		this.container.dispatchEvent(new Event("viewHide"));
	}

	/**
	 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
	 * @param {String} query The CSS-like query to select
	 */
	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

/**
 * The 'Page' class references DOM pages (.page) and
 * its visibility can be toggled
 */
metroUI.Page = class {
	constructor(element, params) {
		let page = this;
		page.container = element;

		page.params = {
			parentView: null,
			parentPage: null,
			isPrimaryPage: false,
			title: null
		};
		for (var param in params) {
			page.params[param] = params[param];
		}

		if (page.params.isPrimaryPage) {
			page.container.classList.add("page-active");
		}

		page._scrollTop = null;
	}

	/**
	 * Show this page while hiding any other page in
	 * a) the parent page (eg. NavigatioView)
	 * b) the parent view
	 */
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
	}

	/**
	 * Hide this page
	 */
	hide() {
		this.container.classList.remove("page-active");
		this.container.dispatchEvent(new Event("pageHide"));
	}

	/**
	 * Returns true if this page is currently visible, otherwise false
	 */
	get isVisible() {
		return this.container.classList.contains("page-active");
	}

	/**
	 * Get this page's data, mainly used for navigation
	 */
	get pageData() {
		const page = this;

		return {
			id: page.container.getAttribute("data-page-id"),
			container: page.container,
			view: page.params.parentView,
			parentPage: page.params.parentPage,
			title: page.params.title
		}
	}

	/**
	 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
	 * @param {String} query The CSS-like query to select
	 */
	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

/**
 * Enum containing possible ContentDialogResult values
 */
metroUI.ContentDialogResult = {
	None: 0,
	Primary: 1,
	Secondary: 2
};

/**
 * The 'ContentDialog' class can be used as a replacement for
 * alert(), confirm(). and prompt().
 *
 * @param {String} _title The title of the of the dialog
 * @param {String} _content The content of the dialog
 * @param {Array} buttons An array containing the buttons. Buttons have a title and a 'primary' flag
 */
metroUI.ContentDialog = class {
	constructor(params) {
		const dialog = this;

		dialog.background = document.createElement("div");
		dialog.background.className = "content-dialog-background";

		dialog.container = document.createElement("div");
		dialog.container.className = "content-dialog";

		let content = document.createElement("div");
		content.className = "content";
		dialog.container.appendChild(content);

		if (params.title && params.title.length) {
			let title = document.createElement("h4");
			title.innerText = params.title;
			content.appendChild(title);
		}

		if (params.content) {
			if (typeof params.content === "object") {
				content.appendChild(new NodeRenderer(params.content));
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

		if (params.commands && params.commands.length) {
			let commands = document.createElement("div");
			commands.className = "commands";
			dialog.container.appendChild(commands);

			params.commands.slice(0, 3).forEach((_command, index) => {
				let command = document.createElement("button");
				command.innerText = _command.text;
				command.className = _command.primary ? "primary" : "";
				command.disabled = (_command.primary && [...content.querySelectorAll("input, select")].some(inputEl => inputEl.dataset.minlength || inputEl.dataset.required == "true"));

				command.addEventListener("click", () => {
					if (typeof _command.action === "function") {
						_command.action();
					}

					if (dialog._promiseResolve) {
						if (_command.primary) {
							dialog._promiseResolve(metroUI.ContentDialogResult.Primary);
						} else if (index == commands.length - 1) {
							dialog._promiseResolve(metroUI.ContentDialogResult.None);
						} else {
							dialog._promiseResolve(metroUI.ContentDialogResult.Secondary);
						}
					}

					dialog.hide();
				});

				commands.appendChild(command);
			});

			content.querySelectorAll("input, select").forEach(item => {
				item.addEventListener("input", () => {
					let primaryCommand = commands.querySelector(".primary");

					if (primaryCommand) {
						primaryCommand.disabled = [...content.querySelectorAll("input, select")].some(inputEl => (inputEl.value.length < inputEl.dataset.minlength) || (inputEl.dataset.required == "true" && !inputEl.value.length));
					}
				});
			});
		}
	}

	/**
	 * Shows a dialog if no result is expected
	 */
	show() {
		const dialog = this;
		if (!document.querySelector("div.content-dialog-background")) {
			document.body.appendChild(dialog.background);
		} else {
			document.querySelector(".content-dialog-background").classList.remove("animate-out");
		}

		document.body.appendChild(dialog.container);

		dialog.container.style.width = `${Math.round(dialog.container.clientWidth / 2) * 2}px`;
		dialog.container.style.height = `${Math.round(dialog.container.clientHeight / 2) * 2}px`;

		dialog.container.classList.add("animate-in");
	}

	/**
	 * Shows a dialog asynchroneously and returns a promise,
	 * which later returns a ContentDialogResult value
	 * @returns {Promise} A promise which will return the value of the clicked button
	 */
	async showAsync() {
		const dialog = this;

		dialog.show();

		let promise = new Promise((resolve, reject) => {
			dialog._promiseResolve = resolve;
		});
		return promise;
	}

	/**
	 * Hides the dialog. Mainly used for the buttons,
	 * but can also be used externally
	 */
	hide() {
		const dialog = this;

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

	/**
	 * Returns the text (if only one input/select) or an array of texts (if multiple) entered into the dialog
	 */
	get text() {
		const dialog = this;

		if (dialog.container.querySelectorAll("input, select").length > 1) {
			var output = [];

			dialog.container.querySelectorAll("input, select").forEach(item => {
				output.push(item.value);
			});

			return output;
		} else if (dialog.container.querySelector("input, select")) {
			return dialog.container.querySelector("input, select").value;
		}

		return null;
	}
}


/**
 * Shows a contextual list of simple commands or options.
 *
 * @param {HTMLElement} element The element to attach the MenuFlyout to
 * @param {Array} actions A list of actions
 */
metroUI.MenuFlyout = class {
	constructor(element, actions) {
		const flyout = this;

		flyout.targetElement = element;

		flyout.container = document.createElement("div");
		flyout.container.className = "menu-flyout";

		flyout.itemList = document.createElement("div");
		flyout.itemList.className = "menu-items";
		flyout.container.appendChild(flyout.itemList);

		actions.forEach((_action, index) => {
			let action = document.createElement("div");
			action.className = "menu-item";

			if (_action.icon) {
				let icon = document.createElement("i");
				icon.className = `icon ${_action.icon}`;
				action.appendChild(icon);

				let title = document.createElement("span");
				title.innerText = _action.title;
				action.appendChild(title);
			} else {
				action.innerText = _action.title;
			}

			if (_action.disabled) {
				action.classList.add("disabled");
			}

			action.addEventListener("click", () => {
				if (typeof _action.action === "function") {
						_action.action();
				}

				flyout.hide();
			});

			flyout.itemList.appendChild(action);
		});
	}

	_hide_internal(event) {
		const flyout = this;
		if (!event.target.parentNodeOfClass("menu-flyout")) {
			event.preventDefault();
			event.stopPropagation();

			flyout.hide();
		}
		//console.log(event.target.parentNodeOfClass(".menu-flyout"));
	}

	/**
	 * Shows the MenuFlyout where the target element is located
	 */
	show() {
		const flyout = this;
		document.body.appendChild(flyout.container);

		const width = flyout.container.clientWidth;
		const height = flyout.container.clientHeight;
		let offset = cumulativeOffset(flyout.targetElement);

		if (offset.top - (height + 8) >= 0) {
			flyout.container.style.bottom = `${window.innerHeight - (offset.top - 8)}px`;
			flyout.container.classList.add("animate-bottom");
		} else if (offset.top + (flyout.targetElement.clientHeight + 8) <= window.innerHeight) {
			flyout.container.style.top = `${offset.top + (flyout.targetElement.clientHeight + 8)}px`;
			flyout.container.classList.add("animate-bottom");
		}

		flyout.container.style.left = `${Math.max(Math.min(window.innerWidth - width, (offset.left + (flyout.targetElement.clientWidth / 2)) - width / 2), 0)}px`;

		setTimeout(() => {
			flyout.container.style.maxHeight = `${height}px`;
		}, 0);

		flyout.eventListener = this._hide_internal.bind(flyout);

		document.addEventListener("click", flyout.eventListener, true);
	}

	/**
	 * Hides the flyout
	 */
	hide() {
		const flyout = this;

		document.removeEventListener("click", flyout.eventListener, true);
		flyout.container.classList.add("animate-out");
		setTimeout(() => {
			document.body.removeChild(flyout.container);
		}, 400);
	}
}


/**
 * Show a notification containing either text or rich content
 *
 * @param {Object} params An object containg all parameters for this notification ([payload], [icon], title, content, [inputs], [buttons])
 */
metroUI.Notification = class {
	constructor(params) {
		const notification = this;

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
		notification.___mousoutListener = notification._resetTimeout.bind(notification)
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
				iconContainer.appendChild(new NodeRenderer(params.icon));
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
				content.appendChild(new NodeRenderer(params.content));
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
				inputs.appendChild(new NodeRenderer(params.inputs));
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

			params.buttons.forEach((_button, index) => {
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
				notification.notificationCenter.querySelectorAll(".notification-wrapper").forEach((item, index) => {
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
			notification.notificationCenter = document.querySelector(".notification-center")
		}

		notification.notificationCenter.querySelectorAll(".notification-wrapper").forEach((item, index) => {
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

		notification._promise = new Promise((resolve, reject) => {
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


/**
 * Select the current accent color
 * @fires accentSelect Fired when the user selects an accent color. Contains the current accent color name
 */
var AccentColorSelector = {
	name: "metro-accent-color-selector",
	render(h) {
		const accents = [];

		for (var i = 0; i < 48; i++) {
			accents.push(
				<div class="accent-color-item" onClick={this._selectAccent} data-accent={`win10-${i + 1 < 10 ? "0" : ""}${i + 1}`}></div>
			)
		}

		return (
			<div class="accent-color-selector">
				{accents}
			</div>
		)
	},
	methods: {
		_selectAccent(e) {
			if (document.body.getAttribute("data-accent") != e.target.getAttribute("data-accent")) {
				document.body.setAttribute("data-accent", e.target.getAttribute("data-accent"));
				this.$emit("accent-select", e.target.getAttribute("data-accent"));
			}
		}
	}
};

/**
 * A button that's styled for use in a CommandBar.
 * @param {Boolean} disabled Specifies if this button is disabled
 * @param {String} icon Sets the icon next to the title
 * @param {String} title Sets the title of the button
 */
var AppBarButton = {
	name: "metro-app-bar-button",
	props: ["disabled", "icon", "title"],
	render(h) {
		return (
			<div class={{ 'app-bar-button': true, 'disabled': this.$props.disabled }}>
				<div class="app-bar-button-icon">
					<i class={`icon ${this.$props.icon}`}></i>
				</div>
				<p class="app-bar-button-content">{this.$slots.default}</p>
			</div>
		)
	}
};

/**
 * A control to provide suggestions as a user is typing.
 * @param {Any} value Represents the bound v-model
 * @param {String} placeholder The placeholder text to show inside the input field
 * @param {Array} data The initial data set
 * @param {Number} maxResults Specifies the maximum number of results to show (default 4)
 * @fires input Fired when the user enters text or selects a suggested item
 * @fires textChanged Fired only if the user enters text
 * @fires suggestionChosen Fired if the user selected a suggested item
 */
var AutoSuggestBox = {
	name: "metro-auto-suggest",
	props: ["value", "placeholder", "data", "maxResults", "disabled"],
	data() {
		return {
			_value: this.$props.value,
			_data: this.$props.data ? this.$props.data : [],
			_maxResults: this.$props.maxResults ? this.$props.maxResults : 4,

			results: []
		}
	},
	render(h) {
		return (
			<div class="auto-suggest">
				<input type="text" value={this.$data._value} placeholder={this.$props.placeholder} disabled={this.$props.disabled} ref="input" onInput={this._onInput} onFocus={this._onFocus}></input>
				<div class="items" ref="items">
					{this.$data.results.map(item => {
						return (
							<div class="item" onClick={this._itemClicked}>{item}</div>
						)
					})}
				</div>
			</div>
		)
	},
	mounted() {
		window.addEventListener("click", this._windowClickHandler);
	},
	destroyed() {
		window.removeEventListener("click", this._windowClickHandler);
	},
	methods: {
		_onInput(e) {
			this.$data._value = e.target.value;
			this.$emit('input', this.$data._value);
			this.$emit('textChanged', {
				sender: this,
				reason: "userInput"
			});

			this._suggestItems();
			setTimeout(() => {
				var node = this.$el;
				while (node) {
					if (node.scrollTop > 0) break;
					node = node.parentNode;
				}

				let absolutePosTop = cumulativeOffset(this.$refs["items"]).top - (node ? node.scrollTop : 0) + this.$refs["items"].offsetHeight;
				if (absolutePosTop >= window.innerHeight) {
					this.$refs["items"].classList.add("top");
				} else {
					this.$refs["items"].classList.remove("top");
				}
			}, 20);
		},
		_onFocus() {
			if (!this.$data._value.length) {
				this._suggestItems();
			}
		},
		_windowClickHandler(e) {
			if (!this.$el.contains(e.target)) {
				this.$refs["items"].classList.remove("visible");
			}
		},
		_suggestItems() {
			if (!this.$data._data) return;

			if (this.$refs["input"].value.length) {
				this.$data.results = this.$data._data.filter(item => item.indexOf(this.$refs["input"].value) >= 0).slice(0, this.$data._maxResults);
			} else {
				this.$data.results = this.$data._data.slice(0, this.$data._maxResults);
			}


			if (this.$data.results.length) {
				this.$refs["items"].classList.add("visible");
			} else {
				this.$refs["items"].classList.remove("visible");
			}
		},
		_itemClicked(e) {
			this.$refs["items"].classList.remove("visible");
			this.$data._value = e.target.innerText;

			this.$emit('input', this.$data._value);
			this.$emit('suggestionChosen', {
				sender: this,
				selectedItem: e.target.innerText
			});
		},

		/**
		 * Sets a new data source
		 * @param {Array} source The new data source to use
		 */
		setDataSource(source) {
			this.$data._data = source;
		}
	},
	watch: {
		data(newValue, oldValue) {
			this.$data._data = newValue;
		},
		value(newValue, oldValue) {
			this.$data._value = newValue;
		}
	}
};

/**
 *
 */
var BackgroundThemeSelector = {
	name: "metro-background-theme-selector",
	props: ["lightName", "darkName"],
	render(h) {
		return (
			<div class="control-group">
				<div class="radio">
					<input type="radio" id="theme-light" data-theme="light" name="theme" ref="theme-light" onChange={this._selectTheme} />
					<label for="theme-light">
						<p class="item-label">{this.$props.lightName || "Light"}</p>
					</label>
				</div>
				<div class="radio">
					<input type="radio" id="theme-dark" data-theme="dark" name="theme" ref="theme-dark" onChange={this._selectTheme} />
					<label for="theme-dark">
						<p class="item-label">{this.$props.darkName || "Dark"}</p>
					</label>
				</div>
			</div>
		)
	},
	mounted() {
		this.$refs[`theme-${document.body.getAttribute("data-theme")}`].checked = true;
	},
	methods: {
		_selectTheme(e) {
			if (e.target.checked) {
				document.body.setAttribute("data-theme", e.target.getAttribute("data-theme"));
				this.$emit("theme-select", e.target.getAttribute("data-theme"));
			}
		}
	}
}

/**
 * A control that a user can select or clear.
 * @param {Any} value Represents the bound v-model
 * @fires input Fired if the checkbox state changed to update the model
 */
var Checkbox = {
	name: "metro-checkbox",
	props: ["value"],
	data() {
		return {
			id: crypto.randomBytes(20).toString("hex"),
			_checked: this.$props.value,
		}
	},
	render(h) {
		return (
			<div class="checkbox">
				<input type="checkbox" id={this.$data.id} onChange={this._onChange} />
				<label for={this.$data.id}>
					<p class="item-label">{this.$slots.default}</p>
				</label>
			</div>
		)
	},
	methods: {
		_onChange(e) {
			this.$data._checked = e.target.checked;
			this.$emit('input', this.$data._checked);
		}
	}
};

/**
 * A drop-down list of items a user can select from.
 * @param {Any} value Represents the bound v-model
 * @fires input Fired if the user selected a list item to update the model
 */
var ComboBox = {
	name: "metro-combo-box",
	props: ["value"],
	data() {
		return {
			_value: this.$props.value
		}
	},
	render(h) {
		return (
			<div class="list" onClick={this._show}>
				{this.$slots.default}
				<div class="list-inner" ref="list"></div>
			</div>
		)
	},
	mounted() {
		const select = this.$slots.default[0];
		select.children.forEach(item => {
			var listItem = document.createElement("div");
			listItem.classList = "list-item";
			listItem.innerHTML = item.elm.innerText;

			if (item.elm.hasAttribute("selected")) {
				listItem.classList.add("selected");
			}
			if (item.elm.hasAttribute("disabled")) {
				listItem.classList.add("disabled");
			}
			if (item.elm.value) {
				listItem.setAttribute("data-value", item.elm.value);
			}

			this.$refs["list"].appendChild(listItem);
		});

		if (select.elm.selectedIndex >= 0) {
			this.$refs["list"].children[select.elm.selectedIndex].classList.add("selected");
			this.$refs["list"].style.transform = `translate3d(0, -${(findInRow(this.$refs["list"].querySelector(".selected")) * 32 + 8)}px, 0)`;
		} else {
			this.$refs["list"].style.transform = "translate3d(0, -8px, 0)";
		}

		this.$el.querySelectorAll("div.list-inner div.list-item").forEach((item, index) => {
			item.addEventListener("click", (e) => {
				e.stopPropagation();
				if (item.hasAttribute("disabled")) {
					return;
				}


				if (this.$refs["list"].querySelector(".selected")) {
					this.$refs["list"].querySelector(".selected").classList.remove("selected");
				}

				item.classList.add("selected");

				this._hide();

				if (item.hasAttribute("data-value")) {
					this.$data.value = item.getAttribute("data-value");
				} else {
					this.$data.value = null;
				}

				select.elm.value = this.$data.value;
				this.$emit('input', this.$data.value);
			});
		});
	},
	methods: {
		_hide() {
			if (this.$el.classList.contains("open")) {
				this.$el.classList.remove("open");
			}

			if (this.$refs["list"].querySelector(".selected")) {
				this.$refs["list"].style.transform = `translate3d(0, -${(findInRow(this.$refs["list"].querySelector(".selected")) * 32 + 8)}px, 0)`;
				this.$refs["list"].style.top = "";
			}
		},

		_show(e) {
			if (!this.$el.classList.contains("open")) {
				this.$el.classList.add("open");
			} else {
				return;
			}

			var shift = Math.max(findInRow(this.$refs["list"].querySelector(".selected")), 0) * 32 + 8;
			this.$refs["list"].style.transform = `translate3d(0, -${shift}px, 0)`;

			var node = this.$refs["list"];
			while (node) {
				if (node.scrollTop > 0) break;
				if (!node.parentNode) break;
				node = node.parentNode;
			}

			let absolutePosTop = (cumulativeOffset(this.$refs["list"]).top - shift) - (parseInt(node.scrollTop) ? node.scrollTop : 0);
			let absolutePosBottom = absolutePosTop + this.$refs["list"].offsetHeight;

			if (absolutePosTop < 10) {
				this.$refs["list"].style.top = `${-absolutePosTop + 10}px`;
			} else {

				let top = Math.max(absolutePosBottom - (window.innerHeight - 10), 0);
				this.$refs["list"].style.top = `-${top}px`;
			}

			this.eventListener = this._hide.bind(this);

			document.addEventListener("click", this.eventListener, true);

			e.stopPropagation();
		}
	}
};

/**
 * A toolbar for displaying application-specific commands that handles layout and resizing of its contents.
 */
var CommandBar = {
	name: "metro-command-bar",
	render(h) {
		return (
			<div class="command-bar">
				<div class="command-bar-inner">
					{this.$slots.content &&
						<div class="app-bar-content">
							{this.$slots.content}
						</div>
					}

					{this.$slots.buttons &&
						<div class="app-bar-buttons">
							{this.$slots.buttons}
						</div>
					}
					<div class="more" onClick={this.toggle}></div>
				</div>
			</div>
		)
	},
	methods: {
		/**
		 * Open this CommandBar
		 */
		open() {
			this.$el.classList.add("expanded")
		},
		/**
		 * Close this CommandBar
		 */
		close() {
			this.$el.classList.remove("expanded")
		},
		/**
		 * Toggle this CommandBar's open state
		 */
		toggle() {
			this.$el.classList.toggle("expanded")
		}
	}
};

/**
 * Common vertical layout for top-level areas of your app via a collapsible navigation menu
 * @param {String} title Sets the title of the NavigationView
 * @param {String} menuTitle Sets the title that is displayed next to the Menu Button
 * @param {String} acrylic Sets the acrylic background variant (60%, 70%, 80%)
 */
var ListView = {
	name: "metro-list-view",
	props: ["title", "menuTitle", "acrylic"],
	data() {
		return {
			_acrylic: this.$props.acrylic || "acrylic-60",
			_currentPage: null,
			_pages: {},
			_items: {},
		}
	},
	render(h) {
		return (
			<div class="list-view">
				<div class={{ [`list-view-menu acrylic ${this.$data._acrylic}`]: true }} ref="menu">
					{this.$props.menuTitle &&
						<div class="list-view-header">
							<p class="list-view-title">{this.$props.menuTitle}</p>

							{this.$slots["actions"]}
						</div>
					}

					<div class="list-view-items">
						{this.$slots["list-items"]}
					</div>

					<div class="list-view-bottom-items">
						{this.$slots["bottom-items"]}
					</div>
				</div>

				{this.$slots["pages"] &&
					<div class="frame-header" ref="frameHeader">
						<p class="title" ref="frameTitle">{this.$props.title}</p>
					</div>
				}

				{this.$slots["pages"] &&
					<div class="frame" ref="frame">
						<div class="frame-content" ref="frameContent">
							{this.$slots["pages"]}
						</div>
					</div>
				}
			</div>
		)
	},
	mounted() {
		this._listRendered();
	},
	updated() {
		this._listRendered();
	},
	methods: {
		_listRendered() {
			if (this.$refs["frameContent"] && this.$refs["frame"]) {
				this.$refs["frameContent"].querySelectorAll(".page").forEach((page, index) => {
					if (page.hasAttribute("data-page-id")) {
						this.$data._pages[page.getAttribute("data-page-id")] = new metroUI.Page(page, {
							parentPage: this,
							title: page.getAttribute("data-page-title")
						});
					}
				});

				this.$refs["frame"].addEventListener("scroll", this._frameScrolled);
			}

			this.$refs["menu"].querySelectorAll(".list-view-item").forEach((item, index) => {
				if (item.hasAttribute("data-page")) {
					this.$data._items[item.getAttribute("data-page")] = item;

					item.addEventListener("click", () => {
						this.navigate(item.getAttribute("data-page"));
					});
				}
			});
		},

		_frameScrolled() {
			if (this.$data._currentPage) {
				this.$data._currentPage._scrollTop = this.$refs["frame"].scrollTop;
			}
		},

		/**
		 * Navigate to a page this view references
		 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this NavigationView
		 * @param {*} _options -- NOT IN USE
		 */
		navigate(pageName, _options) {
			var options = {
				url: null,
				addHistory: true
			}
			for (var option in _options) {
				options[option] = _options[option];
			}

			let page = this.$data._pages[pageName];
			if (page) {
				if (page.isVisible) return;

				page.show();
				this.$data._currentPage = page;
				this.setTitle(page.params.title);

				if (this.$data._items[pageName]) {
					if (this.$refs["menu"].querySelector(".selected")) {
						this.$refs["menu"].querySelector(".selected").classList.remove("selected");
					}
					this.$data._items[pageName].classList.add("selected");
				} else if (page.container.hasAttribute("data-nav-item")) {
					let navItem = page.container.getAttribute("data-nav-item");
					if (this.$data._items[navItem]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[navItem].classList.add("selected");
					}
				}

				this.$refs["frame"].scrollTo(0, 0);
				page.container.scrollTo(0, 0);
			}
		},
		/**
		 * Set the title of this NavigationView
		 * @param {String} title The title to set. Can be empty
		 */
		setTitle(title) {
			if (title && title.length) {
				this.$refs["frameTitle"].innerText = title;
				this.$refs["frameTitle"].parentElement.classList.remove("hidden");
			} else {
				this.$refs["frameTitle"].innerText = "";
				this.$refs["frameTitle"].parentElement.classList.add("hidden");
			}
		},

		/**
		 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
		 * @param {String} query The CSS-like query to select
		 */
		querySelector(query) {
			return this.$el.querySelector(query);
		},
		querySelectorAll(query) {
			return this.$el.querySelectorAll(query);
		}
	}
};

/**
 * Represents an action located in a ListView header
 * @param {String} icon The icon to show next to the title
 */
var ListViewAction = {
	name: "metro-list-view-action",
	props: ["icon"],
	render(h) {
		return (
			<div class="list-view-action">
				<i class={`icon ${this.$props.icon}`}></i>
			</div>
		)
	}
};

/**
 * Represents a item for use in a ListView
 * @param {String} page The page to navigate to. Must be referenced by the parent ListView
 * @param {String} icon The icon to show next to the title
 * @param {String} title The title of this item
 */
var ListViewMenuItem = {
	name: "metro-list-view-menu-item",
	props: ["page", "icon", "title"],
	render(h) {
		return (
			<div class="list-view-item" data-page={this.$props.page}>
				<div class="list-view-item-inner">
					{this.$props.icon &&
						<div class="list-view-item-icon"><i class={`icon ${this.$props.icon}`}></i></div>
					}
					<p class="list-view-item-content">{this.$props.title}</p>
				</div>
			</div>
		)
	}
};

/**
 * Represents a separator in a ListView
 * @param {String} title The title of this item
 */
var ListViewMenuSeparator = {
	name: "metro-list-view-menu-separator",
	props: ["title"],
	render(h) {
		return (
			<div class="list-view-item-separator">
				<p>{this.$props.title}</p>
			</div>
		)
	}
};

/**
 * Displays a conversation between two or more people
 * @fires messageSent Fired if the current user sends a message. Contains the sent message's text
 */
var Messages = {
	name: "metro-messages",
	props: ["useTextarea", "inputDisabled", "placeholder"],
	data() {
		return {
			messages: [],
			messageText: "",
			_useTextarea: this.$props.useTextarea || false,
			_inputDisabled: this.$props.inputDisabled || false,
			_placeholder: this.$props.placeholder || "Type a text message"
		}
	},
	render(h) {
		return (
			<div class="messages-container">
				<div class="messages-scroll-container" ref="scrollContainer">
					<div class="messages-wrapper" ref="wrapper">
						{this.$data.messages.map(item => {
							return (
								<div class={{ "message": item.type != "system", [`message-${item.type}`]: true, "message-tail": item.hasTail, "message-first": item.isFirst }}>
									{(item.type == "sent" || item.type == "received") &&
										<div class="message-content">
											<div class="message-bubble">
												<p class="message-text" domPropsInnerHTML={item.text}></p>
												<div class="message-info">
													<p class="message-time">{this._formatTime(item.date)}</p>
													<p class="message-name">{item.displayName || item.author}</p>
												</div>
											</div>
										</div>
									}

									{item.type == "system" &&
										<span domPropsInnerHTML={item.text}></span>
									}
								</div>
							)
						})}
					</div>
				</div>

				<div class="messages-input">
					<button class="emoji-selector" onClick={this._showEmojiSelector} disabled={this.$data._inputDisabled}><i class="icon emoji2"></i></button>
					
					{this.$data._useTextarea && 
						<textarea placeholder={this.$data._placeholder} value={this.$data.messageText} onInput={this._onInput} onKeydown={this._onKeyDown} disabled={this.$data._inputDisabled} ref="input" />
					}
					
					{!this.$data._useTextarea &&
						<input type="text" placeholder={this.$data._placeholder} value={this.$data.messageText} onInput={this._onInput} onKeydown={this._onKeyDown} disabled={this.$data._inputDisabled} ref="input" />
					}
					
					<button class="send-message" onClick={this._sendMessage} disabled={!this.$data.messageText.length || this.$data._inputDisabled}><i class="icon send"></i></button>
				</div>
			</div>
		)
	},
	methods: {
		_formatTime(date) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		},
		_onInput(e) {
			this.$data.messageText = e.target.value;
			
			if (e.target.tagName.toLowerCase() == "textarea") {
				e.target.style.height = null;
				

				e.target.style.height = `${Math.min(66, e.target.scrollHeight)}px`;
				this.$refs["wrapper"].style.paddingBottom = `${e.target.parentElement.clientHeight}px`;
				
				this._scrollToBottom();
			}
		},
		_onKeyDown(e) {
			if (e.target.tagName.toLowerCase() == "textarea") {
				if (e.keyCode == 13 && !e.shiftKey) {
					this._sendMessage();
					e.preventDefault();
				}
			} else if (e.keyCode == 13) {
				this._sendMessage();
			}
		},
		_showEmojiSelector(event) {
			this.$emit("emojiPickerRequested", event.target);
		},
		_sendMessage() {
			if (!this.$data.messageText.length) return;

			this.$emit("messageSent", this.$data.messageText);
			this.$data.messageText = "";
			this.$refs["input"].value = null;
			
			this.$refs["input"].style.height = null;
			this.$refs["wrapper"].style.paddingBottom = `${this.$refs["input"].parentElement.clientHeight}px`;
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

		_scrollToBottom() {
			setTimeout(() => {
				this.$refs["scrollContainer"].scrollTo(0, this.$refs["scrollContainer"].scrollHeight);
			});
		},

		/**
		 * Adds a new message to the conversation.
		 * Previous messages may be updated to respect the kind of message added
		 * @param {*} message The message to add
		 */
		addMessage(message) {
			if (this.$data.messages.lastObject()) {
				const lastMessage = this.$data.messages.lastObject();

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
			this.$data.messages.push(message);

			this._scrollToBottom();
		},
		/**
		 * Adds a system message to the conversation
		 * @param {*} text The text to add to the conversation
		 */
		addSystemMessage(text) {
			this.$data.messages.push({ type: "system", text: text });

			this._scrollToBottom();
		},
		/**
		 *
		 */
		setMessages(messageData) {
			this.$data.messages = [];
			messageData.forEach(messageObj => {
				this.addMessage(messageObj);
			});
		}
	},
	watch: {
		inputDisabled(newValue, oldValue) {
			this.$data._inputDisabled = newValue;
		}
	}
};

/**
 * Common vertical layout for top-level areas of your app via a collapsible navigation menu
 * @param {String} title Sets the title of the NavigationView
 * @param {Boolean} history If false, disable the use of history in this NavigationView
 * @param {String} menuTitle Sets the title that is displayed next to the Menu Button
 * @param {String} acrylic Sets the acrylic background variant (60%, 70%, 80%)
 * @param {Boolean} startExpanded Expands the navigation view on load (< 768 px)
 * @param {Boolean} startRetracted Retracts the navigation view on load (>= 768 px)
 * @param {String} defaultPage The page to be loaded when the navigation view is created
 */
var NavigationView = {
	name: "metro-navigation-view",
	props: ["title", "history", "menuTitle", "acrylic", "startExpanded", "startRetracted", "defaultPage"],
	data() {
		return {
			_acrylic: this.$props.acrylic || "acrylic-60",
			_menuTitle: this.$props.menuTitle,
			_startExpanded: this.$props.startExpanded || false,
			_startRetracted: this.$props.startRetracted || false,
			_currentPage: null,
			_pages: {},
			_items: {},
			_history: []
		}
	},
	render(h) {
		return (
			<div class="navigation-view">
				<div class={{ [`navigation-view-menu acrylic ${this.$data._acrylic}`]: true, "expanded": this.$data._startExpanded, "retracted": this.$data._startRetracted }} ref="menu">
					<div class={{ "toggle-pane-button": true, "title": this.$data._menuTitle != null }} ref="toggleButton" onClick={this.toggle}>
						<p>{this.$data._menuTitle}</p>
					</div>

					{this.$props.history != false &&
						<div class="navigation-view-back-button" disabled={this.$data._history.length <= 1} onClick={this.goBack}></div>
					}

					<div class="navigation-view-items">
						{this.$slots["navigation-items"]}
					</div>

					<div class="navigation-view-bottom-items">
						{this.$slots["bottom-items"]}
					</div>
				</div>

				<div class="frame-header" ref="frameHeader">
					{this.$props.history != false &&
						<div class="navigation-view-back-button" ref="backButton"></div>
					}
					<div class="toggle-pane-button" onClick={this.toggle}></div>
					<p class="title" ref="frameTitle">{this.$props.title}</p>
				</div>

				<div class="frame" ref="frame">
					<div class="frame-content" ref="frameContent">
						{this.$slots["pages"]}
					</div>
				</div>
			</div>
		)
	},
	mounted() {
		this._listRendered();
	},
	methods: {
		_listRendered() {
			this.$refs["frameContent"].querySelectorAll(".page").forEach((page, index) => {
				if (page.hasAttribute("data-page-id")) {
					this.$data._pages[page.getAttribute("data-page-id")] = new metroUI.Page(page, {
						parentPage: this,
						title: page.getAttribute("data-page-title")
					});
				}
			});

			this.$refs["frame"].addEventListener("scroll", this._frameScrolled);

			this.$refs["menu"].querySelectorAll(".navigation-view-item, .settings-button").forEach((item, index) => {
				if (item.hasAttribute("data-page")) {
					this.$data._items[item.getAttribute("data-page")] = item;

					item.addEventListener("click", () => {
						this.navigate(item.getAttribute("data-page"));

						if (window.innerWidth < 1008) {
							this.$refs["menu"].classList.remove("expanded");
						} else if (this.$props.startRetracted) {
							this.$refs["menu"].classList.add("retracted");
						}
					});
				}
			});
			
			if (this.$props.defaultPage) {
				this.navigate(this.$props.defaultPage);
			}
		},

		_frameScrolled() {
			if (this.$data._currentPage) {
				this.$data._currentPage._scrollTop = this.$refs["frame"].scrollTop;
			}
		},

		/**
		 * Toggles this NavigationView's open state
		 */
		toggle() {
			const nav = this;
			if (window.innerWidth < 1008) {
				this.$refs["menu"].classList.toggle("expanded");
			} else {
				this.$refs["menu"].classList.toggle("retracted");
			}
		},
		/**
		 * Navigate to a page this view references
		 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this NavigationView
		 * @param {*} _options -- NOT IN USE
		 */
		navigate(pageName, _options) {
			var options = {
				url: null,
				addHistory: true
			}
			for (var option in _options) {
				options[option] = _options[option];
			}

			let page = this.$data._pages[pageName];
			if (page) {
				if (page.isVisible) return;

				page.show();
				this.$data._currentPage = page;
				this.setTitle(page.params.title);

				if (this.$data._items[pageName]) {
					if (this.$refs["menu"].querySelector(".selected")) {
						this.$refs["menu"].querySelector(".selected").classList.remove("selected");
					}
					this.$data._items[pageName].classList.add("selected");
				} else if (page.container.hasAttribute("data-nav-item")) {
					let navItem = page.container.getAttribute("data-nav-item");
					if (this.$data._items[navItem]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[navItem].classList.add("selected");
					}
				}

				this.$refs["frame"].scrollTo(0, 0);
				page.container.scrollTo(0, 0);

				if (this.$props.history != false) {
					this.$data._history.push(pageName);
				}
			}
		},
		/**
		 * Show the last page stored in the hitory array
		 */
		goBack() {
			if (this.$data._history.length > 1) {
				this.$data._currentPage.hide();

				let lastPage = this.$data._pages[this.$data._history[this.$data._history.length - 2]];
				if (lastPage) {
					lastPage.show();
					this.$data._currentPage = lastPage;
					this.setTitle(lastPage.params.title);

					let pageName = lastPage.container.getAttribute("data-page-id");
					let itemName = lastPage.container.getAttribute("data-nav-item");
					if (this.$data._items[pageName]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[pageName].classList.add("selected");
					} else if (this.$data._items[itemName]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[itemName].classList.add("selected");
					}

					if (lastPage._scrollTop !== null) {
						this.$refs["frame"].scrollTo(0, lastPage._scrollTop);
					} else {
						this.$refs["frame"].scrollTo(0, 0);
					}

					if (this.$props.history != false) {
						this.$data._history.pop();
					}
				}
			}
		},
		/**
		 * Set the title of this NavigationView
		 * @param {String} title The title to set. Can be empty
		 */
		setTitle(title) {
			if (title && title.length) {
				this.$refs["frameTitle"].innerText = title;
				this.$refs["frameTitle"].parentElement.classList.remove("hidden");
			} else {
				this.$refs["frameTitle"].innerText = "";
				this.$refs["frameTitle"].parentElement.classList.add("hidden");
			}
		},

		/**
		 * Set the title string next to the toggle button
		 * @param {String} title The title to set. Can be empty
		 */
		setMenuTitle(title) {
			this.$data._menuTitle = title;
		},

		/**
		 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
		 * @param {String} query The CSS-like query to select
		 */
		querySelector(query) {
			return this.$el.querySelector(query);
		},
		querySelectorAll(query) {
			return this.$el.querySelectorAll(query);
		}
	}
};

/**
 * Represents a item for use in a NavigationView
 * @param {String} page The page to navigate to. Must be referenced by the parent NavigationView
 * @param {String} icon The icon to show next to the title
 * @param {String} title The title of this item
 * @param {Boolean} disabled Marks this item as unavailable
 */
var NavigationViewMenuItem = {
	name: "metro-navigation-view-menu-item",
	props: ["page", "icon", "title", "disabled"],
	render(h) {
		return (
			<div class="navigation-view-item" class={{"navigation-view-item": true, "disabled": this.$props.disabled === true}} data-page={this.$props.page}>
				<div class="navigation-view-item-inner">
					<div class="navigation-view-item-icon"><i class={`icon ${this.$props.icon}`}></i></div>
					<p class="navigation-view-item-content">{this.$props.title}</p>
				</div>
			</div>
		)
	}
};

/**
 * Represents a separator in a NavigationView
 * @param {String} title The title of this item
 */
var NavigationViewMenuSeparator = {
	name: "metro-navigation-view-menu-separator",
	props: ["title"],
	render(h) {
		return (
			<div class="navigation-view-item-separator">
				<p>{this.$props.title}</p>
			</div>
		)
	}
};

/**
 * Displays the picture of a person/contact.
 * Use either of the attributes to display a person/contact
 * @param {String} profilePicture A URL to an image (eg. profile image)
 * @param {String} displayName Full name of a person/contact which gets broken down to initials
 * @param {String} initials The initials of a person/contact to show
 */
var PersonPicture = {
	name: "metro-person-picture",
	props: ["profilePicture", "displayName", "initials"],
	data() {
		return {
			_initials: null
		}
	},
	render(h) {
		return (
			<div class="person-picture">
				{this.$data._initials &&
					<p class="initials" ref="initials">{this.$data._initials}</p>
				}
			</div>
		)
	},
	mounted() {
		this._renderInitials();
	},
	methods: {
		_renderInitials() {
			if (this.$props.initials) {
				this.$data._initials = this.$props.initials.toUpperCase();
			} else if (this.$props.displayName) {
				let initials = this.$props.displayName.replace(/\_|\:|\./g, " ").replace(/[^a-zA-Z-0-9_ ]/g, "").match(/\b\w/g);

				if (initials.length > 1) {
					this.$data._initials = `${initials[0]}${initials[initials.length - 1]}`;
				} else if (initials.length) {
					this.$data._initials = initials[0];
				}

			} else if (this.$props.profilePicture) {
				this.$data._initials = null;
				this.$el.style.backgroundImage = `url(${this.$props.profilePicture})`;
			}
		}
	},
	watch: {
		profilePicture(newValue, oldValue) {
			this._renderInitials();
		},
		displayName(newValue, oldValue) {
			this._renderInitials();
		},
		initials(newValue, oldValue) {
			this._renderInitials();
		}
	}
};

/**
 * Shows the apps progress on a task, or that the app is performing ongoing work that doesn't block user interaction.
 * @param {Any} value Represents the bound v-model
 * @param {Number} min The minimum value of this ProgressBar
 * @param {Number} max The maximum value of this ProgressBar
 */
var ProgressBar = {
	name: "metro-progress-bar",
	props: ["value", "min", "max"],
	data() {
		return {
			_value: this.$props.value,
			_min: this.$props.min ? this.$props.min : 0,
			_max: this.$props.max ? this.$props.max : 100,
		}
	},
	render(h) {
		return (
			<div class="progress">
				<div class="background">
					<div class="fill" ref="fill"></div>
				</div>
				<progress value={this.$data._value} min={this.$data._min} max={this.$data._max} ref="bar" />
			</div>
		)
	},
	mounted() {
		this.$refs["fill"].style.width = `${this.$data._value}%`;
	},
	updated() {
		this.$refs["fill"].style.width = `${this.$data._value}%`;
	},
	watch: {
		value(val) {
			this.$data._value = val;
		}
	}
};

/**
 * A control that lets the user select from a range of values by moving a Thumb control along a track
 * @param {Any} value Represents the bound v-model
 * @param {Number} min The minimum value of this Slider
 * @param {Number} max The maximum value of this Slider
 * @param {Number} step The step size of this Slider
 * @param {String} title The text of the control header above the slider. Can be empty
 * @fires input Fired if the slider value changed to update the model
 */
var Slider = {
	name: "metro-slider",
	props: ["value", "min", "max", "step", "title"],
	data() {
		return {
			_value: this.$props.value,
			_min: this.$props.min ? this.$props.min : 0,
			_max: this.$props.max ? this.$props.max : 100,
			_step: this.$props.step ? this.$props.step : 1,
			_title: this.$props.title
		}
	},
	render(h) {
		return (
			<div class="slider">
				{this.$props.title &&
					<p class="item-header">{this.$props.title}</p>
				}
				<div class="background">
					<div class="fill" ref="fill"></div>
				</div>
				<input type="range" min={this.$data._min} max={this.$data._max} value={this.$data._value} step={this.$data._step} ref="input" onInput={this._onInput} onMousedown={this._onMouseDown} onMouseup={this._onMouseUp}></input>
				<div class="value" ref="value"></div>
			</div>
		)
	},
	mounted() {
		this.$refs["fill"].style.width = `${this._getValue() * 100}%`;
	},
	methods: {
		_onInput(e) {
			this.$refs["fill"].style.width = `${this._getValue() * 100}%`;

			this.$refs["value"].style.left = `${this._getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this._getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);

			this.$data._value = this.$refs["input"].value;
			this.$emit('input', this.$data._value);
		},
		_onMouseDown() {
			this.$refs["value"].classList.add("visible");
			this.$refs["value"].style.left = `${this._getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this._getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);
		},
		_onMouseUp() {
			this.$refs["value"].classList.remove("visible");
		},
		_getValue() {
			let input = this.$refs["input"];
			return (input.value - input.min) / (input.max - input.min);
		}
	}
};

/**
 * A switch that can be toggled between 2 states.
 * @param {Any} value Represents the bound v-model
 * @param {String} onContent The text to show next to the ToggleSwitch in it 'on' state (default: "On")
 * @param {String} offContent The text to show next to the ToggleSwitch in it 'off' state (default: "Off")
 * @param {Boolean} readonly Defines the ToggleSwitch as read-only
 * @fires input Fired if the ToggleSwitch state changed to update the model
 */
var ToggleSwitch = {
	name: "metro-toggle-switch",
	props: ["value", "itemHeader", "onContent", "offContent", "readonly"],
	data() {
		return {
			id: crypto.randomBytes(20).toString("hex"),
			_checked: this.$props.value,
			_onContent: this.$props.onContent ? this.$props.onContent : "On",
			_offContent: this.$props.offContent ? this.$props.offContent : "Off",
		}
	},
	render(h) {
		return (
			<div class="toggle-switch">
				{this.$props.itemHeader &&
					<p class="item-header">{this.$props.itemHeader}</p>
				}
				<input type="checkbox" checked={this.$data._checked} id={this.$data.id} onChange={this._onChange} readonly={this.$props.readonly} ref="input"></input>
				<label for={this.$data.id} class={{"readonly": this.$props.readonly}}>
					<p class="item-label" ref="itemLabel"></p>
				</label>
			</div>
		)
	},
	mounted() {
		if (this.$refs["input"].checked) {
			this.$refs["itemLabel"].innerHTML = this.$data._onContent;
		} else {
			this.$refs["itemLabel"].innerHTML = this.$data._offContent;
		}
	},
	methods: {
		_onChange(e) {
			this.$data._checked = e.target.checked;

			if (e.target.checked) {
				this.$refs["itemLabel"].innerHTML = this.$data._onContent;
			} else {
				this.$refs["itemLabel"].innerHTML = this.$data._offContent;
			}

			this.$emit('input', this.$data._checked);
		}
	}
};



export default {
	install(Vue, options) {
		Vue.mixin({
			components: {
				[AccentColorSelector.name]: AccentColorSelector,
				[AppBarButton.name]: AppBarButton,
				[AutoSuggestBox.name]: AutoSuggestBox,
				[BackgroundThemeSelector.name]: BackgroundThemeSelector,
				[Checkbox.name]: Checkbox,
				[ComboBox.name]: ComboBox,
				[CommandBar.name]: CommandBar,
				[ListView.name]: ListView,
				[ListViewAction.name]: ListViewAction,
				[ListViewMenuItem.name]: ListViewMenuItem,
				[ListViewMenuSeparator.name]: ListViewMenuSeparator,
				[Messages.name]: Messages,
				[NavigationView.name]: NavigationView,
				[NavigationViewMenuItem.name]: NavigationViewMenuItem,
				[NavigationViewMenuSeparator.name]: NavigationViewMenuSeparator,
				[PersonPicture.name]: PersonPicture,
				[ProgressBar.name]: ProgressBar,
				[Slider.name]: Slider,
				[ToggleSwitch.name]: ToggleSwitch
			},
			mounted() {
				if (this.$el.querySelector && this.$el.querySelector(".view")) {
					this.$el.querySelectorAll(".view").forEach((item, index) => {
						if (item.hasAttribute("data-view-id")) {
							metroUI.views[item.getAttribute("data-view-id")] = new metroUI.View(item, {
								isPrimaryView: index == 0
							});
						}
					});
				}
			}
		});
	}
}