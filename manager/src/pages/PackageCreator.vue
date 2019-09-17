<template>
	<MetroPage page-id="package-creator">
		<MetroTextBlock>
			To create your Package, you first need to reserve a name and a bundle identifier.<br>
			With both of these associated to you, you can start submitting your Package.
		</MetroTextBlock>
		
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
			<MetroButton class="system-accent-color" :disabled="!packageData.name.length || !packageData.identifier.length || isWorking.createPackage" @click="createPackage">Reserve Package name</MetroButton>
			<MetroButton style="margin: 0 4px">Cancel</MetroButton>
			
			<MetroProgressRing :active="isWorking.createPackage" />
		</MetroStackPanel>
	</MetroPage>
</template>

<script>
import { PackageAPI } from "@/scripts/ApiUtil"

export default {
	name: "PackageCreator",
	data() {
		return {
			packageData: {
				name: "",
				identifier: ""
			},
			isWorking: {
				packageName: false,
				packageIdentifier: false,
				createPackage: false
			}
		}
	},
	beforeRouteEnter: async (to, from, next) => {
		next(vm => {
			vm.$parent.setHeader("Create a Package");
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
					title: "Package name unavailable",
					content: "The selected Package name is already in use. Please use a different Package name.",
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: "Package name is available",
					content: "The selected Package name is available for use.",
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
					title: "Bundle ID unavailable",
					content: "The selected Bundle ID is already in use. Please use a different Bundle ID.",
					commands: [{ text: "Ok", primary: true }]
				}).show();
			} else {
				new metroUI.ContentDialog({
					title: "Bundle ID is available",
					content: "The selected Bundle ID is available for use.",
					commands: [{ text: "Ok", primary: true }]
				}).show();
			}
		},
		async createPackage() {
			this.isWorking.createPackage = true;
			
			let packageObjResponse = await PackageAPI.createPackage(this.packageData);
			
			this.isWorking.createPackage = false;
			
			if (packageObjResponse.data.error) {
				console.error(packageObjResponse.data.error);
			} else {
				this.$router.replace(`/package/${packageObjResponse.data.identifier}`);
			}
		}
	}
}
</script>