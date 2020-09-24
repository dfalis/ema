import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
	AuthenticationService,
	LoginCredentials
} from '../authentication.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	credentials: LoginCredentials = {
		email: '',
		password: ''
	};
	message: String;

	constructor(private auth: AuthenticationService, private router: Router) {}

	ngOnInit() {
		if (this.auth.isLoggedIn() == true) this.router.navigateByUrl('/dashboard');
	}

	login() {
		this.auth.login(this.credentials).subscribe(
			() => {
				this.router.navigateByUrl('/dashboard');
			},
			err => {
				this.message = err.error.error;
				console.error(err);
			}
		);
	}
}
