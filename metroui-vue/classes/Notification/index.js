export default class {
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