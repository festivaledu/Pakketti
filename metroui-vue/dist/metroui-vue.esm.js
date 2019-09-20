import Vue from"vue";import uuid from"uuid/v4";const NodeRenderer=class{constructor(e){const t=Vue.extend({props:["node"],render(e){return this.node?this.node:""}}),a=new t({propsData:{node:e}});return a.$mount(),a.$el}},ContentDialogResult={None:0,Primary:1,Secondary:2};class ContentDialog{constructor(e={}){const t=this;t.params={title:null,content:null,commands:[]},Object.assign(t.params,e),t.background=document.createElement("div"),t.background.className="content-dialog-background",t.container=document.createElement("div"),t.container.className="content-dialog";let a=document.createElement("div");if(a.className="content-dialog-content",t.container.appendChild(a),t.params.title&&t.params.title.length){let e=document.createElement("p");e.className="text-block sub-title",e.innerHTML=t.params.title,a.appendChild(e)}if(t.params.content)if("object"==typeof t.params.content)a.appendChild(new NodeRenderer(t.params.content));else if("function"==typeof t.params.content)a.appendChild(new NodeRenderer(t.params.content(t)));else{let e=new DOMParser().parseFromString(t.params.content,"text/html");if(e.body.children.length)for(var s=0;s<e.body.children.length;s++)a.appendChild(e.body.children[s].cloneNode(!0));else{let e=document.createElement("p");e.innerText=t.params.content,a.appendChild(e)}}if(e.commands&&e.commands.length){let i=document.createElement("div");i.className="content-dialog-commands",t.container.appendChild(i),e.commands.slice(0,3).filter(Boolean).forEach(e=>{let s=document.createElement("button");s.innerText=e.text,s.className=e.primary?"system-accent-color primary":"",s.disabled=e.primary&&[...a.querySelectorAll("input, textarea, select")].some(e=>0<e.minLength||e.required),s.addEventListener("click",()=>{"function"==typeof e.action&&e.action(),t._promiseResolve&&(e.primary?t._promiseResolve(ContentDialogResult.Primary):e.secondary?t._promiseResolve(ContentDialogResult.Secondary):t._promiseResolve(ContentDialogResult.None)),t.hide()}),i.appendChild(s)}),a.querySelectorAll("input, textarea, select").forEach(e=>{e.addEventListener("input",()=>{let e=i.querySelector(".primary");e&&(e.disabled=[...a.querySelectorAll("input, textarea, select")].some(e=>e.value.length<e.minLength||e.required&&!e.value.length))})})}}show(){var e=Math.round;const t=this;document.querySelector("div.content-dialog-background")?document.querySelector(".content-dialog-background").classList.remove("animate-out"):(document.body.appendChild(t.background),t.background.classList.remove("animate-out")),document.body.appendChild(t.container),t.container.style.width=`${2*e(t.container.clientWidth/2)}px`,t.container.style.height=`${2*e(t.container.clientHeight/2)}px`,t.container.classList.add("animate-in"),t.container.classList.remove("animate-out"),t.eventListener=this._resize.bind(t),window.addEventListener("resize",t.eventListener,!0)}async showAsync(){const e=this;e.show();let t=new Promise(t=>{e._promiseResolve=t});return t}hide(){const e=this;window.removeEventListener("resize",e.eventListener,!0),e.container.classList.add("animate-out"),2>document.querySelectorAll(".content-dialog").length&&document.querySelector(".content-dialog-background").classList.add("animate-out"),setTimeout(()=>{document.body.removeChild(e.container),document.querySelector(".content-dialog")||document.body.removeChild(document.querySelector(".content-dialog-background"))},400)}get text(){const e=this,t={};return e.container.querySelector("input, textarea, select")&&e.container.querySelectorAll("input, textarea, select").forEach(e=>{e.name&&(t[e.name]=e.value)}),t}_resize(){var e=Math.round;const t=this;t.container.style.width=null,t.container.style.height=null,setTimeout(()=>{t.container.style.width=`${2*e(t.container.clientWidth/2)}px`,t.container.style.height=`${2*e(t.container.clientHeight/2)}px`})}}const NodeRenderer$1=class{constructor(e){const t=Vue.extend({props:["node"],render(e){return this.node?this.node:""}}),a=new t({propsData:{node:e}});return a.$mount(),a.$el}};HTMLElement.prototype.parentNodeOfClass=function(e){for(var t=this.parentNode;t;){// console.log(node);
if(t.classList&&t.classList.contains(e))return t;t=t.parentNode}return null};class Flyout{constructor(e={}){const t=this;t.params={content:null},Object.assign(t.params,e),t.container=document.createElement("div"),t.container.className="flyout";let a=document.createElement("div");if(a.className="flyout-content",t.container.appendChild(a),t.params.content)if("object"==typeof t.params.content)a.appendChild(new NodeRenderer$1(t.params.content));else{let e=new DOMParser().parseFromString(t.params.content,"text/html");if(e.body.children.length)for(var s=0;s<e.body.children.length;s++)a.appendChild(e.body.children[s].cloneNode(!0));else{let e=document.createElement("p");e.innerText=t.params.content,a.appendChild(e)}}}_hide_internal(e){const t=this;e.target.parentNodeOfClass("flyout")||(e.preventDefault(),e.stopPropagation(),t.hide())}showAt(e){var t=Math.round;const a=this;if(!e)return;a.container.classList.remove("animate-out"),document.body.appendChild(a.container);const i=a.container.clientWidth,s=a.container.clientHeight;let n=e.getBoundingClientRect();0<=n.top-(s+8)?(Object.assign(a.container.style,{top:null,bottom:`${2*t((window.innerHeight-(n.top-8))/2)}px`}),a.container.classList.add("animate-bottom")):n.top+(n.height+8)<=window.innerHeight&&(Object.assign(a.container.style,{top:`${2*t((n.top+(n.height+8))/2)}px`,bottom:null}),a.container.classList.add("animate-top")),Object.assign(a.container.style,{left:`${Math.max(Math.min(window.innerWidth-i,n.left+n.width/2-i/2),0)}px`}),a.eventListener=this._hide_internal.bind(a),document.addEventListener("click",a.eventListener,!0)}hide(){const e=this;document.removeEventListener("click",e.eventListener,!0),e.container.classList.add("animate-out"),e.container.classList.remove("animate-top"),e.container.classList.remove("animate-bottom"),setTimeout(()=>{document.body.removeChild(e.container)},400)}}HTMLElement.prototype.parentNodeOfClass=function(e){for(var t=this.parentNode;t;){// console.log(node);
if(t.classList&&t.classList.contains(e))return t;t=t.parentNode}return null};class MenuFlyout{constructor(e={}){const t=this;t.params={items:[]},Object.assign(t.params,e),t.container=document.createElement("div"),t.container.className="menu-flyout",t.itemList=document.createElement("div"),t.itemList.className="menu-flyout-items",t.container.appendChild(t.itemList),t.params.items.forEach(e=>{let a=document.createElement("div");if(a.className="menu-flyout-item",e.icon){let t=document.createElement("div");t.className="menu-flyout-item-icon",a.appendChild(t);let i=document.createElement("i");i.className=`icon ${e.icon}`,t.appendChild(i)}else if(e.symbol){let t=document.createElement("div");t.className="menu-flyout-item-icon",a.appendChild(t);let i=document.createElement("i");i.className=`symbol ${e.icon}`,t.appendChild(i)}if(e.text){let t=document.createElement("span");t.className="menu-flyout-item-content",t.innerText=e.text,a.appendChild(t)}e.disabled&&a.classList.add("disabled"),a.addEventListener("click",()=>{"function"==typeof e.action&&e.action(),t.hide()}),t.itemList.appendChild(a)})}_hide_internal(e){const t=this;e.target.parentNodeOfClass("menu-flyout")||(e.preventDefault(),e.stopPropagation(),t.hide())}showAt(e){var t=Math.round;const a=this;if(!e)return;a.container.classList.remove("animate-out"),a.container.style.maxHeight=null,document.body.appendChild(a.container);const i=a.container.clientWidth,s=a.container.clientHeight;let n=e.getBoundingClientRect();0<=n.top-s?(Object.assign(a.container.style,{top:null,bottom:`${2*t((window.innerHeight-n.top)/2)}px`}),a.container.classList.add("animate-bottom")):n.top+n.height<=window.innerHeight&&(Object.assign(a.container.style,{top:`${2*t((n.top+n.height)/2)}px`,bottom:null}),a.container.classList.add("animate-top")),Object.assign(a.container.style,{left:`${Math.max(Math.min(window.innerWidth-i,n.left+n.width/2-i/2),0)}px`}),setTimeout(()=>{a.container.style.maxHeight=`${s}px`},0),a.eventListener=this._hide_internal.bind(a),document.addEventListener("click",a.eventListener,!0)}hide(){const e=this;document.removeEventListener("click",e.eventListener,!0),e.container.classList.add("animate-out"),e.container.classList.remove("animate-top"),e.container.classList.remove("animate-bottom"),setTimeout(()=>{document.body.removeChild(e.container)},400)}}const NodeRenderer$2=class{constructor(e){const t=Vue.extend({props:["node"],render(e){return this.node?this.node:""}}),a=new t({propsData:{node:e}});return a.$mount(),a.$el}};var findInRow=e=>{for(var t=0;e.previousSibling;)e=e.previousSibling,1===e.nodeType&&++t;return t};class index{constructor(e){const t=this;t.params=e,t.notificationCenter=document.createElement("div"),t.notificationCenter.className="notification-center",t.wrapper=document.createElement("div"),t.wrapper.className="notification-wrapper",t.container=document.createElement("div"),t.container.className="notification acrylic acrylic-60",t.wrapper.appendChild(t.container);let a=document.createElement("div");if(a.className="dismiss-button",a.innerHTML="<i class=\"icon chrome-back-mirrored\"></i>",a.addEventListener("click",()=>{t.hide("slide-out")}),t.container.appendChild(a),t.payload=e.payload,t._displayTimeout=null,t.container.addEventListener("mouseover",()=>{clearTimeout(t._displayTimeout)}),t.___mousoutListener=t._resetTimeout.bind(t),t.container.addEventListener("mouseout",t.___mouseoutListener),t._dismissAction=e.dismissAction,t.container.addEventListener("mousedown",a=>{a.target==t.container&&t.container.classList.add("active-state")}),t.container.addEventListener("mouseup",a=>{a.target==t.container&&(clearTimeout(t._displayTimeout),t.container.classList.remove("active-state"),"function"==typeof t._dismissAction&&t._dismissAction(t.payload,t),t.hide("dismissing"))}),e.icon){let a=document.createElement("div");if(a.className="notification-icon",t.container.appendChild(a),"object"==typeof e.icon)a.appendChild(new NodeRenderer$2(e.icon));else{let t=new DOMParser().parseFromString(e.icon,"text/html");if(t.body.children.length)for(var s=0;s<t.body.children.length;s++)a.appendChild(t.body.children[s].cloneNode(!0));else{let t=document.createElement("i");t.className=`icon ${e.icon}`,a.appendChild(t)}}}let n=document.createElement("div");if(n.className="content",t.container.appendChild(n),e.title&&e.title.length){let t=document.createElement("p");t.className="title-label",t.innerText=e.title,n.appendChild(t)}if(e.content)if("object"==typeof e.content)n.appendChild(new NodeRenderer$2(e.content));else{let t=new DOMParser().parseFromString(e.content,"text/html");if(t.body.children.length)for(var s=0;s<t.body.children.length;s++)n.appendChild(t.body.children[s].cloneNode(!0));else{let t=document.createElement("p");t.innerText=e.content,n.appendChild(t)}}let o=document.createElement("div");if(o.className="notification-inputs",e.inputs)if(t.container.appendChild(o),"object"==typeof e.inputs)o.appendChild(new NodeRenderer$2(e.inputs));else{let t=new DOMParser().parseFromString(e.inputs,"text/html");if(t.body.children.length)for(var s=0;s<t.body.children.length;s++)n.appendChild(t.body.children[s].cloneNode(!0))}let r=document.createElement("div");r.className="notification-buttons",e.buttons&&e.buttons.length&&(t.container.appendChild(r),e.buttons.forEach(e=>{let a=document.createElement("button");a.innerText=e.text,a.className=e.validate?"validated":"",a.disabled=e.validate&&[...o.querySelectorAll("input, select")].some(e=>e.dataset.minlength||"true"==e.dataset.required),a.addEventListener("click",()=>{"function"==typeof e.action&&e.action(t.payload,t),t._promiseResolve&&t._promiseResolve(findInRow(a)),t.hide("dismissing-action")}),r.appendChild(a)})),o.querySelectorAll("input, select").forEach(e=>{e.addEventListener("input",()=>{clearTimeout(t._displayTimeout),t._displayTimeout=null,t.container.removeEventListener("mouseout",t.___mouseoutListener);let e=r.querySelector(".validated");e&&(e.disabled=[...o.querySelectorAll("input, select")].some(e=>e.value.length<e.dataset.minlength||"true"==e.dataset.required&&!e.value.length))})})}_resetTimeout(){const e=this;!0===e.params.reminder||e.container.classList.contains("slide-out")||e.container.classList.contains("dismissing")||e.container.classList.contains("dismissing-action")||(clearTimeout(e._displayTimeout),e._displayTimeout=setTimeout(()=>{e.hide("slide-out")},6e3))}_removeFromParent(){const e=this;setTimeout(()=>{e.notificationCenter.removeChild(e.wrapper),setTimeout(()=>{e.notificationCenter.querySelectorAll(".notification-wrapper").forEach(e=>{for(var t=0,a=e;a.nextElementSibling;)t+=a.clientHeight+12,a=a.nextElementSibling;e.style.marginBottom=`${t}px`})})},450)}/**
	 * Displays a notification on the screen
	 */show(){const e=this;document.querySelector(".notification-center")?e.notificationCenter=document.querySelector(".notification-center"):document.body.appendChild(e.notificationCenter),e.notificationCenter.querySelectorAll(".notification-wrapper").forEach(e=>{for(var t=0,a=e;a;)t+=a.clientHeight+12,a=a.nextElementSibling;e.style.marginBottom=`${t}px`}),e.notificationCenter.appendChild(e.wrapper),e.container.classList.add("slide-in"),e.container.classList.remove("slide-out"),e.container.classList.remove("dismissing"),e.container.classList.remove("dismissing-action"),setTimeout(()=>{e.container.classList.remove("slide-in")},600),this._resetTimeout()}/**
	 * Displays a notification asynchroneously and returns a promise,
	 * which later returns the index of the pressed button (if any, else -1)
	 */async showAsync(){const e=this;return e.show(),e._promise=new Promise(t=>{e._promiseResolve=t}),e._promise}/**
	 * Hides a notification and removes it from the screen
	 */hide(e){const t=this;clearTimeout(t._displayTimeout),t._displayTimeout=null,t.container.classList.remove("slide-in"),t.container.classList.add(e),t._promise&&"undefined"==typeof t._promise.result&&t._promiseResolve(-1),this._removeFromParent()}/**
	 * Returns the text (if only one input/select) or an array of texts (if multiple) entered into the dialog
	 */get text(){const e=this;if(1<e.container.querySelectorAll("input, select").length){var t=[];return e.container.querySelectorAll("input, select").forEach(e=>{t.push(e.value)}),t}return e.container.querySelector("input, select")?e.container.querySelector("input, select").value:null}}var Classes=/*#__PURE__*/Object.freeze({ContentDialog:ContentDialog,ContentDialogResult:ContentDialogResult,Flyout:Flyout,MenuFlyout:MenuFlyout,Notification:index}),script={name:"MetroView",data(){return{container:null,params:{isPrimaryView:!1},_currentPage:null,pages:{},_items:{},_history:[]}},props:{viewId:String,isPrimaryView:Boolean},mounted(){let e=this;for(var t in e.container=this.$el,this.$props)e.params[t]=this.$props[t];e.params.isPrimaryView&&e.container.classList.add("view-active"),e._currentPage=null,e.pages={},e._items={},e._history=[],e.container.querySelectorAll(".pages > .page").forEach((t,a)=>{t.hasAttribute("data-page-id")&&(e.pages[t.getAttribute("data-page-id")]=t.__vue__,t.__vue__.params=Object.assign(t.__vue__.params,{parentView:e}),0==a&&(t.__vue__.show(),e._currentPage=e.pages[t.getAttribute("data-page-id")],e._history.push(t.getAttribute("data-page-id"))))})},methods:{navigate(e,t){const a=this;var i={url:null,addHistory:!0};for(var s in t)i[s]=t[s];let n=a.pages[e];if(n){if(n.isVisible())return;n.show(),a._currentPage=n,i.addHistory&&a._history.push(e)}},goBack(){const e=this;if(1<e._history.length){e._currentPage.hide();let t=e.pages[e._history[e._history.length-2]];t&&(t.show(),e._history.pop())}},show(){let e=this;document.querySelectorAll(".views .view").forEach(t=>{t==e.container?(t.classList.add("view-active"),t.dispatchEvent(new Event("viewShow"))):(t.classList.remove("view-active"),t.dispatchEvent(new Event("viewHide")))})},hide(){this.container.classList.remove("view-active"),this.container.dispatchEvent(new Event("viewHide"))},querySelector(e){return this.container.querySelector(e)},querySelectorAll(e){return this.container.querySelectorAll(e)}}};//
