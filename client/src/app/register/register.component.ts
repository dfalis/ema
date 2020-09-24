  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { AuthenticationService, RegisterCredentials } from '../authentication.service';

  @Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
  })
  export class RegisterComponent implements OnInit {

    credentials: RegisterCredentials = {
      name: '',
      email: '',
      password: ''
    };
    
    message: String;

    constructor(private auth: AuthenticationService, private router: Router) { }

    ngOnInit() {
      if (this.auth.isLoggedIn() == true) this.router.navigateByUrl('/dashboard');
    }

    register() {
      this.auth.register(this.credentials).subscribe(
        result => {
          console.log(result);
          this.router.navigateByUrl('/dashboard');
        },
        err => {
          this.message = err.error.message;
          console.error(err);
        }
      );
    }

  }
