import { Component, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InquiryService } from '../core/inquiry.service';
import { Inquiry, InquiryStatus } from '../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule],
  template: `
    <section class="admin-page">
      <a class="back-link" routerLink="/admin/inquiries">← All inquiries</a>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      @if (saved) { <div class="notice success" role="status">Inquiry updated successfully.</div> }
      @if (item) {
        <div class="page-heading detail-heading"><div><span class="eyebrow">INQUIRY DETAILS</span><h1>{{ item.clientName }}</h1><p>Received {{ item.createdAt | date:'longDate' }} at {{ item.createdAt | date:'shortTime' }}</p></div><span class="status" [class.status-new]="item.status === 'new'" [class.status-contacted]="item.status === 'contacted'" [class.status-closed]="item.status === 'closed'">{{ item.status }}</span></div>
        <div class="detail-grid">
          <section class="card detail-card"><span class="eyebrow">CLIENT MESSAGE</span><h2>{{ item.productName }}</h2><p class="client-message">{{ item.message }}</p>
            @if (item.hasReferenceImage) { @if (imageUrl) { <a [href]="imageUrl" target="_blank" rel="noopener"><img class="reference-image" [src]="imageUrl" alt="Client uploaded reference design"></a> } @else { <p>Loading reference image...</p> } }
          </section>
          <aside class="card detail-card"><span class="eyebrow">CONTACT DETAILS</span><div class="detail-line"><small>PHONE / WHATSAPP</small><a [href]="'tel:' + item.phone">{{ item.phone }}</a></div>
            @if (item.email) { <div class="detail-line"><small>EMAIL</small><a [href]="'mailto:' + item.email">{{ item.email }}</a></div> }
            <label>Inquiry status<select [(ngModel)]="status"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>
            <label>Private admin note<textarea [(ngModel)]="adminNote" rows="4" maxlength="2000" placeholder="Add a reminder for your team..."></textarea></label>
            <button class="button" type="button" [disabled]="saving" (click)="save()">{{ saving ? 'Saving...' : 'Save changes' }}</button>
            <a class="button button-outline whatsapp" [href]="whatsappLink" target="_blank" rel="noopener">Message on WhatsApp ↗</a>
            <button class="text-button danger-text" type="button" (click)="remove()">Delete inquiry</button>
          </aside>
        </div>
      } @else if (!error) { <p class="empty-state">Loading inquiry...</p> }
    </section>
  `
})
export class InquiryDetailComponent implements OnDestroy {
  private readonly service = inject(InquiryService);
  private readonly route = inject(ActivatedRoute);
  item: Inquiry | null = null;
  status: InquiryStatus = 'new';
  adminNote = '';
  imageUrl = '';
  error = '';
  saved = false;
  saving = false;
  private readonly id = this.route.snapshot.paramMap.get('id') || '';

  get whatsappLink(): string {
    return `https://wa.me/${(this.item?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${this.item?.clientName || ''}, regarding your ${this.item?.productName || ''} inquiry.`)}`;
  }

  constructor() {
    if (!this.id) { this.error = 'Inquiry ID is missing.'; return; }
    this.service.get(this.id).subscribe({
      next: (item) => {
        this.item = item; this.status = item.status; this.adminNote = item.adminNote || '';
        if (item.hasReferenceImage) this.service.image(this.id).subscribe({
          next: (blob) => this.imageUrl = URL.createObjectURL(blob),
          error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Could not load reference image.'
        });
      },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Could not load this inquiry.'
    });
  }

  save(): void {
    this.saving = true; this.error = ''; this.saved = false;
    this.service.update(this.id, { status: this.status, adminNote: this.adminNote }).subscribe({
      next: (item) => { this.item = item; this.saving = false; this.saved = true; },
      error: (error: HttpErrorResponse) => { this.saving = false; this.error = error.error?.message || 'Could not save changes.'; }
    });
  }

  remove(): void {
    if (!window.confirm('Delete this inquiry and its uploaded image? This cannot be undone.')) return;
    this.service.delete(this.id).subscribe({
      next: () => { window.location.assign('/admin/inquiries'); },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Could not delete inquiry.'
    });
  }

  ngOnDestroy(): void { if (this.imageUrl) URL.revokeObjectURL(this.imageUrl); }
}
