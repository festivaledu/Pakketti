<template>
	<MetroPage page-id="error">
		<MetroStackPanel orientation="vertical" horizontal-alignment="center" vertical-alignment="center" style="height: calc(100vh - 40px)">
			<MetroTextBlock text-style="title" style="font-size: 34px; font-weight: 500">
				{{ $t('app.generic_error_title') }}
			</MetroTextBlock>
			<MetroTextBlock text-style="sub-title">
				{{ $t('app.generic_error_message') }}
			</MetroTextBlock>
		</MetroStackPanel>
	</MetroPage>
</template>

<script>
export default {
	name: "ErrorPage"
}
</script>