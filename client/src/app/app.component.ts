import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/" aria-label="Jay Bhavani Ornaments home">
        <span class="brand-mark">JB</span>
        <span>JAY BHAVANI<small>ORNAMENTS</small></span>
      </a>
      <nav aria-label="Main navigation">
        @if (auth.isLoggedIn) {
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/admin/inquiries" routerLinkActive="active">Inquiries</a>
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/images" routerLinkActive="active">Images</a>
          <button class="nav-button" type="button" (click)="logout()">Sign out</button>
        } @else {
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Enquire</a>
          <a routerLink="/admin/login">Admin</a>
        }
      </nav>
    </header>
    <main><router-outlet /></main>
    <footer>Crafted with care · Jay Bhavani Ornaments</footer>
  `
})
export class AppComponent {
  readonly auth = inject(AuthService);
  logout(): void { this.auth.logout(); }
}