import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <span class="brand-mark">JB</span>
        <span>JAY BHAVANI</span>
      </div>
      <nav>
        @if (auth.isLoggedIn) {
          <a routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/inquiries" routerLinkActive="active">
            <span>Inquiries</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active">
            <span>Products</span>
          </a>
          <a routerLink="/admin/images" routerLinkActive="active">
            <span>Images</span>
          </a>
        }
      </nav>
      <div class="sidebar-footer">
        <button class="button button-outline w-full" (click)="logout()">Sign out</button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1>Admin Panel</h1>
        <button class="menu-button" (click)="toggleMenu()" *ngIf="!isMenuFixed">
          <span></span><span></span><span></span>
        </button>
      </header>

      <router-outlet></router-outlet>
    </main>
  `
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  isMenuFixed = false;

  toggleMenu(): void {
    this.isMenuFixed = !this.isMenuFixed;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}