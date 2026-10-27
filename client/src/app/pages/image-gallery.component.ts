import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InquiryService } from '../core/inquiry.service';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="admin-page">
      <div class="page-heading">
        <div>
          <span class="eyebrow">IMAGE GALLERY</span>
          <h1>Client Uploaded Images</h1>
          <p>Browse reference designs submitted by customers.</p>
        </div>
      </div>

      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }

      <section class="card">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>INQUIRY / PRODUCT</th>
                <th>CLIENT</th>
                <th>RECEIVED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (item of galleryItems; track item._id) {
                <tr>
                  <td>
                    @if (item.imageUrl) {
                      <a [href]="item.imageUrl" target="_blank" rel="noopener">
                        <img [src]="item.imageUrl" alt="Client uploaded design" style="max-width:80px;max-height:80px;object-fit:cover;border-radius:4px;border:1px solid #ddd;">
                      </a>
                    } @else {
                      <span style="color:var(--muted);font-size:12px;">No image</span>
                    }
                  </td>
                  <td>
                    <strong>{{ item.productName || '—' }}</strong>
                  </td>
                  <td>{{ item.clientName || '—' }}</td>
                  <td>{{ item.createdAt | date:'short' }}</td>
                  <td>
                    <a class="text-link" [routerLink]="['/admin/inquiries', item._id]" style="margin-right:12px;">View Details →</a>
                    <button class="text-button danger-text small" (click)="delete(item._id)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      @if (galleryItems.length === 0 && !error) {
        <p class="empty-state">No uploaded images yet.</p>
      }
    </section>
  `
})
export class ImageGalleryComponent {
  private readonly service = inject(InquiryService);
  galleryItems: Array<{ _id: string; imageUrl: string; productName: string; clientName: string; createdAt: string }> = [];
  error = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list(1, '', '', '', '').subscribe({
      next: (page) => {
        this.galleryItems = page.items
          .filter((item: any) => item.hasReferenceImage || item.referenceImageName)
          .map((item: any) => ({
            _id: item._id,
            imageUrl: `http://localhost:3000/api/inquiries/admin/inquiries/${item._id}/image`,
            productName: item.productName,
            clientName: item.clientName,
            createdAt: item.createdAt
          }));
      },
      error: (error: Error) => this.error = error.message || 'Could not load images.'
    });
  }

  delete(id: string): void {
    if (!window.confirm('Delete this inquiry and its uploaded image? This cannot be undone.')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error = error.message || 'Could not delete inquiry.'
    });
  }
}