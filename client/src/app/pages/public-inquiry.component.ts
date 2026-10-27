import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InquiryService } from '../core/inquiry.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="hero">
      <p class="eyebrow">PERSONALIZED JEWELLERY, MADE FOR YOU</p>
      <h1>Find the piece<br><em>that feels like yours.</em></h1>
      <p class="hero-copy">Share the jewellery you love or your custom design idea. Our team will get back to you personally.</p>
    </section>
    <section class="form-card">
      <div class="section-heading"><span class="eyebrow">LET'S BEGIN</span><h2>Send a product inquiry</h2><p>Tell us what you are looking for. A design reference photo is optional.</p></div>
      @if (success) {
        <div class="notice success" role="status">
          <strong>તમારી ઇન્કવાયરી સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!</strong><br>
          Your inquiry has been recorded in our Admin Panel.
          @if (whatsappSent) {
            <p style="margin: 8px 0 0 0; color: #2e7d32; font-weight: 500;">✓ Owner has been notified via WhatsApp notification!</p>
          }
        </div>
        @if (whatsappUrl) {
          <div style="margin: 16px 0; padding: 16px; background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #1b5e20; font-size: 14px; font-weight: 600;">
              💬 અમારો સીધો WhatsApp પર સંપર્ક કરવા નીચે ક્લિક કરો:
            </p>
            <a class="button button-whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">
              <span>📲</span> Open WhatsApp with Jay Bhavani
            </a>
          </div>
        }
        <div style="margin-top: 16px;">
          <button class="button button-outline" type="button" (click)="reset()">Send another inquiry</button>
        </div>
      } @else {
        @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field-grid">
            <label>Your name <span>*</span><input formControlName="clientName" autocomplete="name" placeholder="e.g. Aanya Patel"><small>{{ fieldError('clientName') }}</small></label>
            <label>Phone / WhatsApp <span>*</span><input formControlName="phone" type="tel" autocomplete="tel" placeholder="+91 98765 43210"><small>{{ fieldError('phone') }}</small></label>
          </div>
          <label>Email address <span class="optional">(optional)</span><input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com"><small>{{ fieldError('email') }}</small></label>
          <label>Product or jewellery you are interested in <span>*</span><input formControlName="productName" placeholder="e.g. Gold necklace, bridal set"><small>{{ fieldError('productName') }}</small></label>
          <label>Message / customization details <span>*</span><textarea formControlName="message" rows="4" placeholder="Tell us about the design, occasion, material, or size you have in mind..."></textarea><small>{{ fieldError('message') }}</small></label>
          <label class="upload-box">
            <span class="upload-icon">＋</span><span><strong>Attach a reference image</strong><small>Optional · JPG, PNG or WebP · up to 5 MB</small></span>
            <input #referenceInput type="file" accept="image/jpeg,image/png,image/webp" (change)="chooseImage($event)">
          </label>
          @if (previewUrl) {
            <div class="image-preview"><img [src]="previewUrl" alt="Selected design reference"><span>{{ imageName }}</span><button type="button" class="text-button" (click)="removeImage()">Remove</button></div>
          }
          <button class="button" type="submit" [disabled]="loading">{{ loading ? 'Sending...' : 'Send my inquiry' }} <span aria-hidden="true">→</span></button>
          <p class="privacy-note">Your details and image are shared securely with our team to respond to your inquiry.</p>
        </form>
      }
    </section>
  `
})
export class PublicInquiryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inquiries = inject(InquiryService);
  @ViewChild('referenceInput') private referenceInput?: ElementRef<HTMLInputElement>;
  readonly form = this.fb.nonNullable.group({
    clientName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],
    productName: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]]
  });
  loading = false;
  success = false;
  error = '';
  image: File | null = null;
  previewUrl = '';
  imageName = '';
  whatsappUrl = '';
  whatsappSent = false;

  fieldError(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!control.touched || !control.invalid) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    return 'Please shorten this value.';
  }

  chooseImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error = 'Choose a JPG, PNG, or WebP image smaller than 5 MB.';
      input.value = '';
      return;
    }
    this.removeImage();
    this.image = file;
    this.imageName = file.name;
    this.previewUrl = URL.createObjectURL(file);
    this.error = '';
  }

  removeImage(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = '';
    this.imageName = '';
    this.image = null;
    if (this.referenceInput) this.referenceInput.nativeElement.value = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => body.append(key, value));
    if (this.image) body.append('referenceImage', this.image);
    this.loading = true;
    this.error = '';
    this.inquiries.submit(body).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = true;
        this.whatsappUrl = res.whatsappUrl || '';
        this.whatsappSent = Boolean(res.whatsappSent);
        this.form.reset();
        this.removeImage();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = error.error?.message || 'We could not send your inquiry. Please try again.';
      }
    });
  }

  reset(): void {
    this.success = false;
    this.error = '';
    this.whatsappUrl = '';
    this.whatsappSent = false;
  }
}