//
//
//
//
//
//
//
function normalizeComponent(e,t,a,i,s,n/* server only */,o,r,l,d){"boolean"!=typeof o&&(l=r,r=o,o=!1);// Vue.extend constructor export interop.
var c="function"==typeof a?a.options:a;// render functions
e&&e.render&&(c.render=e.render,c.staticRenderFns=e.staticRenderFns,c._compiled=!0,s&&(c.functional=!0)),i&&(c._scopeId=i);var p;if(n?(p=function(e){e=e||// cached call
this.$vnode&&this.$vnode.ssrContext||// stateful
this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,e||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),t&&t.call(this,l(e)),e&&e._registeredComponents&&e._registeredComponents.add(n)},c._ssrRegister=p):t&&(p=o?function(){t.call(this,d(this.$root.$options.shadowRoot))}:function(e){t.call(this,r(e))}),p)if(c.functional){// register for functional component in vue file
var m=c.render;c.render=function(e,t){return p.call(t),m(e,t)}}else{// inject component registration as beforeCreate hook
var u=c.beforeCreate;c.beforeCreate=u?[].concat(u,p):[p]}return a}var normalizeComponent_1=normalizeComponent;/* script */const __vue_script__=script;/* template */var __vue_render__=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"view",attrs:{"data-view-id":e.viewId}},[a("div",{staticClass:"pages"},[e._t("default")],2)])},__vue_staticRenderFns__=[];__vue_render__._withStripped=!0;/* style */const __vue_inject_styles__=void 0,__vue_scope_id__=void 0,__vue_module_identifier__=void 0,__vue_is_functional_template__=!1;/* scoped */ /* style inject */ /* style inject SSR */var View=normalizeComponent_1({render:__vue_render__,staticRenderFns:__vue_staticRenderFns__},void 0,__vue_script__,__vue_scope_id__,__vue_is_functional_template__,__vue_module_identifier__,void 0,void 0);//
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
const elementIsParentOfPage=(e,t)=>{for(var a=e;a&&!a.classList.contains("page");)a=a.parentNode;return a&&a==t.container};HTMLElement.prototype.parentNodeOfClass=function(e){for(var t=this.parentNode;t;){// console.log(node);
if(t.classList&&t.classList.contains(e))return t;t=t.parentNode}return null};var script$1={name:"MetroPage",data(){return{container:null,params:{parentView:null,parentPage:null,isPrimaryPage:!1,title:null},_scrollTop:null}},props:{pageId:String,title:String,isPrimaryPage:Boolean},mounted(){let e=this;for(var t in e.container=this.$el,this.$props)e.params[t]=this.$props[t];if(e.params.isPrimaryPage&&e.container.classList.add("page-active"),e._scrollTop=null,e.accentColorSelectors=[],e.querySelectorAll("div.accent-color-selector").forEach(t=>{elementIsParentOfPage(t,e)&&e.accentColorSelectors.push(t.__vue__)}),e.autoSuggestBoxes=[],e.querySelectorAll("div.auto-suggest").forEach(t=>{elementIsParentOfPage(t,e)&&e.autoSuggestBoxes.push(t.__vue__)}),e.backgroundThemeSelectors=[],e.querySelectorAll("div.background-theme-selector").forEach(t=>{elementIsParentOfPage(t,e)&&e.backgroundThemeSelectors.push(t.__vue__)}),e.commandBars=[],e.querySelectorAll("div.command-bar").forEach(t=>{elementIsParentOfPage(t,e)&&e.commandBars.push(t.__vue__)}),e.lists=[],e.querySelectorAll("div.list").forEach(t=>{elementIsParentOfPage(t,e)&&e.lists.push(t.__vue__)}),e.messages=[],e.querySelectorAll("div.messages-container").forEach(t=>{elementIsParentOfPage(t,e)&&e.messages.push(t.__vue__)}),e.navigationView=null,e.querySelector("div.navigation-view")){let t=e.querySelector("div.navigation-view");elementIsParentOfPage(t,e)&&(e.navigationView=t.__vue__)}// PersonPicture
e.personPictures=[],e.querySelectorAll("div.person-picture").forEach(t=>{elementIsParentOfPage(t,e)&&e.personPictures.push(t.__vue__)}),e.pivot=[],e.querySelectorAll("div.pivot").forEach(t=>{elementIsParentOfPage(t,e)&&e.pivot.push(t.__vue__)}),e.progressBars=[],e.querySelectorAll("div.progress:not(.indeterminate)").forEach(t=>{elementIsParentOfPage(t,e)&&e.progressBars.push(t.__vue__)}),e.sliders=[],e.querySelectorAll("div.slider").forEach(t=>{elementIsParentOfPage(t,e)&&e.sliders.push(t.__vue__)}),e.switches=[],e.querySelectorAll("div.toggle-switch").forEach(t=>{elementIsParentOfPage(t,e)&&e.switches.push(t.__vue__)})},methods:{show(){let e=this;e.params.parentPage?e.params.parentPage.querySelectorAll(".page").forEach(t=>{t==e.container?(t.classList.add("page-active"),t.dispatchEvent(new Event("pageShow"))):t.parentNodeOfClass("page")==e.container.parentNodeOfClass("page")&&t.classList.contains("page-active")&&(t.classList.remove("page-active"),t.dispatchEvent(new Event("pageHide")))}):e.params.parentView&&e.params.parentView.querySelectorAll(".pages > .page").forEach(t=>{t==e.container?(t.classList.add("page-active"),t.dispatchEvent(new Event("pageShow"))):t.parentNodeOfClass("page")==e.container.parentNodeOfClass("page")&&t.classList.contains("page-active")&&(t.classList.remove("page-active"),t.dispatchEvent(new Event("pageHide")))})},hide(){this.container.classList.remove("page-active"),this.container.dispatchEvent(new Event("pageHide"))},isVisible(){return this.container.classList.contains("page-active")},pageData(){const e=this;return{id:e.container.getAttribute("data-page-id"),container:e.container,view:e.params.parentView,parentPage:e.params.parentPage,title:e.params.title}},querySelector(e){return this.container.querySelector(e)},querySelectorAll(e){return this.container.querySelectorAll(e)}}};/* script */const __vue_script__$1=script$1;/* template */var __vue_render__$1=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"page",class:{"flex-container":this.$slots["top-app-bar"]||this.$slots["bottom-app-bar"]},attrs:{"data-page-id":e.pageId}},[this.$slots["top-app-bar"]?a("div",{staticClass:"top-app-bar"},[e._t("top-app-bar")],2):e._e(),e._v(" "),a("div",{staticClass:"page-content"},[e._t("default")],2),e._v(" "),this.$slots["bottom-app-bar"]?a("div",{staticClass:"bottom-app-bar"},[e._t("bottom-app-bar")],2):e._e()])},__vue_staticRenderFns__$1=[];__vue_render__$1._withStripped=!0;/* style */const __vue_inject_styles__$1=void 0,__vue_scope_id__$1=void 0,__vue_module_identifier__$1=void 0,__vue_is_functional_template__$1=!1;/* scoped */ /* style inject */ /* style inject SSR */var Page=normalizeComponent_1({render:__vue_render__$1,staticRenderFns:__vue_staticRenderFns__$1},void 0,__vue_script__$1,__vue_scope_id__$1,__vue_is_functional_template__$1,__vue_module_identifier__$1,void 0,void 0),script$2={name:"MetroAppBarButton",props:{icon:String,label:String,disabled:Boolean},methods:{emit(e){this.$emit(e)}}};//
//
//
//
//
//
//
//
//
/* script */const __vue_script__$2=script$2;/* template */var __vue_render__$2=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"app-bar-button",attrs:{disabled:e.disabled},on:{click:function(){return e.emit("click")}}},[e.icon?e._e():e._t("icon"),e._v(" "),e.icon?a("i",{class:"icon "+e.icon}):e._e(),e._v(" "),a("label",[e._v(e._s(e.label))])],2)},__vue_staticRenderFns__$2=[];__vue_render__$2._withStripped=!0;/* style */const __vue_inject_styles__$2=void 0,__vue_scope_id__$2=void 0,__vue_module_identifier__$2=void 0,__vue_is_functional_template__$2=!1;/* scoped */ /* style inject */ /* style inject SSR */var AppBarButton=normalizeComponent_1({render:__vue_render__$2,staticRenderFns:__vue_staticRenderFns__$2},void 0,__vue_script__$2,__vue_scope_id__$2,__vue_is_functional_template__$2,__vue_module_identifier__$2,void 0,void 0),script$3={name:"MetroAppBarSeparator"};//
//
//
//
/* script */const __vue_script__$3=script$3;/* template */var __vue_render__$3=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"app-bar-separator"})},__vue_staticRenderFns__$3=[];__vue_render__$3._withStripped=!0;/* style */const __vue_inject_styles__$3=void 0,__vue_scope_id__$3=void 0,__vue_module_identifier__$3=void 0,__vue_is_functional_template__$3=!1;/* scoped */ /* style inject */ /* style inject SSR */var AppBarSeparator=normalizeComponent_1({render:__vue_render__$3,staticRenderFns:__vue_staticRenderFns__$3},void 0,__vue_script__$3,__vue_scope_id__$3,__vue_is_functional_template__$3,__vue_module_identifier__$3,void 0,void 0),script$4={name:"MetroButton",props:{content:String,disabled:Boolean},methods:{emit(e,t){this.$emit(e,t)}}};//
//
//
//
//
//
//
/* script */const __vue_script__$4=script$4;/* template */var __vue_render__$4=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("button",{attrs:{disabled:e.disabled},on:{click:function(t){return e.emit("click",t)}}},[e._t("default"),e._v(" "),this.$slots.default?e._e():[e._v(e._s(e.content))]],2)},__vue_staticRenderFns__$4=[];__vue_render__$4._withStripped=!0;/* style */const __vue_inject_styles__$4=void 0,__vue_scope_id__$4=void 0,__vue_module_identifier__$4=void 0,__vue_is_functional_template__$4=!1;/* scoped */ /* style inject */ /* style inject SSR */var Button=normalizeComponent_1({render:__vue_render__$4,staticRenderFns:__vue_staticRenderFns__$4},void 0,__vue_script__$4,__vue_scope_id__$4,__vue_is_functional_template__$4,__vue_module_identifier__$4,void 0,void 0),script$5={name:"MetroCheckbox",props:{name:String,content:String,disabled:Boolean,value:Boolean},data(){return{uuid:uuid()}},methods:{_onChange(t){t.target.checked?this.$emit("checked",t):this.$emit("unchecked",t),this.$emit("input",t.target.checked)}}};//
/* script */const __vue_script__$5=script$5;/* template */var __vue_render__$5=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"checkbox",attrs:{disabled:e.disabled}},[a("input",{attrs:{type:"checkbox",name:e.name,id:e.uuid},domProps:{checked:e.value},on:{change:e._onChange}}),e._v(" "),a("label",{attrs:{for:e.uuid}},[e._v(e._s(e.content))])])},__vue_staticRenderFns__$5=[];__vue_render__$5._withStripped=!0;/* style */const __vue_inject_styles__$5=void 0,__vue_scope_id__$5=void 0,__vue_module_identifier__$5=void 0,__vue_is_functional_template__$5=!1;/* scoped */ /* style inject */ /* style inject SSR */var CheckBox=normalizeComponent_1({render:__vue_render__$5,staticRenderFns:__vue_staticRenderFns__$5},void 0,__vue_script__$5,__vue_scope_id__$5,__vue_is_functional_template__$5,__vue_module_identifier__$5,void 0,void 0),script$6={name:"MetroComboBox",props:{name:String,header:String,placeholderText:String,itemsSource:null,disabled:Boolean,required:Boolean,value:null,noUpdate:{type:Boolean,default:!1}},data(){return{dropDownOpen:!1,selectedIndex:-1,_value:this.$props.value,eventListener:null}},mounted(){this.$nextTick(function(){Object.assign(this.$refs.popup.style,{minWidth:`${this.$refs.content.clientWidth}px`})})},updated(){this.noUpdate||this.$nextTick(function(){this.$data._value=this.value,this.selectedIndex=this.itemsSource instanceof Array?this.itemsSource.indexOf(this.value):Object.keys(this.itemsSource).indexOf(this.value)})},methods:{_openDropDown(e){var t=Math.max,a=Math.min;this.dropDownOpen=!0,this.$refs.popup.parentElement.removeChild(this.$refs.popup),document.body.appendChild(this.$refs.popup),this.$nextTick(()=>{const e=this.$refs.popup.clientWidth,i=this.$refs.popup.clientHeight;let s=this.$refs.content.getBoundingClientRect(),n=-32*t(this.selectedIndex,0);Object.assign(this.$refs.popup.style,{top:`${t(a(window.innerHeight-(i+1),s.top-4+n),0)}px`,left:`${t(a(window.innerWidth-(e+1),s.left),0)}px`,minWidth:`${this.$refs.content.clientWidth}px`// transform: `translate3d(0, ${selectionOffset}px, 0)`
})}),e.stopPropagation(),this.eventListener=this._closeDropDown_internal.bind(this),document.addEventListener("click",this.eventListener,!0)},_closeDropDown_internal(e){e.target.parentNodeOfClass("combo-box-popup")||(e.preventDefault(),e.stopPropagation(),this._closeDropDown(e))},_closeDropDown(e,t){this.dropDownOpen=!1,document.removeEventListener("click",this.eventListener,!0),e.stopPropagation();t&&(this.$data._value=t,this.selectedIndex=this.itemsSource instanceof Array?this.itemsSource.indexOf(t):Object.keys(this.itemsSource).indexOf(t),this.$refs.select.value=t,this.$emit("input",this.$data._value),this.$refs.select.dispatchEvent(new Event("input")))}},computed:{items(){if(this.itemsSource instanceof Array)return this.itemsSource.reduce((e,t)=>({...e,[t]:t}),{});return this.itemsSource instanceof Object?this.itemsSource:void 0}}};//
/* script */const __vue_script__$6=script$6;/* template */var __vue_render__$6=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"combo-box",attrs:{disabled:e.disabled}},[e.header?a("label",[e._v(e._s(e.header))]):e._e(),e._v(" "),a("select",{ref:"select",attrs:{name:e.name,required:e.required}},[a("option"),e._v(" "),e._l(e.items,function(t,i){return a("option",{key:i,domProps:{value:i,selected:e.$data._value===i}},[e._v(e._s(t))])})],2),e._v(" "),a("div",{ref:"content",staticClass:"combo-box-content",on:{click:function(t){return e._openDropDown(t)}}},[e.placeholderText&&!this.$data._value?a("MetroTextBlock",[e._v(e._s(e.placeholderText))]):e._e(),e._v(" "),this.$data._value?a("MetroTextBlock",[e._v(e._s(e.items[this.$data._value]))]):e._e(),e._v(" "),a("div",{staticClass:"drop-down-glyph"})],1),e._v(" "),a("div",{directives:[{name:"show",rawName:"v-show",value:e.dropDownOpen,expression:"dropDownOpen"}],ref:"popup",staticClass:"combo-box-popup"},[a("div",{staticClass:"combo-box-items"},e._l(e.items,function(t,i){return a("div",{key:i,staticClass:"combo-box-item",class:{selected:e.$data._value===i},on:{click:function(t){return e._closeDropDown(t,i)}}},[e._v(e._s(t))])}),0)])])},__vue_staticRenderFns__$6=[];__vue_render__$6._withStripped=!0;/* style */const __vue_inject_styles__$6=void 0,__vue_scope_id__$6=void 0,__vue_module_identifier__$6=void 0,__vue_is_functional_template__$6=!1;/* scoped */ /* style inject */ /* style inject SSR */var ComboBox=normalizeComponent_1({render:__vue_render__$6,staticRenderFns:__vue_staticRenderFns__$6},void 0,__vue_script__$6,__vue_scope_id__$6,__vue_is_functional_template__$6,__vue_module_identifier__$6,void 0,void 0),script$7={name:"MetroCommandBar",data(){return{isOpen:!1}},mounted(){this.$el.querySelectorAll(".app-bar-button").forEach(e=>{e.addEventListener("click",this.close)})},methods:{toggle(){this.isOpen=!this.isOpen},open(){this.isOpen=!0},close(){this.isOpen=!1}}};//
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
/* script */const __vue_script__$7=script$7;/* template */var __vue_render__$7=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{class:"command-bar "+(e.isOpen?"expanded":"collapsed")},[a("div",{staticClass:"command-bar-content"},[this.$slots.content?a("div",{staticClass:"content"},[e._t("content")],2):e._e(),e._v(" "),a("div",{staticClass:"primary-commands"},[a("MetroStackPanel",{attrs:{orientation:"horizontal"}},[this.$slots["primary-commands"]?e._e():e._t("default"),e._v(" "),e._t("primary-commands")],2)],1),e._v(" "),a("div",{staticClass:"more-button",on:{click:e.toggle}},[a("MetroSymbolIcon",{attrs:{symbol:"more"}})],1)]),e._v(" "),this.$slots["secondary-commands"]?a("div",{staticClass:"secondary-commands"},[a("MetroStackPanel",{attrs:{orientation:"vertical"}},[e._t("secondary-commands")],2)],1):e._e()])},__vue_staticRenderFns__$7=[];__vue_render__$7._withStripped=!0;/* style */const __vue_inject_styles__$7=void 0,__vue_scope_id__$7=void 0,__vue_module_identifier__$7=void 0,__vue_is_functional_template__$7=!1;/* scoped */ /* style inject */ /* style inject SSR */var CommandBar=normalizeComponent_1({render:__vue_render__$7,staticRenderFns:__vue_staticRenderFns__$7},void 0,__vue_script__$7,__vue_scope_id__$7,__vue_is_functional_template__$7,__vue_module_identifier__$7,void 0,void 0),script$8={name:"MetroDataGrid",props:{itemsSource:Array,columnNames:Object},computed:{columnKeys(){return this.$props.itemsSource.reduce((e,t)=>(Object.keys(t).forEach(t=>{0>e.indexOf(t)&&e.push(t)}),e),[])},columnNameList(){if(!this.$props.itemsSource||!this.$props.itemsSource.length)return[];if(this.$props.columnNames){if(this.$props.columnNames instanceof Array)return this.$props.columnNames;let e=this.$props.itemsSource.reduce((e,t)=>(Object.keys(t).forEach(t=>{e[t]=t}),e),{}),t=[];return Object.keys(e).forEach(e=>{!this.$props.columnNames[e]&&0>t.indexOf(e)&&t.push(e),this.$props.columnNames[e]&&0>t.indexOf(this.$props.columnNames[e])&&t.push(this.$props.columnNames[e])}),t}return this.columnKeys}}};//
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
/* script */const __vue_script__$8=script$8;/* template */var __vue_render__$8=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"data-grid"},[a("div",{staticClass:"data-grid-wrapper"},[a("div",{staticClass:"table"},[a("div",{staticClass:"column-headers-border"}),e._v(" "),a("div",{staticClass:"tr column-headers"},e._l(e.columnNameList,function(t,i){return a("div",{key:i,staticClass:"th column-header-item"},[e._v(e._s(t))])}),0),e._v(" "),e._l(e.itemsSource,function(t,i){return a("div",{key:i,staticClass:"row-wrapper"},[a("div",{staticClass:"tr row"},e._l(e.columnKeys,function(s){return a("div",{key:i+s,staticClass:"td cell"},["boolean"==typeof t[s]?a("MetroCheckbox",{attrs:{value:t[s]}}):a("span",[e._v(e._s(t[s]))])],1)}),0),e._v(" "),a("div",{staticClass:"row-background",style:"top: "+32*(i+1)+"px"})])})],2)])])},__vue_staticRenderFns__$8=[];__vue_render__$8._withStripped=!0;/* style */const __vue_inject_styles__$8=void 0,__vue_scope_id__$8=void 0,__vue_module_identifier__$8=void 0,__vue_is_functional_template__$8=!1;/* scoped */ /* style inject */ /* style inject SSR */var DataGrid=normalizeComponent_1({render:__vue_render__$8,staticRenderFns:__vue_staticRenderFns__$8},void 0,__vue_script__$8,__vue_scope_id__$8,__vue_is_functional_template__$8,__vue_module_identifier__$8,void 0,void 0),script$9={name:"MetroFlipView",props:{initialIndex:{type:Number,default:0}},data(){return{page:this.$props.initialIndex,itemCount:-1}},mounted(){this.$refs["scroll-content"].querySelector(".flip-view-item")&&(this.itemCount=this.$refs["scroll-content"].querySelectorAll(".flip-view-item").length)},methods:{previousPage(){this.page=Math.max(this.page-1,0)},nextPage(){this.page=Math.min(this.page+1,this.itemCount-1)}},calculated:{flipViewItems(){return this.$slots.default}}};//
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
/* script */const __vue_script__$9=script$9;/* template */var __vue_render__$9=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"flip-view"},[a("div",{staticClass:"scrolling-host"},[a("div",{ref:"scroll-content",staticClass:"scroll-content",style:"transform: translate3d(-"+100*this.page+"%, 0, 0)"},[e._t("default")],2)]),e._v(" "),a("MetroButton",{directives:[{name:"show",rawName:"v-show",value:0<this.page,expression:"this.page > 0"}],staticClass:"previous-button",on:{click:e.previousPage}},[a("MetroFontIcon",{attrs:{"font-size":"12px",glyph:"&#xE0E2;"}})],1),e._v(" "),a("MetroButton",{directives:[{name:"show",rawName:"v-show",value:this.page<this.itemCount-1,expression:"this.page < this.itemCount - 1"}],staticClass:"next-button",on:{click:e.nextPage}},[a("MetroFontIcon",{attrs:{"font-size":"12px",glyph:"&#xE0E3;"}})],1)],1)},__vue_staticRenderFns__$9=[];__vue_render__$9._withStripped=!0;/* style */const __vue_inject_styles__$9=void 0,__vue_scope_id__$9=void 0,__vue_module_identifier__$9=void 0,__vue_is_functional_template__$9=!1;/* scoped */ /* style inject */ /* style inject SSR */var FlipView=normalizeComponent_1({render:__vue_render__$9,staticRenderFns:__vue_staticRenderFns__$9},void 0,__vue_script__$9,__vue_scope_id__$9,__vue_is_functional_template__$9,__vue_module_identifier__$9,void 0,void 0),script$a={name:"MetroFlipViewItem"};//
//
//
//
//
//
/* script */const __vue_script__$a=script$a;/* template */var __vue_render__$a=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"flip-view-item"},[e._t("default")],2)},__vue_staticRenderFns__$a=[];__vue_render__$a._withStripped=!0;/* style */const __vue_inject_styles__$a=void 0,__vue_scope_id__$a=void 0,__vue_module_identifier__$a=void 0,__vue_is_functional_template__$a=!1;/* scoped */ /* style inject */ /* style inject SSR */var FlipViewItem=normalizeComponent_1({render:__vue_render__$a,staticRenderFns:__vue_staticRenderFns__$a},void 0,__vue_script__$a,__vue_scope_id__$a,__vue_is_functional_template__$a,__vue_module_identifier__$a,void 0,void 0),script$b={name:"MetroFontIcon",props:{fontFamily:{type:String,default:"Segoe MDL2 Assets"},fontSize:{type:String,default:"20px"},fontStyle:{type:String,default:"normal"},glyph:String}};//
//
//
//
//
//
/* script */const __vue_script__$b=script$b;/* template */var __vue_render__$b=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"font-icon"},[a("p",{style:{"font-family":e.fontFamily,"font-size":e.fontSize,"font-style":e.fontStyle},domProps:{innerHTML:e._s(e.glyph)}})])},__vue_staticRenderFns__$b=[];__vue_render__$b._withStripped=!0;/* style */const __vue_inject_styles__$b=void 0,__vue_scope_id__$b=void 0,__vue_module_identifier__$b=void 0,__vue_is_functional_template__$b=!1;/* scoped */ /* style inject */ /* style inject SSR */var FontIcon=normalizeComponent_1({render:__vue_render__$b,staticRenderFns:__vue_staticRenderFns__$b},void 0,__vue_script__$b,__vue_scope_id__$b,__vue_is_functional_template__$b,__vue_module_identifier__$b,void 0,void 0),script$c={name:"MetroGridView",props:{itemsSource:Array,flowDirection:{type:String,default:"left-to-right",validator:e=>0<=["left-to-right","right-to-left"].indexOf(e)},selectionMode:{type:String,default:"none",validator:e=>0<=["none","single","multiple"].indexOf(e)}},data(){return{selectedItems:[]}},methods:{_selectItem(e,t){switch(this.selectionMode){case"none":return;case"single":if(navigator.userAgent.match(/windows|linux/i)&&e.ctrlKey||navigator.userAgent.match(/macintosh/i)&&e.metaKey||"ontouchend"in window)this.selectedItems=0<=this.selectedItems.indexOf(t)?[]:[t];else{if(0<=this.selectedItems.indexOf(t))return;this.selectedItems=[t]}break;case"multiple":navigator.userAgent.match(/windows|linux/i)&&e.ctrlKey||navigator.userAgent.match(/macintosh/i)&&e.metaKey||"ontouchend"in window?0<=this.selectedItems.indexOf(t)?this.selectedItems.splice(this.selectedItems.indexOf(t),1):this.selectedItems.push(t):this.selectedItems=[t];break;default:return;}this.$emit("selectionChanged",this,{})}}};//
//
//
//
//
//
//
//
//
//
/* script */const __vue_script__$c=script$c;/* template */var __vue_render__$c=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{class:"grid-view "+e.flowDirection},e._l(e.itemsSource,function(t,i){return a("div",{key:i,staticClass:"grid-view-item",class:{selected:0<=e.selectedItems.indexOf(i)},on:{click:function(t){return e._selectItem(t,i)}}},[a("div",{staticClass:"grid-view-item-content"},[e._t("item-template",null,{local:t})],2)])}),0)},__vue_staticRenderFns__$c=[];__vue_render__$c._withStripped=!0;/* style */const __vue_inject_styles__$c=void 0,__vue_scope_id__$c=void 0,__vue_module_identifier__$c=void 0,__vue_is_functional_template__$c=!1;/* scoped */ /* style inject */ /* style inject SSR */var GridView=normalizeComponent_1({render:__vue_render__$c,staticRenderFns:__vue_staticRenderFns__$c},void 0,__vue_script__$c,__vue_scope_id__$c,__vue_is_functional_template__$c,__vue_module_identifier__$c,void 0,void 0),script$d={name:"MetroHyperlinkButton",props:{content:String,navigateUri:String,disabled:Boolean},methods:{onClick(t){this.navigateUri||t.preventDefault(),this.$emit("click",t)}}};//
//
//
//
//
//
//
/* script */const __vue_script__$d=script$d;/* template */var __vue_render__$d=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("a",{staticClass:"hyperlink-button",attrs:{href:e.navigateUri?e.navigateUri:"#",disabled:e.disabled},on:{click:e.onClick}},[e._t("default"),e._v(" "),this.$slots.default?e._e():[e._v(e._s(e.content))]],2)},__vue_staticRenderFns__$d=[];__vue_render__$d._withStripped=!0;/* style */const __vue_inject_styles__$d=void 0,__vue_scope_id__$d=void 0,__vue_module_identifier__$d=void 0,__vue_is_functional_template__$d=!1;/* scoped */ /* style inject */ /* style inject SSR */var HyperlinkButton=normalizeComponent_1({render:__vue_render__$d,staticRenderFns:__vue_staticRenderFns__$d},void 0,__vue_script__$d,__vue_scope_id__$d,__vue_is_functional_template__$d,__vue_module_identifier__$d,void 0,void 0);//
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
Array.prototype.firstObject=function(){return this[0]},Array.prototype.lastObject=function(){return this[this.length-1]};var script$e={name:"MetroMessages",props:{useTextarea:Boolean,disabled:Boolean,showInput:{type:Boolean,default:!0},placeholderText:{type:String,default:"Type a text message"},messages:{type:Array,default:()=>[]}},data(){return{_messages:[],messageText:""}},mounted(){this.$data._messages=[],this.messages.forEach(e=>{this.addMessage(e)})},methods:{_onInput(t){this.messageText=t.target.value,t.target.style.height=null,t.target.style.height=`${Math.min(70,t.target.scrollHeight)}px`,this._scrollToBottom()},_onKeyDown(t){13!=t.keyCode||t.shiftKey||(this._sendMessage(),t.preventDefault())},_scrollToBottom(){setTimeout(()=>{this.$refs.container.scrollTo(0,this.$refs.container.scrollHeight)})},_sendMessage(){this.messageText.length&&(this.$emit("messageSent",this.messageText),this.messageText="",this.$refs.input.value=null,this.$refs.input.style.height=null)},_renderMessage(e){return e=e.replace(/[\u00A0-\u9999<>\&]/gim,function(e){return"&#"+e.charCodeAt(0)+";"}).replace(/\n/g,"<br>"),"function"==typeof this.onMessageRender&&(e=this.onMessageRender(e)),e},addMessage(e){if(this.$data._messages.lastObject()){const t=this.$data._messages.lastObject();"sent"!=t.type&&"sent"==e.type?(e.hasTail=!0,e.isFirst=!0):"sent"==t.type&&"sent"==e.type&&(t.hasTail=!1,e.hasTail=!0),"received"!=t.type&&"received"==e.type?e.hasTail=!0:"received"==t.type&&"received"==e.type&&(e.author==t.author?e.hasTail=!1:(e.hasTail=!0,e.isFirst=!0))}else e.hasTail=!0,e.isFirst=!0;e.text=this._renderMessage(e.text),this.$data._messages.push(e),this._scrollToBottom()},addSystemMessage(e){this.$data._messages.push({type:"system",text:e}),this._scrollToBottom()},setMessages(e){this.$data._messages=[],e.forEach(e=>{this.addMessage(e)})}},filters:{time(e){return e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}}};/* script */const __vue_script__$e=script$e;/* template */var __vue_render__$e=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"messages"},[a("div",{ref:"container",staticClass:"messages-container"},[a("MetroStackPanel",{staticClass:"messages-wrapper",attrs:{"vertical-alignment":"bottom"}},e._l(e.$data._messages,function(t,i){var s;return a("div",{key:i,class:(s={message:"system"!=t.type},s["message-"+t.type]=!0,s["message-tail"]=t.hasTail,s["message-first"]=t.isFirst,s)},[[a("div",{staticClass:"message-content"},[a("div",{staticClass:"message-bubble"},[a("MetroTextBlock",{staticClass:"message-text"},[a("span",{domProps:{innerHTML:e._s(t.text)}})]),e._v(" "),a("MetroStackPanel",{staticClass:"message-info",attrs:{orientation:"horizontal","vertical-alignment":"center"}},[a("MetroTextBlock",{staticClass:"message-time",attrs:{"text-style":"caption"}},[e._v(e._s(e._f("time")(t.date)))]),e._v(" "),a("MetroTextBlock",{staticClass:"message-name",attrs:{"text-style":"base","text-alignment":"right"}},[e._v(e._s(t.displayName||t.author))])],1)],1)])],e._v(" "),"system"===t.type?[a("span",[e._v(e._s(t.text))])]:e._e()],2)}),0)],1),e._v(" "),a("MetroStackPanel",{directives:[{name:"show",rawName:"v-show",value:e.showInput,expression:"showInput"}],staticClass:"messages-input",attrs:{orientation:"horizontal","vertical-alignment":"top"}},[a("textarea",{directives:[{name:"model",rawName:"v-model",value:e.messageText,expression:"messageText"}],ref:"input",attrs:{placeholder:e.placeholderText,disabled:e.disabled},domProps:{value:e.messageText},on:{input:[function(t){t.target.composing||(e.messageText=t.target.value)},e._onInput],keydown:e._onKeyDown}}),e._v(" "),a("MetroButton",{staticClass:"send-message",attrs:{disabled:!e.messageText.length},on:{click:e._sendMessage}},[a("MetroSymbolIcon",{attrs:{symbol:"send"}})],1)],1)],1)},__vue_staticRenderFns__$e=[];__vue_render__$e._withStripped=!0;/* style */const __vue_inject_styles__$e=void 0,__vue_scope_id__$e=void 0,__vue_module_identifier__$e=void 0,__vue_is_functional_template__$e=!1;/* scoped */ /* style inject */ /* style inject SSR */var Messages=normalizeComponent_1({render:__vue_render__$e,staticRenderFns:__vue_staticRenderFns__$e},void 0,__vue_script__$e,__vue_scope_id__$e,__vue_is_functional_template__$e,__vue_module_identifier__$e,void 0,void 0),script$f={name:"MetroNavigationView",props:{settingsVisible:{type:Boolean,default:!0},backButtonVisible:{type:Boolean,default:!0},paneTitle:String,header:null,paneDisplayMode:{type:String,default:"",validator:e=>0<=["left","left-compact","left-minimal","top",""].indexOf(e)}},data(){return{headerText:this.$props.header,collapsed:!1,expanded:!1,_paneDisplayMode:this.$props.paneDisplayMode,minimal:"left-minimal"===this.$props.paneDisplayMode,top:"top"===this.$props.paneDisplayMode,menuItems:{},pages:{},currentPage:null,history:[]}},mounted(){const e=this;this.$refs["content-frame"].querySelectorAll(".page").forEach(e=>{if(e.hasAttribute("data-page-id")){if(this.pages[e.getAttribute("data-page-id")])throw new Error("NavigationView pages must have unique identifiers!");this.pages[e.getAttribute("data-page-id")]=e}}),this.$refs["menu-items"].$el.querySelectorAll(".navigation-view-item").forEach(e=>{if(e.hasAttribute("data-page-id")){if(this.menuItems[e.getAttribute("data-page-id")])throw new Error("NavigationView menu items must have unique identifiers!");this.menuItems[e.getAttribute("data-page-id")]=e,e.addEventListener("click",()=>{this.navigate(e.getAttribute("data-page-id")),this.$emit("selectionChanged",e,{selectedItem:e,isSettingsSelected:e===this.$refs["settings-nav-pane-item"]}),("left-compact"===this.$data._paneDisplayMode||"left-minimal"===this.$data._paneDisplayMode||1008>window.innerWidth&&"left"!==this.$data._paneDisplayMode)&&(this.expanded=!1)})}}),this.$refs["footer-content"]&&this.$refs["footer-content"].$el.querySelectorAll(".navigation-view-item").forEach(t=>{if(t.__vue__.$props.pageId){if(this.menuItems[t.__vue__.$props.pageId])throw new Error("NavigationView menu items must have unique identifiers!");this.menuItems[t.__vue__.$props.pageId]=t,t.addEventListener("click",()=>{"left-compact"===this.$data._paneDisplayMode||"left-minimal"===this.$data._paneDisplayMode||1008>window.innerWidth&&"left"!==this.$data._paneDisplayMode?(this.expanded=!1,setTimeout(()=>{this.navigate(t.__vue__.$props.pageId)},350)):this.navigate(t.__vue__.$props.pageId),e.$emit("selectionChanged",t,{selectedItem:t,isSettingsSelected:t===this.$refs["settings-nav-pane-item"].$el})})}})},methods:{async navigate(e,t={}){this.currentPage!==e&&this.pages[e]&&(this.history.lastObject()!==e&&this.history.push(e),this.menuItems[e]&&(this.menuItems[this.currentPage]&&this.menuItems[this.currentPage].classList.remove("selected"),this.menuItems[e].classList.add("selected")),this.currentPage&&(this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatingFrom")),this.pages[this.currentPage].classList.add("page-fade-out"),await new Promise(e=>setTimeout(()=>{this.pages[this.currentPage].classList.remove("page-fade-out"),this.pages[this.currentPage].classList.remove("page-active"),e()},150)),this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatedFrom"))),this.pages[e].dispatchEvent(new CustomEvent("navigatingTo")),this.currentPage=e,this.pages[e].classList.add("page-active"),this.pages[e].classList.add("page-slide-in"),setTimeout(()=>{this.pages[e].classList.remove("page-slide-in")},400),this.pages[e].dispatchEvent(new CustomEvent("navigatedTo",{detail:{...t,pageId:e}})))},async goBack(){if(1>=this.history.length)return;let e=this.history[this.history.length-2];this.history.pop();this.pages[e]&&this.currentPage!==e&&(// this.pages[lastPage].__vue__.$emit("loaded", this.pages[lastPage], {
// 	pageId: lastPage
// });
this.menuItems[e]&&(this.menuItems[this.currentPage]&&this.menuItems[this.currentPage].classList.remove("selected"),this.menuItems[e].classList.add("selected")),this.currentPage&&(this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatingBackFrom")),this.pages[this.currentPage].classList.add("page-slide-out"),await new Promise(e=>setTimeout(()=>{this.pages[this.currentPage].classList.remove("page-slide-out"),this.pages[this.currentPage].classList.remove("page-active"),e()},350)),this.pages[this.currentPage].dispatchEvent(new CustomEvent("navigatedBackFrom"))),this.pages[e].dispatchEvent(new CustomEvent("navigatingBackTo")),this.currentPage=e,this.pages[e].classList.add("page-active"),this.pages[e].classList.add("page-fade-in"),setTimeout(()=>{this.pages[e].classList.remove("page-fade-in")},150),this.pages[e].dispatchEvent(new CustomEvent("navigatedBackTo")))},setHeader(e){this.headerText=e},setSelectedMenuItem(e){Object.values(this.menuItems).forEach(e=>{e.classList.remove("selected")}),this.menuItems[e]&&this.menuItems[e].classList.add("selected")},togglePane(){"left-compact"===this.$data._paneDisplayMode||"left-minimal"===this.$data._paneDisplayMode||1008>window.innerWidth&&"left"!==this.$data._paneDisplayMode?this.expanded=!this.expanded:this.collapsed=!this.collapsed},focusAutoSuggest(){this.$el.querySelector(".auto-suggest-area input")&&(1008>window.innerWidth?this.expanded=!0:this.collapsed=!1,setTimeout(()=>{!this.$el.querySelector(".auto-suggest-area input").focus()},0))},setPaneDisplayMode(e){this.$data._paneDisplayMode=e,this.minimal="left-minimal"===e,this.top="top"===e}}};//
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
/* script */const __vue_script__$f=script$f;/* template */var __vue_render__$f=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{class:"navigation-view "+e.$data._paneDisplayMode},[a("MetroStackPanel",{staticClass:"pane-toggle-button-container",class:{collapsed:e.collapsed,expanded:e.expanded},attrs:{"horizontal-alignment":"left"}},[e.backButtonVisible?a("MetroButton",{staticClass:"navigation-view-back-button",attrs:{disabled:1>=e.history.length},on:{click:e.goBack}},[a("MetroSymbolIcon",{attrs:{symbol:"back"}})],1):e._e(),e._v(" "),a("MetroButton",{staticClass:"toggle-pane-button",class:{fill:e.paneTitle},on:{click:e.togglePane}},[a("MetroSymbolIcon",{attrs:{symbol:"global-navigation-button"}})],1)],1),e._v(" "),a("div",{staticClass:"pane-content acrylic acrylic-80",class:{collapsed:e.collapsed,expanded:e.expanded,"back-button-visible":e.backButtonVisible}},[a("MetroStackPanel",{staticClass:"pane-toggle-button-container",class:{collapsed:e.collapsed,expanded:e.expanded},attrs:{"horizontal-alignment":"left"}},[a("MetroButton",{staticClass:"toggle-pane-button",class:{fill:e.paneTitle},on:{click:e.togglePane}},[a("MetroSymbolIcon",{attrs:{symbol:"global-navigation-button"}})],1)],1),e._v(" "),e.paneTitle?a("MetroStackPanel",{staticClass:"pane-title",attrs:{orientation:"horizontal","vertical-alignment":"center"}},[a("MetroTextBlock",{attrs:{"text-style":"base",text:e.paneTitle}})],1):e._e(),e._v(" "),this.$slots["auto-suggest-box"]?a("MetroStackPanel",{staticClass:"auto-suggest-area",attrs:{orientation:"horizontal","vertical-alignment":"center"}},[e._t("auto-suggest-box"),e._v(" "),a("MetroButton",{staticClass:"auto-suggest-button",on:{click:e.focusAutoSuggest}},[a("MetroSymbolIcon",{attrs:{symbol:"find"}})],1)],2):e._e(),e._v(" "),a("MetroStackPanel",{ref:"menu-items",staticClass:"menu-items",attrs:{"vertical-alignment":"top"}},[e._t("menu-items")],2),e._v(" "),e.settingsVisible||this.$slots["pane-footer"]?a("MetroStackPanel",{ref:"footer-content",staticClass:"footer-content",attrs:{"vertical-alignment":"top"}},[e._t("pane-footer"),e._v(" "),e.settingsVisible?a("MetroNavigationViewItem",{ref:"settings-nav-pane-item",attrs:{icon:"setting",content:"Settings","page-id":"settings"}}):e._e()],2):e._e()],1),e._v(" "),a("div",{staticClass:"content-root"},[e.headerText||this.$slots.header?a("div",{staticClass:"header-content",class:{"back-button-visible":e.backButtonVisible}},[e._t("header",null,{local:e.headerText}),e._v(" "),null===this.$slots.header?a("MetroTextBlock",{attrs:{text:e.headerText}}):e._e()],2):e._e(),e._v(" "),a("div",{ref:"content-frame",staticClass:"content-frame"},[e._t("default")],2)])],1)},__vue_staticRenderFns__$f=[];__vue_render__$f._withStripped=!0;/* style */const __vue_inject_styles__$f=void 0,__vue_scope_id__$f=void 0,__vue_module_identifier__$f=void 0,__vue_is_functional_template__$f=!1;/* scoped */ /* style inject */ /* style inject SSR */var NavigationView=normalizeComponent_1({render:__vue_render__$f,staticRenderFns:__vue_staticRenderFns__$f},void 0,__vue_script__$f,__vue_scope_id__$f,__vue_is_functional_template__$f,__vue_module_identifier__$f,void 0,void 0),script$g={name:"MetroNavigationViewItem",props:{icon:String,content:String,pageId:String,disabled:Boolean,selected:Boolean}};//
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
/* script */const __vue_script__$g=script$g;/* template */var __vue_render__$g=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"navigation-view-item",class:{icon:e.icon||this.$slots.icon},attrs:{"data-page-id":e.pageId,disabled:e.disabled}},[a("div",{staticClass:"navigation-view-item-inner"},[e.icon||this.$slots.icon?a("div",{staticClass:"navigation-view-item-icon"},[e._t("icon"),e._v(" "),e.icon&&!this.$slots.icon?a("MetroSymbolIcon",{attrs:{symbol:e.icon}}):e._e()],2):e._e(),e._v(" "),a("div",{staticClass:"navigation-view-item-content"},[e._t("default"),e._v(" "),this.$slots.default?e._e():a("MetroTextBlock",{attrs:{text:e.content}})],2)])])},__vue_staticRenderFns__$g=[];__vue_render__$g._withStripped=!0;/* style */const __vue_inject_styles__$g=void 0,__vue_scope_id__$g=void 0,__vue_module_identifier__$g=void 0,__vue_is_functional_template__$g=!1;/* scoped */ /* style inject */ /* style inject SSR */var NavigationViewItem=normalizeComponent_1({render:__vue_render__$g,staticRenderFns:__vue_staticRenderFns__$g},void 0,__vue_script__$g,__vue_scope_id__$g,__vue_is_functional_template__$g,__vue_module_identifier__$g,void 0,void 0),script$h={name:"MetroNavigationViewItemHeader",props:{content:String}};//
//
//
//
//
//
/* script */const __vue_script__$h=script$h;/* template */var __vue_render__$h=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"navigation-view-item-header"},[a("MetroTextBlock",{attrs:{textStyle:"base",text:e.content}})],1)},__vue_staticRenderFns__$h=[];__vue_render__$h._withStripped=!0;/* style */const __vue_inject_styles__$h=void 0,__vue_scope_id__$h=void 0,__vue_module_identifier__$h=void 0,__vue_is_functional_template__$h=!1;/* scoped */ /* style inject */ /* style inject SSR */var NavigationViewItemHeader=normalizeComponent_1({render:__vue_render__$h,staticRenderFns:__vue_staticRenderFns__$h},void 0,__vue_script__$h,__vue_scope_id__$h,__vue_is_functional_template__$h,__vue_module_identifier__$h,void 0,void 0),script$i={name:"MetroNavigationViewItemSeparator"};//
//
//
//
/* script */const __vue_script__$i=script$i;/* template */var __vue_render__$i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"navigation-view-item-separator"})},__vue_staticRenderFns__$i=[];__vue_render__$i._withStripped=!0;/* style */const __vue_inject_styles__$i=void 0,__vue_scope_id__$i=void 0,__vue_module_identifier__$i=void 0,__vue_is_functional_template__$i=!1;/* scoped */ /* style inject */ /* style inject SSR */var NavigationViewItemSeparator=normalizeComponent_1({render:__vue_render__$i,staticRenderFns:__vue_staticRenderFns__$i},void 0,__vue_script__$i,__vue_scope_id__$i,__vue_is_functional_template__$i,__vue_module_identifier__$i,void 0,void 0),script$j={name:"MetroRadioButton",props:{groupName:String,name:null,content:String,disabled:Boolean,value:null},data(){return{uuid:uuid()}},methods:{_onChange(t){t.target.checked?this.$emit("checked",t):this.$emit("unchecked",t),this.$emit("input",t.target.value),t.target.dispatchEvent(new Event("input"))}},computed:{checked(){return this.value===this.name}}};//
/* script */const __vue_script__$j=script$j;/* template */var __vue_render__$j=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"radio-button",attrs:{disabled:e.disabled},on:{change:e._onChange}},[a("input",{attrs:{type:"radio",id:e.uuid,name:e.groupName},domProps:{checked:e.checked,value:e.name}}),e._v(" "),a("label",{attrs:{for:e.uuid}},[e._v(e._s(e.content))])])},__vue_staticRenderFns__$j=[];__vue_render__$j._withStripped=!0;/* style */const __vue_inject_styles__$j=void 0,__vue_scope_id__$j=void 0,__vue_module_identifier__$j=void 0,__vue_is_functional_template__$j=!1;/* scoped */ /* style inject */ /* style inject SSR */var RadioButton=normalizeComponent_1({render:__vue_render__$j,staticRenderFns:__vue_staticRenderFns__$j},void 0,__vue_script__$j,__vue_scope_id__$j,__vue_is_functional_template__$j,__vue_module_identifier__$j,void 0,void 0),script$k={name:"MetroRatingControl",props:{name:String,value:{type:Number,default:-1},required:Boolean},data(){return{_value:this.$props.value,hoverValue:0}},methods:{setHoverValue(e){this.hoverValue=e},setValue(e){this.$data._value=e,this.$emit("input",this.$data._value)}}};//
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
/* script */const __vue_script__$k=script$k;/* template */var __vue_render__$k=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"rating-control",on:{mouseleave:function(){return e.setHoverValue(0)}}},[a("input",{directives:[{name:"model",rawName:"v-model",value:e.$data._value,expression:"$data._value"}],attrs:{type:"number",min:"1",max:"5",name:e.name,required:e.required,readonly:""},domProps:{value:e.$data._value},on:{input:function(t){t.target.composing||e.$set(e.$data,"_value",t.target.value)}}}),e._v(" "),a("MetroStackPanel",{attrs:{orientation:"horizontal","horizontal-alignment":"left"}},e._l([,,,,,],function(t,i){return a("div",{key:"bg_"+i,staticStyle:{width:"22px",height:"22px"},on:{mouseenter:function(){return e.setHoverValue(i+1)},click:function(){return e.setValue(i+1)}}},[a("MetroSymbolIcon",{attrs:{icon:"favorite-star-fill"}})],1)}),0),e._v(" "),a("div",{staticClass:"foreground-content",class:{colored:0<e.$data._value}},[!e.hoverValue&&0<=e.$data._value?a("MetroStackPanel",{attrs:{orientation:"horizontal","horizontal-alignment":"left"}},e._l(Array(e.$data._value),function(e,t){return a("MetroSymbolIcon",{key:"fg_"+t,attrs:{icon:"favorite-star-fill"}})}),1):e._e(),e._v(" "),0<=e.hoverValue?a("MetroStackPanel",{attrs:{orientation:"horizontal","horizontal-alignment":"left"}},e._l(Array(e.hoverValue),function(t,i){return a("MetroSymbolIcon",{key:"fg_"+i,class:{"hover-state":i===e.hoverValue-1},attrs:{icon:"favorite-star-fill"}})}),1):e._e()],1)],1)},__vue_staticRenderFns__$k=[];__vue_render__$k._withStripped=!0;/* style */const __vue_inject_styles__$k=void 0,__vue_scope_id__$k=void 0,__vue_module_identifier__$k=void 0,__vue_is_functional_template__$k=!1;/* scoped */ /* style inject */ /* style inject SSR */var RatingControl=normalizeComponent_1({render:__vue_render__$k,staticRenderFns:__vue_staticRenderFns__$k},void 0,__vue_script__$k,__vue_scope_id__$k,__vue_is_functional_template__$k,__vue_module_identifier__$k,void 0,void 0),script$l={name:"MetroTextBlock",props:{text:null,textStyle:{type:String,default:"body"},textAlignment:{type:String,default:"left"}}};//
//
//
//
//
//
//
/* script */const __vue_script__$l=script$l;/* template */var __vue_render__$l=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("p",{class:"text-block "+e.textStyle,style:{"text-align":e.textAlignment}},[e._t("default"),e._v(" "),this.$slots.default?e._e():[e._v(e._s(e.text))]],2)},__vue_staticRenderFns__$l=[];__vue_render__$l._withStripped=!0;/* style */const __vue_inject_styles__$l=void 0,__vue_scope_id__$l=void 0,__vue_module_identifier__$l=void 0,__vue_is_functional_template__$l=!1;/* scoped */ /* style inject */ /* style inject SSR */var TextBlock=normalizeComponent_1({render:__vue_render__$l,staticRenderFns:__vue_staticRenderFns__$l},void 0,__vue_script__$l,__vue_scope_id__$l,__vue_is_functional_template__$l,__vue_module_identifier__$l,void 0,void 0),script$m={name:"MetroTextBox",props:{name:String,header:String,placeholderText:String,disabled:Boolean,readOnly:Boolean,value:null,minlength:{type:Number,default:0},maxlength:{type:Number,default:-1},required:!1,textarea:!1},methods:{onInput(t){this.$emit("input",t.target.value)},onFocus(t){this.$emit("focus",t)},onBlur(t){this.$emit("blur",t)},onKeyDown(t){this.$emit("keydown",t)},onKeyUp(t){this.$emit("keyup",t)}}};//
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
/* script */const __vue_script__$m=script$m;/* template */var __vue_render__$m=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"text-box",attrs:{disabled:e.disabled}},[e.header?a("label",[e._v(e._s(e.header))]):e._e(),e._v(" "),e.textarea?e._e():a("input",{attrs:{type:"text",name:e.name,placeholder:e.placeholderText,minlength:e.minlength,maxlength:e.maxlength,required:e.required,autocomplete:"off",readonly:e.readOnly},domProps:{value:e.value},on:{input:e.onInput,focus:e.onFocus,blur:e.onBlur,keydown:e.onKeyDown,keyup:e.onKeyUp}}),e._v(" "),e.textarea?a("textarea",{attrs:{name:e.name,placeholder:e.placeholderText,minlength:e.minlength,maxlength:e.maxlength,required:e.required,autocomplete:"off",readonly:e.readOnly},domProps:{value:e.value},on:{input:e.onInput,focus:e.onFocus,blur:e.onBlur,keydown:e.onKeyDown,keyup:e.onKeyUp}}):e._e()])},__vue_staticRenderFns__$m=[];__vue_render__$m._withStripped=!0;/* style */const __vue_inject_styles__$m=void 0,__vue_scope_id__$m=void 0,__vue_module_identifier__$m=void 0,__vue_is_functional_template__$m=!1;/* scoped */ /* style inject */ /* style inject SSR */var TextBox=normalizeComponent_1({render:__vue_render__$m,staticRenderFns:__vue_staticRenderFns__$m},void 0,__vue_script__$m,__vue_scope_id__$m,__vue_is_functional_template__$m,__vue_module_identifier__$m,void 0,void 0),script$n={name:"MetroToggleSwitch",props:{header:String,onContent:{type:String,default:"On"},offContent:{type:String,default:"Off"},disabled:Boolean,value:Boolean},data(){return{uuid:uuid(),checked:this.$props.value}},methods:{_onChange(t){this.$data.checked=t.target.checked,t.target.checked?this.$emit("checked",t):this.$emit("unchecked",t),this.$emit("toggled",t.target.checked),this.$emit("input",t.target.checked)}}};//
/* script */const __vue_script__$n=script$n;/* template */var __vue_render__$n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"toggle-switch",attrs:{disabled:e.disabled}},[e.header?a("label",{staticClass:"header"},[e._v(e._s(e.header))]):e._e(),e._v(" "),a("input",{attrs:{type:"checkbox",id:e.uuid},domProps:{checked:e.value},on:{change:e._onChange}}),e._v(" "),a("label",{staticClass:"switch-knob",attrs:{for:e.uuid}},[a("p",{staticClass:"item-content"},[e._v(e._s(e.checked?e.onContent:e.offContent))])])])},__vue_staticRenderFns__$n=[];__vue_render__$n._withStripped=!0;/* style */const __vue_inject_styles__$n=void 0,__vue_scope_id__$n=void 0,__vue_module_identifier__$n=void 0,__vue_is_functional_template__$n=!1;/* scoped */ /* style inject */ /* style inject SSR */var ToggleSwitch=normalizeComponent_1({render:__vue_render__$n,staticRenderFns:__vue_staticRenderFns__$n},void 0,__vue_script__$n,__vue_scope_id__$n,__vue_is_functional_template__$n,__vue_module_identifier__$n,void 0,void 0),script$o={name:"MetroPasswordBox",props:{name:String,header:String,placeholderText:String,disabled:Boolean,readOnly:Boolean,value:null,minLength:0,maxLength:-1,required:!1},methods:{onInput(t){this.$emit("input",t.target.value)},onFocus(t){this.$emit("focus",t)},onBlur(t){this.$emit("blur",t)},onKeyDown(t){this.$emit("keydown",t)},onKeyUp(t){this.$emit("keyup",t)}}};//
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
/* script */const __vue_script__$o=script$o;/* template */var __vue_render__$o=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"password-box",attrs:{disabled:e.disabled}},[e.header?a("label",[e._v(e._s(e.header))]):e._e(),e._v(" "),a("input",{attrs:{type:"password",name:e.name,placeholder:e.placeholderText,minlength:e.minLength,maxlength:e.maxLength,required:e.required,readonly:e.readOnly},domProps:{value:e.value},on:{input:e.onInput,focus:e.onFocus,blur:e.onBlur,keydown:e.onKeyDown,keyup:e.onKeyUp}})])},__vue_staticRenderFns__$o=[];__vue_render__$o._withStripped=!0;/* style */const __vue_inject_styles__$o=void 0,__vue_scope_id__$o=void 0,__vue_module_identifier__$o=void 0,__vue_is_functional_template__$o=!1;/* scoped */ /* style inject */ /* style inject SSR */var PasswordBox=normalizeComponent_1({render:__vue_render__$o,staticRenderFns:__vue_staticRenderFns__$o},void 0,__vue_script__$o,__vue_scope_id__$o,__vue_is_functional_template__$o,__vue_module_identifier__$o,void 0,void 0),script$p={name:"MetroPersonPicture",props:{initials:String,displayName:String,profilePicture:String,badgeText:String,badgeGlyph:String},computed:{initialsText(){if(this.$props.initials)return this.$props.initials;if(this.$props.displayName){var e=this.$props.displayName.replace(/_/g," ").split(" "),t=e[0].substring(0,1).toUpperCase();return 1<e.length&&(t+=e[e.length-1].substring(0,1).toUpperCase()),t}}}};//
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
/* script */const __vue_script__$p=script$p;/* template */var __vue_render__$p=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"person-picture"},[e.initials||e.displayName||e.profilePicture?e._e():a("MetroSymbolIcon",{attrs:{symbol:"contact"}}),e._v(" "),(e.initials||e.displayName)&&!e.profilePicture?a("MetroTextBlock",{staticClass:"initials",attrs:{text:e.initialsText}}):e._e(),e._v(" "),e.profilePicture?a("img",{staticClass:"profile-picture",attrs:{src:e.profilePicture}}):e._e(),e._v(" "),e.badgeText||e.badgeGlyph?a("div",{staticClass:"badge"},[a("span",[e._v(e._s(e.badgeText))])]):e._e()],1)},__vue_staticRenderFns__$p=[];__vue_render__$p._withStripped=!0;/* style */const __vue_inject_styles__$p=void 0,__vue_scope_id__$p=void 0,__vue_module_identifier__$p=void 0,__vue_is_functional_template__$p=!1;/* scoped */ /* style inject */ /* style inject SSR */var PersonPicture=normalizeComponent_1({render:__vue_render__$p,staticRenderFns:__vue_staticRenderFns__$p},void 0,__vue_script__$p,__vue_scope_id__$p,__vue_is_functional_template__$p,__vue_module_identifier__$p,void 0,void 0),script$q={name:"MetroPivot",props:{title:String},data(){return{items:{},headerItems:{},itemOrder:[],currentItem:null}},created(){this.headerItems=this.$slots.default.reduce((e,t)=>{let a=uuid();return t.__uuid__=a,e[a]={header:t.componentOptions.propsData.header,disabled:t.componentOptions.propsData.disabled},this.itemOrder.push(a),e},{})},mounted(){this.items=this.$slots.default.reduce((e,t)=>({...e,[t.__uuid__]:t.elm}),{}),this.itemOrder.length&&this.navigate(this.itemOrder[0])},methods:{async navigate(e){if(this.items[e])if(this.currentItem){let t=this.itemOrder.indexOf(this.currentItem),a=this.itemOrder.indexOf(e);if(a===t)return;let i=this.currentItem;this.currentItem=e,a>t?(this.items[i].classList.add("item-out-right-left"),await new Promise(t=>setTimeout(()=>{this.items[i].classList.remove("item-active"),this.items[i].classList.remove("item-out-right-left"),this.items[e].classList.add("item-active"),this.items[e].classList.add("item-in-right-left"),t()},200))):a<=t&&(this.items[i].classList.add("item-out-left-right"),await new Promise(t=>setTimeout(()=>{this.items[i].classList.remove("item-active"),this.items[i].classList.remove("item-out-left-right"),this.items[e].classList.add("item-active"),this.items[e].classList.add("item-in-left-right"),t()},200))),setTimeout(()=>{this.items[e].classList.remove("item-in-right-left"),this.items[e].classList.remove("item-in-left-right")},400)}else this.currentItem=e,this.items[e].classList.add("item-active"),this.items[e].classList.add("item-in-right-left"),await new Promise(t=>setTimeout(()=>{this.items[e].classList.remove("item-in-right-left"),t()},500))}}};//
/* script */const __vue_script__$q=script$q;/* template */var __vue_render__$q=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"pivot"},[e.title||this.$slots.title?a("div",{staticClass:"title-content"},[e.title&&!this.$slots.title?a("MetroTextBlock",{attrs:{text:e.title}}):e._e(),e._v(" "),e._t("title")],2):e._e(),e._v(" "),a("div",{staticClass:"pivot-header"},[this.$slots["left-header"]?a("div",{staticClass:"left-header"},[e._t("left-header")],2):e._e(),e._v(" "),a("div",{ref:"header-clipper",staticClass:"header-clipper"},e._l(Object.keys(e.headerItems),function(t,i){return a("div",{key:i,staticClass:"pivot-header-item",class:{selected:e.currentItem===t},attrs:{"data-item-uuid":t,disabled:e.headerItems[t].disabled},on:{click:function(){return e.navigate(t)}}},[a("MetroTextBlock",{attrs:{text:e.headerItems[t].header}})],1)}),0),e._v(" "),this.$slots["right-header"]?a("div",{staticClass:"right-header"},[e._t("right-header")],2):e._e()]),e._v(" "),a("div",{ref:"pivot-items",staticClass:"pivot-items"},[e._t("default")],2)])},__vue_staticRenderFns__$q=[];__vue_render__$q._withStripped=!0;/* style */const __vue_inject_styles__$q=void 0,__vue_scope_id__$q=void 0,__vue_module_identifier__$q=void 0,__vue_is_functional_template__$q=!1;/* scoped */ /* style inject */ /* style inject SSR */var Pivot=normalizeComponent_1({render:__vue_render__$q,staticRenderFns:__vue_staticRenderFns__$q},void 0,__vue_script__$q,__vue_scope_id__$q,__vue_is_functional_template__$q,__vue_module_identifier__$q,void 0,void 0),script$r={name:"MetroPivotItem",props:{header:String,disabled:Boolean}};//
//
//
//
//
//
/* script */const __vue_script__$r=script$r;/* template */var __vue_render__$r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"pivot-item",attrs:{disabled:e.disabled}},[e._t("default")],2)},__vue_staticRenderFns__$r=[];__vue_render__$r._withStripped=!0;/* style */const __vue_inject_styles__$r=void 0,__vue_scope_id__$r=void 0,__vue_module_identifier__$r=void 0,__vue_is_functional_template__$r=!1;/* scoped */ /* style inject */ /* style inject SSR */var PivotItem=normalizeComponent_1({render:__vue_render__$r,staticRenderFns:__vue_staticRenderFns__$r},void 0,__vue_script__$r,__vue_scope_id__$r,__vue_is_functional_template__$r,__vue_module_identifier__$r,void 0,void 0),script$s={name:"MetroProgressBar",props:{value:0,minimum:{type:Number,default:0},maximum:{type:Number,default:100},indeterminate:Boolean},computed:{indicatorWidth(){return Math.min(Math.max(100*(this.value-this.minimum)/(this.maximum-this.minimum),0),100)}}};//
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
/* script */const __vue_script__$s=script$s;/* template */var __vue_render__$s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"progress-bar"},[a("div",{directives:[{name:"show",rawName:"v-show",value:!e.indeterminate,expression:"!indeterminate"}],staticClass:"determinate-root"},[a("div",{staticClass:"progress-bar-indicator",style:"width: "+e.indicatorWidth+"%"})]),e._v(" "),a("div",{directives:[{name:"show",rawName:"v-show",value:e.indeterminate,expression:"indeterminate"}],staticClass:"indeterminate-root"},e._l([,,,,,],function(e,t){return a("div",{key:t,staticClass:"ellipse",style:"transform: translate3d("+-8*t+"px, 0, 0); animation-delay: "+(-3880+100*t)+"ms"})}),0)])},__vue_staticRenderFns__$s=[];__vue_render__$s._withStripped=!0;/* style */const __vue_inject_styles__$s=void 0,__vue_scope_id__$s=void 0,__vue_module_identifier__$s=void 0,__vue_is_functional_template__$s=!1;/* scoped */ /* style inject */ /* style inject SSR */var ProgressBar=normalizeComponent_1({render:__vue_render__$s,staticRenderFns:__vue_staticRenderFns__$s},void 0,__vue_script__$s,__vue_scope_id__$s,__vue_is_functional_template__$s,__vue_module_identifier__$s,void 0,void 0),script$t={name:"MetroProgressRing",props:{active:Boolean}};//
//
//
//
//
//
/* script */const __vue_script__$t=script$t;/* template */var __vue_render__$t=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{directives:[{name:"show",rawName:"v-show",value:e.active,expression:"active"}],staticClass:"progress-ring"},e._l([,,,,,,],function(e,t){return a("div",{key:t,staticClass:"ellipse",style:"animation-delay: "+(-4260+166*t)+"ms"})}),0)},__vue_staticRenderFns__$t=[];__vue_render__$t._withStripped=!0;/* style */const __vue_inject_styles__$t=void 0,__vue_scope_id__$t=void 0,__vue_module_identifier__$t=void 0,__vue_is_functional_template__$t=!1;/* scoped */ /* style inject */ /* style inject SSR */var ProgressRing=normalizeComponent_1({render:__vue_render__$t,staticRenderFns:__vue_staticRenderFns__$t},void 0,__vue_script__$t,__vue_scope_id__$t,__vue_is_functional_template__$t,__vue_module_identifier__$t,void 0,void 0),script$u={name:"MetroPathIcon",props:{data:String}};//
//
//
//
//
//
//
//
/* script */const __vue_script__$u=script$u;/* template */var __vue_render__$u=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"path-icon"},[a("svg",{attrs:{width:"20px",height:"20px",viewBox:"0 0 20 20",version:"1.1",xmlns:"http://www.w3.org/2000/svg"}},[a("path",{attrs:{d:e.data}})])])},__vue_staticRenderFns__$u=[];__vue_render__$u._withStripped=!0;/* style */const __vue_inject_styles__$u=void 0,__vue_scope_id__$u=void 0,__vue_module_identifier__$u=void 0,__vue_is_functional_template__$u=!1;/* scoped */ /* style inject */ /* style inject SSR */var PathIcon=normalizeComponent_1({render:__vue_render__$u,staticRenderFns:__vue_staticRenderFns__$u},void 0,__vue_script__$u,__vue_scope_id__$u,__vue_is_functional_template__$u,__vue_module_identifier__$u,void 0,void 0),script$v={name:"MetroSymbolIcon",props:{symbol:String,icon:String}};//
//
//
//
//
//
//
/* script */const __vue_script__$v=script$v;/* template */var __vue_render__$v=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"symbol-icon"},[e.symbol&&!e.icon?a("i",{class:"symbol "+e.symbol}):e._e(),e._v(" "),!e.symbol&&e.icon?a("i",{class:"icon "+e.icon}):e._e()])},__vue_staticRenderFns__$v=[];__vue_render__$v._withStripped=!0;/* style */const __vue_inject_styles__$v=void 0,__vue_scope_id__$v=void 0,__vue_module_identifier__$v=void 0,__vue_is_functional_template__$v=!1;/* scoped */ /* style inject */ /* style inject SSR */var SymbolIcon=normalizeComponent_1({render:__vue_render__$v,staticRenderFns:__vue_staticRenderFns__$v},void 0,__vue_script__$v,__vue_scope_id__$v,__vue_is_functional_template__$v,__vue_module_identifier__$v,void 0,void 0),script$w={name:"MetroStackPanel",props:{orientation:{type:String,default:"vertical",validator:e=>0<=["horizontal","vertical"].indexOf(e)},horizontalAlignment:{type:String,default:"stretch",validator:e=>0<=["left","center","right","stretch"].indexOf(e)},verticalAlignment:{type:String,default:"stretch",validator:e=>0<=["top","center","bottom","stretch"].indexOf(e)}}};//
//
//
//
//
//
/* script */const __vue_script__$w=script$w;/* template */var __vue_render__$w=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{class:"stack-panel "+e.orientation+" x-"+e.horizontalAlignment+" y-"+e.verticalAlignment},[e._t("default")],2)},__vue_staticRenderFns__$w=[];__vue_render__$w._withStripped=!0;/* style */const __vue_inject_styles__$w=void 0,__vue_scope_id__$w=void 0,__vue_module_identifier__$w=void 0,__vue_is_functional_template__$w=!1;/* scoped */ /* style inject */ /* style inject SSR */var StackPanel=normalizeComponent_1({render:__vue_render__$w,staticRenderFns:__vue_staticRenderFns__$w},void 0,__vue_script__$w,__vue_scope_id__$w,__vue_is_functional_template__$w,__vue_module_identifier__$w,void 0,void 0);const components=[View,Page,AppBarButton,AppBarSeparator,Button,CheckBox,ComboBox,CommandBar,DataGrid,FlipView,FlipViewItem,FontIcon,GridView,HyperlinkButton,Messages,NavigationView,NavigationViewItem,NavigationViewItemHeader,NavigationViewItemSeparator,RadioButton,RatingControl,TextBlock,TextBox,ToggleSwitch,PasswordBox,PersonPicture,Pivot,PivotItem,ProgressBar,ProgressRing,PathIcon,SymbolIcon,StackPanel];var index$1=e=>{components.forEach(t=>e.component(t.name,t))},Components=/*#__PURE__*/Object.freeze({default:index$1});// const metroUI = Vue => {
// 	Object.values(Components).forEach(Component => {
// 		Vue.use(Component)
// 	})
// }
// Object.keys(Classes).forEach(ClassKey => {
// 	metroUI[ClassKey] = Classes[ClassKey]
// })
// window.metroUI = metroUI;
// export default metroUI;
const metroUI=window.metroUI={};Object.keys(Classes).forEach(e=>{metroUI[e]=Classes[e]});function install(e){Object.values(Components).forEach(t=>{e.use(t)})}var index$2={components:Components,install:install};export default index$2;export{Classes,Components};
