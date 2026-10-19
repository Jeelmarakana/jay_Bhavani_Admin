import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './models';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API}/products`);
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${API}/products/${encodeURIComponent(id)}`);
  }

  create(form: FormData): Observable<Product> {
    return this.http.post<Product>(`${API}/products`, form);
  }

  update(id: string, form: FormData): Observable<Product> {
    return this.http.patch<Product>(`${API}/products/${encodeURIComponent(id)}`, form);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/products/${encodeURIComponent(id)}`);
  }
}