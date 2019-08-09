<template>
	<div class="view" :data-view-id="viewId">
		<div class="pages">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
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
			}
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
			} else if (options.url) {
				// _metroUIInstance.get(options.url, (responseText) => {
				// 	var parsedPage = (new DOMParser()).parseFromString(responseText, "text/html").body.children[0];
				// 	view.container.appendChild(parsedPage);
				// 	view.pages[pageName] = new metroUI.Page(parsedPage, {
				// 		parentView: view
				// 	});

				// 	view.pages[pageName].show();
				// 	view._currentPage = view.pages[pageName];

				// 	if (options.addHistory) {
				// 		view._history.push(pageName);
				// 	}
				// })
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
}
</script>
