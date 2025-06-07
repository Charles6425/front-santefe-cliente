import { Component, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatToolbarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showLinks = true;
  isMobile = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 900;
    if (this.isMobile) {
      this.showLinks = false;
    } else {
      this.showLinks = true;
    }
  }

  ngOnInit() {
    this.onResize();
  }
}