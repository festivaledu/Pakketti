<template>
	<MetroPage page-id="package-creator">
		<vue-headful :title="`${$t('package_creator.title')} - ${$t('app.name')}`" />
		
		<MetroTextBlock><span v-html="$t('package_creator.create_package_disclaimer')" /></MetroTextBlock>
		
		<div class="row">
			<div class="col-12 col-md-6">
				<div class="mb-4">
					<MetroTextBox
						:header="$t('package_editor.info.package_name_title')"
						:placeholder-text="$t('package_editor.info.package_name_placeholder')"
						:maxlength="50"
						v-model="packageData.name"
						style="margin-top: 16px"
					/>
					<div class="row mt-2">
						<div class="col-6">
							<MetroHyperlinkButton v-if="!isWorking.packageName" :disabled="!packageData.name.length" @click="checkNameAvailability">{{ $t('package_editor.info.button_check_availability') }}</MetroHyperlinkButton>
							<MetroProgressRing v-if="isWorking.packageName" :active="true" />
						</div>
						<div class="col-6">
							<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.name.length }} / 50</MetroTextBlock>
						</div>
					</div>
				</div>
				<div class="mb-4">
					<MetroTextBox
						:header="$t('package_editor.info.bundle_identifier_title')"
						:placeholder-text="$t('package_editor.info.bundle_identifier_placeholder')"
						:maxlength="50"
						v-model="packageData.identifier"
						style="margin-top: 16px"
					/>
					<div class="row mt-2">
						<div class="col-6">
							<MetroHyperlinkButton v-if="!isWorking.packageIdentifier" :disabled="!packageData.identifier.length" @click="checkIdentifierAvailability">{{ $t('package_editor.info.button_check_availability') }}</MetroHyperlinkButton>
							<MetroProgressRing v-if="isWorking.packageIdentifier" :active="true" />
						</div>
						<div class="col-6">
							<MetroTextBlock text-style="caption" text-alignment="right" class="text-muted">{{ packageData.identifier.length }} / 50</MetroTextBlock>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<MetroStackPanel orientation="horizontal" horizontal-alignment="left" vertical-alignment="center">
			<MetroButton class="system-accent-color" :disabled="!packageData.name.length || !packageData.identifier.length || isWorking.createPackage" @click="createPackage">{{ $t('package_creator.button_reserve') }}</MetroButton>
			
			<MetroProgressRing :active="isWorking.createPackage" />
		</MetroStackPanel>
	</MetroPage>
</template>

<script>
import { PackageAPI } from "@/scripts/ApiUtil"

export default {
	name: "PackageCreator",
	data: () => ({
		packageData: {
			name: "",
			identifier: ""
		},
		isWorking: {
			packageName: false,
			packageIdentifier: false,
			createPackage: false
		}
	}),
	beforeRouteEnter: async (to, from, next) => {
		next(vm => {
			vm.$parent.setHeader(vm.$t('package_creator.title'));
			vm.$parent.setSelectedMenuItem("packages");
		});
	},
	methods: {
		async checkNameAvailability() {
			this.isWorking.packageName = true;
			
			let packageList = await PackageAPI.getPackages({
				"package.name": this.packageData.name
			});
			this.isWorking.packageName = false;
			
			if (packageList.length) {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.package_name_availability.unavailable_title'),
					content: this.$t('package_editor.info.package_name_availability.unavailable_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.package_name_availability.available_title'),
					content: this.$t('package_editor.info.package_name_availability.available_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			}
		},
		async checkIdentifierAvailability() {
			this.isWorking.packageIdentifier = true;
			
			let packageList = await PackageAPI.getPackages({
				"package.identifier": this.packageData.identifier
			});
			this.isWorking.packageIdentifier = false;
			
			if (packageList.length) {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.bundle_id_availability.unavailable_title'),
					content: this.$t('package_editor.info.bundle_id_availability.unavailable_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: this.$t('package_editor.info.bundle_id_availability.available_title'),
					content: this.$t('package_editor.info.bundle_id_availability.available_body'),
					commands: [{ text: "Ok", primary: true }]
				}).show();
			}
		},
		async createPackage() {
			this.isWorking.createPackage = true;
			
			let packageObjResponse = await PackageAPI.createPackage(this.packageData);
			
			this.isWorking.createPackage = false;
			
			if (packageObjResponse.data.error) {
				new metroUI.ContentDialog({
					title: this.$t('app.operational_error_title'),
					content: this.$t('app.operational_error_message', {
						code: packageObjResponse.data.error.code,
						name: packageObjResponse.data.error.name,
						message: packageObjResponse.data.error.message
					}),
					commands: [{ text: this.$t('app.ok'), primary: true }]
				}).show();
			} else {
				this.$router.replace(`/package/${packageObjResponse.data.identifier}`);
			}
		}
	}
}
</script>