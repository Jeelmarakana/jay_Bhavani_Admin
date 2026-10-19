import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InquiryService } from '../core/inquiry.service';
import { InquiryPage } from '../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule],
  template: `
    <section class="admin-page">
      <div class="page-heading"><div><span class="eyebrow">CLIENT MESSAGES</span><h1>Product inquiries</h1><p>Review requests, contact clients and keep track of next steps.</p></div></div>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      <section class="card inbox-card">
        <div class="toolbar"><input class="search" [(ngModel)]="search" (ngModelChange)="load(1)" placeholder="Search name, phone or product..." aria-label="Search inquiries">
          <select [(ngModel)]="status" (ngModelChange)="load(1)" aria-label="Filter by status"><option value="">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
          <label class="date-filter">From<input type="date" [(ngModel)]="from" (ngModelChange)="load(1)"></label>
          <label class="date-filter">To<input type="date" [(ngModel)]="to" (ngModelChange)="load(1)"></label>
          @if (result) { <span class="result-count">{{ result.total }} inquiries</span> }
        </div>
        @if (!result) { <p class="empty-state">Loading inquiries...</p> }
        @else if (!result.items.length) { <div class="empty-state"><span class="empty-icon">✳</span><h2>No inquiries found</h2><p>Try a different search, or check back when a client gets in touch.</p></div> }
        @else {
          <div class="table-scroll"><table><thead><tr><th>CLIENT</th><th>PRODUCT / MESSAGE</th><th>RECEIVED</th><th>STATUS</th><th></th></tr></thead><tbody>
            @for (item of result.items; track item._id) {
              <tr><td><strong>{{ item.clientName }}</strong><small>{{ item.phone }}</small></td><td><strong>{{ item.productName }}</strong><small class="message-preview">{{ item.message }}</small></td><td>{{ item.createdAt | date:'mediumDate' }}<small>{{ item.createdAt | date:'shortTime' }}</small></td><td><span class="status" [class.status-new]="item.status === 'new'" [class.status-contacted]="item.status === 'contacted'" [class.status-closed]="item.status === 'closed'">{{ item.status }}</span></td><td><a class="text-link" [routerLink]="['/admin/inquiries', item._id]">Open →</a></td></tr>
            }
          </tbody></table></div>
          <div class="pagination"><button class="button button-outline button-small" [disabled]="result.page <= 1" (click)="load(result.page - 1)">← Previous</button><span>Page {{ result.page }} of {{ result.pages || 1 }}</span><button class="button button-outline button-small" [disabled]="result.page >= result.pages" (click)="load(result.page + 1)">Next →</button></div>
        }
      </section>
    </section>
  `
})
export class InquiryListComponent {
  private readonly service = inject(InquiryService);
  result: InquiryPage | null = null;
  search = '';
  status = '';
  from = '';
  to = '';
  error = '';
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() { this.load(1); }

  load(page: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.error = '';
      this.service.list(page, this.search, this.status, this.from, this.to).subscribe({
        next: (result) => this.result = result,
        error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Could not load inquiries.'
      });
    }, 180);
  }
}
