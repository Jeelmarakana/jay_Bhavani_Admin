import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, Inquiry, InquiryPage, InquiryStatus } from './models';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);

  submit(form: FormData): Observable<{ message: string; id: string; whatsappUrl?: string; whatsappSent?: boolean }> {
    return this.http.post<{ message: string; id: string; whatsappUrl?: string; whatsappSent?: boolean }>(`${API}/inquiries`, form);
  }

  getWhatsAppAlert(id: string): Observable<{ adminPhone: string; message: string; directUrl: string }> {
    return this.http.get<{ adminPhone: string; message: string; directUrl: string }>(`${API}/inquiries/admin/inquiries/${encodeURIComponent(id)}/whatsapp-alert`);
  }

  dashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API}/inquiries/admin/dashboard`);
  }

  list(page: number, search: string, status: string, from: string, to: string): Observable<InquiryPage> {
    let params = new HttpParams().set('page', page).set('limit', 20);
    if (search.trim()) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<InquiryPage>(`${API}/inquiries/admin/inquiries`, { params });
  }

  get(id: string): Observable<Inquiry> {
    return this.http.get<Inquiry>(`${API}/inquiries/admin/inquiries/${encodeURIComponent(id)}`);
  }

  image(id: string): Observable<Blob> {
    return this.http.get(`${API}/inquiries/admin/inquiries/${encodeURIComponent(id)}/image`, { responseType: 'blob' });
  }

  update(id: string, changes: { status?: InquiryStatus; adminNote?: string }): Observable<Inquiry> {
    return this.http.patch<Inquiry>(`${API}/inquiries/admin/inquiries/${encodeURIComponent(id)}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/inquiries/admin/inquiries/${encodeURIComponent(id)}`);
  }
}
