import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	name: string;
	email: string;
	password: string;
}

export interface EmaEvent {
	_id: string;
	name: string;
	notes: any;
}

export class Note {
	typ: number;
	content: string;
}

@Injectable()
export class AuthenticationService {
	public readonly audioServiceUrl: string = 'http://localhost:3001';

	constructor(private http: HttpClient, private router: Router) {}

	login(credentials: LoginCredentials) {
		return this.http.post('/api/login', credentials).pipe(
			map((res: any) => {
				this.setUserDataToLocalStorage(res);
				console.log('logged in');
			})
		);
	}

	register(credentials: RegisterCredentials) {
		return this.http.post('/api/register', credentials).pipe(
			map((res: any) => {
				this.setUserDataToLocalStorage(res);
				console.log('registering');
			})
		);
	}

	isLoggedIn(): boolean {
		return localStorage.getItem('loggedin') == 'true' ? true : false;
	}

	logout(): void {
		localStorage.clear();
		this.http.post('/api/logout', 'logout').subscribe(() => {
			this.router.navigateByUrl('/');
			console.log('logging out');
		});
	}

	private setUserDataToLocalStorage(res: any): void {
		localStorage.setItem('loggedin', 'true');
		localStorage.setItem('name', res.name || 'Unknown');
		localStorage.setItem('_id', res._id || undefined);
	}

	public getListOfEvents(): Observable<any> {
		return this.http.get('/api/events');
	}

	addEvent(event: string) {
		return this.http.post<EmaEvent>('/api/event/create', { name: event });
	}

	getEvent(id: string): Observable<EmaEvent> {
		console.log('Getting event');
		return this.http.get<EmaEvent>('/api/event/' + id);
	}

	public saveEvent(event: EmaEvent): Observable<any> {
		console.log('Saving event');
		console.log(event);
		return this.http.post('/api/event/save', event);
	}

	public deleteEvent(id: string): Observable<any> {
		return this.http.delete('/api/event/' + id);
	}

	public editEvent(updatedName: Object): Observable<any> {
		return this.http.post('/api/event/save', updatedName);
	}

	getAudios(): Observable<any> {
		return this.http.get(this.audioServiceUrl + '/audios', {
			withCredentials: true
		});
	}
}
