import {Component, inject, output, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html'
})
export class SidenavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  navigated = output();

  isLoggedIn: Signal<boolean> = this.authService.isLoggedIn;

  onLogout(): void {
    this.authService.logout();
    this.onNavLinkClick();
    this.router.navigate(['/login']);
  }

  onNavLinkClick(): void {
    this.navigated.emit();
  }
}
