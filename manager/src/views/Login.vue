<template>
	<div class="views transparent" data-page="root">
		<div class="view" data-view-id="main-view">
			<div class="pages">
				<div class="page" data-page-id="login">
					<vue-headful title="Pakketti – Login" />
					<div class="container">
						<div class="row justify-content-around">
							<div class="col-md-4">
								<nav class="mb-5">
									<div class="nav-logo pb-0">
										<div class="nav-link">
											<h1 class="text-center">Pakketti</h1>
										</div>
									</div>
								</nav>
								<hr>

								<div class="row mt-3 d-flex">
									<div class="col progress-indicator-container" >
										<div class="progress indeterminate" v-show="isWorking" />
									</div>
								</div>

								<form novalidate>
									<div class="form-group">
										<label>Username or E-Mail Address</label>
										<input type="text" placeholder="Johnny Appleseed" v-model="user.username" :disabled="!socket" @input="$v.user.username.$touch()" @keyup.13="login">
									</div>
									<div class="form-group">
										<label for="login-password">Password</label>
										<input type="password" placeholder="Required" v-model="user.password" :disabled="!socket" @input="$v.user.password.$touch()" @keyup.13="login">
									</div>
								</form>

								<div class="row mt-3 d-flex">
									<div class="col col-6 text-right">
										<button class="btn btn-primary d-inline-block colored" @click="login()" :disabled="!socket || $v.user.$invalid || isWorking">Sign In</button>
									</div>

									<div class="col text-left" v-show="!isWorking">
										<a href="#" class="d-inline-block mt-2 p-0" @click.prevent="register" :disabled="!socket">No Account?</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less">
	.container {
		min-height: 100%;
		display: flex;
		align-items: center;
		& > .row {
			flex: 1;
		}
	}
</style>


<script>
import { SocketService } from "@/scripts/SocketService";
import { AuthAPI } from "@/scripts/ApiUtil";

import { required } from "vuelidate/lib/validators";
import CryptoJS from "crypto-js";

export default {
	name: "login",
	data: () => ({
		user: {
			username: "",
			password: ""
		},
		isWorking: false
	}),
	validations: {
		user: {
			username: { required },
			password: { required }
		}
	},
	methods: {
		async login() {
			document.activeElement.blur();
			this.isWorking = true;
			
			AuthAPI.login({
				username: this.user.username,
				password: CryptoJS.SHA512(this.user.password).toString(CryptoJS.enc.Hex)
			}).then(authData => {
				this.isWorking = false;
				
				if (authData.code) {
					new metroUI.ContentDialog({
						title: "There was an error signing you in",
						content: `<p>The server responded with the following message:<br><span style="font-style: italic">${authData.code}: ${authData.message}</span></p>`,
						commands: [{ text: "Ok", primary: true }]
					}).show();
					return;
				}
				
				this.$store.commit("setAccountId", authData.accountId);
				this.$store.commit("setRole", authData.role);
				
				this.$router.replace("/");
			});
		},
		async register() {
			var registerDialog = new metroUI.ContentDialog({
				title: "Register with Pakketti",
				content: (() => {
				return (
					<div>
						<input type="text" placeholder="Username" data-required />
						<input type="email" placeholder="E-Mail Address" data-required />
						<input type="password" placeholder="Password (min. 8 characters)" data-minlength="8" />
						<input type="password" placeholder="Confirm Password" data-minlength="8" />
					</div>
				)
			})(),
				commands: [{ text: "Cancel" }, { text: "Ok", primary: true }]
			});
			if (await registerDialog.showAsync() == metroUI.ContentDialogResult.Primary) {
				let texts = registerDialog.text;
				if (texts[2].localeCompare(texts[3]) != 0) {
					new metroUI.ContentDialog({
						title: "There was an error creating your account",
						content: "The passwords you've entered do not match.",
						commands: [{ text: "Ok", primary: true }]
					}).show();
					return;
				}
				
				this.isWorking = true;
				AuthAPI.register({
					username: texts[0],
					email: texts[1],
					password: CryptoJS.SHA512(texts[2]).toString(CryptoJS.enc.Hex)
				}).then(async authData => {
					this.isWorking = false;

					if (!authData.auth) {
						new metroUI.ContentDialog({
							title: "There was an error signing you in",
							content: `<p>The server responded with the following message:<br><span style="font-style: italic">${typeof authData === 'string' ? authData : `${authData.code}: ${authData.message}`}</span></p>`,
							commands: [{ text: "Ok", primary: true }]
						}).show();
						return;
					} else {
						await new metroUI.ContentDialog({
							title: "Registration successful",
							content: "<p>Your account has been successfully created.<br>You will now be redirected to the Dashboard.<p>",
							commands: [{ text: "Ok", primary: true }]
						}).showAsync();
						
						this.$router.replace("/");
					}
				});
			}
		},
	},
	computed: {
		socket() {
			return SocketService.socket;
		}
	}
}
</script>
