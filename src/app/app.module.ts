import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    RouterOutlet ,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    FormsModule ,
    MatSelectModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule
  ]
})
export class AppModule { }
