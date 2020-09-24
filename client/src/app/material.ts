import { NgModule } from '@angular/core';
import {
	MatSidenavModule,
	MatButtonModule,
	MatMenuModule,
	MatIconModule,
	MatToolbarModule,
	MatInputModule,
	MatFormFieldModule,
	MatCardModule,
	MatListModule,
	MatOptionModule,
	MatSelectModule
} from '@angular/material';

@NgModule({
	exports: [
		MatSidenavModule,
		MatButtonModule,
		MatMenuModule,
		MatIconModule,
		MatToolbarModule,
		MatInputModule,
		MatFormFieldModule,
		MatButtonModule,
		MatCardModule,
		MatListModule,
		MatOptionModule,
		MatSelectModule
	]
})
export class MaterialModule {}
