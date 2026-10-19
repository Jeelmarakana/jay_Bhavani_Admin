import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InquiryService } from '../core/inquiry.service';
import { DashboardStats } from '../core/models';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="admin-page">
      <div class="page-heading"><div><span class="eyebrow">OVERVIEW</span><h1>Welcome back</h1><p>Here is what is happening with your client inquiries.</p></div><a class="button button-small" routerLink="/admin/inquiries">View inquiries →</a></div>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      @if (stats) {
        <div class="stats-grid">
          <article class="stat-card"><span>All inquiries</span><strong>{{ stats.total }}</strong><small>Received so far</small></article>
          <article class="stat-card accent"><span>New inquiries</span><strong>{{ stats.new }}</strong><small>Need your attention</small></article>
          <article class="stat-card"><span>Contacted</span><strong>{{ stats.contacted }}</strong><small>Follow-up in progress</small></article>
          <article class="stat-card"><span>Closed</span><strong>{{ stats.closed }}</strong><small>Completed conversations</small></article>
          <article class="stat-card"><span>Received today</span><strong>{{ stats.today }}</strong><small>Since midnight</small></article>
        </div>
      }
      <section class="card welcome-card"><div><span class="eyebrow">YOUR INBOX</span><h2>Every design starts with a conversation.</h2><p>Open an inquiry to see the client's contact details, requirements and uploaded reference image.</p></div><a routerLink="/admin/inquiries" class="text-link">Go to inquiries →</a></section>
    </section>
  `
})
export class AdminDashboardComponent {
  private readonly service = inject(InquiryService);
  stats: DashboardStats | null = null;
  error = '';
  constructor() {
    this.service.dashboard().subscribe({
      next: (stats) => this.stats = stats,
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Could not load dashboard. Check the API connection.'
    });
  }
}
