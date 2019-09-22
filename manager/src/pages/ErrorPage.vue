<template>
	<MetroPage page-id="error">
		<vue-headful :title="`${$t('root.error')} - ${$t('app.name')}`" />
		
		<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" style="height: 100vh">
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
	beforeRouteEnter: (to, from, next) => {
		next(vm => {
			vm.$parent.setHeader(null);
			vm.$parent.setSelectedMenuItem(null);
		});
	}
}
</script>