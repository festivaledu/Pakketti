<template>
	<div class="person-picture">
		<MetroSymbolIcon symbol="contact" v-if="!initials && !displayName && !profilePicture" />
		
		<MetroTextBlock class="initials" v-if="(initials || displayName) && !profilePicture" :text="initialsText" />
		<img class="profile-picture" v-if="profilePicture" :src="profilePicture" />
		
		<div class="badge" v-if="badgeText || badgeGlyph">
			<span>{{ badgeText }}</span>
			<!-- Add FontIcon -->
		</div>
	</div>
</template>

<script>
export default {
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
}
</script>
