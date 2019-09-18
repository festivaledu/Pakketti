<template>
	<MetroPage page-id="error">
		<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" style="height: calc(100vh - 64px)">
			<MetroTextBlock text-style="title" text-alignment="center" style="font-size: 34px; font-weight: 500">
				{{ $t('app.generic_error_title') }}
			</MetroTextBlock>
			<MetroTextBlock text-style="sub-title" text-alignment="center">
				{{ $t('app.generic_error_message') }}
			</MetroTextBlock>
		</MetroStackPanel>
	</MetroPage>
</template>

<script>
export default {
	name: "ErrorPage",
	beforeRouteEnter: async (to, from, next) => {

		next(vm => {
			vm.$parent.setHeader("");
			vm.$parent.setSelectedMenuItem(null);
		});
	},
}
</script>