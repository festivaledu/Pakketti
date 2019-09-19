<template>
	<div class="messages">
		<div class="messages-container" ref="container">
			<MetroStackPanel class="messages-wrapper" vertical-alignment="bottom">
				<div :class="{'message': messageObj.type != 'system', [`message-${messageObj.type}`]: true, 'message-tail': messageObj.hasTail, 'message-first': messageObj.isFirst}" v-for="(messageObj, index) in $data._messages" :key="index">
					<template v-i="messageObj.type === 'sent' || messageObj.type === 'received'">
						<div class="message-content">
							<div class="message-bubble">
								<MetroTextBlock class="message-text" >
									<span v-html="messageObj.text" />
								</MetroTextBlock>
								
								<MetroStackPanel class="message-info" orientation="horizontal" vertical-alignment="center">
									<MetroTextBlock class="message-time" text-style="caption">{{ messageObj.date | time }}</MetroTextBlock>
									<MetroTextBlock class="message-name" text-style="base" text-alignment="right">{{ messageObj.displayName || messageObj.author }}</MetroTextBlock>
								</MetroStackPanel>
							</div>
						</div>
					</template>
					<template v-if="messageObj.type === 'system'">
						<span>{{ messageObj.text }}</span>
					</template>
				</div>
			</MetroStackPanel>
		</div>
		
		<MetroStackPanel class="messages-input" orientation="horizontal" vertical-alignment="top" v-show="showInput">
			<textarea 
				:placeholder="placeholderText"
				v-model="messageText"
				@input="_onInput"
				@keydown="_onKeyDown"
				:disabled="disabled"
				ref="input"
			/>
			
			<MetroButton class="send-message" @click="_sendMessage" :disabled="!messageText.length">
				<MetroSymbolIcon symbol="send" />
			</MetroButton>
		</MetroStackPanel>
	</div>
</template>

<script>
Array.prototype.firstObject = function() {
	return this[0];
}
Array.prototype.lastObject = function() {
	return this[this.length - 1];
}

export default {
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
}
</script>
