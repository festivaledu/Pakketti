import Vue from "vue";

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
}

const ContentDialogResult = {
	None: 0,
	Primary: 1,
	Secondary: 2
}

class ContentDialog {
	constructor(params = {}) {
		const dialog = this;
		
		dialog.params = {
			title: null,
			content: null,
			commands: []
		}
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
			
			params.commands.slice(0, 3).forEach((command, index) => {
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

export { 
	ContentDialog, 
	ContentDialogResult
};