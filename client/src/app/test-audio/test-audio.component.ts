import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import io from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';

interface AudioData {
	_id: string;
	createdAt: Date;
	originalname: string;
	owner: string;
	duration?: number;
}

@Component({
	selector: 'app-test-audio',
	templateUrl: './test-audio.component.html',
	styleUrls: ['./test-audio.component.scss']
})
export class TestAudioComponent implements OnInit {
	public audios: AudioData[];
	private socket;
	private url: string = 'localhost:3000';
	public connType: string = 'none';
	public audioTag: HTMLAudioElement = new Audio();
	public currentPlayingId: string;
	private room: string;

	constructor(
		public auth: AuthenticationService,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.room = this.route.snapshot.paramMap.get('id');
		this.getAudios();
		this.socket = io.connect(this.url);
		this.socket.emit('lobby', this.room);
	}

	getAudios() {
		this.auth.getAudios().subscribe(
			audios => {
				console.log(audios);
				this.audios = audios;
			},
			err => {
				console.log(err);
			}
		);
	}
	selectedChanged(value: string): void {
		this.connType = value;
		switch (value) {
			case 'none':
				console.log('Nepripojeny');
				if (this.socket.hasListeners('play')) {
					this.socket.removeListener('play');
				}
				if (this.socket.hasListeners('pause')) {
					this.socket.removeListener('pause');
				}
				break;

			case 'server':
				console.log('Im server');
				this.socket.on('play', data => {
					console.log('play: ', data);
					if (data.from === localStorage.getItem('_id')) {
						if (!(this.currentPlayingId === data.songid)) {
							this.currentPlayingId = data.songid;
							this.audioTag.src =
								this.auth.audioServiceUrl + '/audio/' + data.songid;
						}
						this.audioTag.play();
					}
				});
				this.socket.on('pause', data => {
					console.log('pause: ', data);
					if (data.from === localStorage.getItem('_id')) {
						this.audioTag.pause();
					}
				});
				break;

			case 'client':
				console.log('Im client');
				if (this.socket.hasListeners('play')) {
					this.socket.removeListener('play');
				}
				if (this.socket.hasListeners('pause')) {
					this.socket.removeListener('pause');
				}
				break;
		}
	}
	ngOnDestroy() {
		if (this.socket.hasListeners('play')) {
			this.socket.removeListener('play');
		}
		if (this.socket.hasListeners('pause')) {
			this.socket.removeListener('pause');
		}
		this.socket.disconnect();
		this.socket.close();
	}
	playSong(id: string): void {
		if (this.connType === 'none') {
			if (!(this.currentPlayingId === id))
				this.audioTag.src = this.auth.audioServiceUrl + '/audio/' + id;
			this.audioTag.play();
		} else {
			this.socket.emit('play', {
				room: this.room,
				songid: id
			});
		}
		if (!(this.currentPlayingId === id)) {
			this.currentPlayingId = id;
		}
	}
	pauseSong(id: number): void {
		if (this.connType === 'none') this.audioTag.pause();

		this.socket.emit('pause', { room: this.room });
	}
	formatSeconds(s: number): string {
		s = Math.floor(s);
		let secs = s % 60;
		let mins = (s - secs) / 60;

		return mins + ':' + (secs < 10 ? '0' + secs : secs);
	}
}
