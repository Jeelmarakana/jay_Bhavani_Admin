export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Inquiry {
  _id: string;
  clientName: string;
  phone: string;
  email: string;
  productName: string;
  message: string;
  status: InquiryStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  hasReferenceImage?: boolean;
}

export interface InquiryPage {
  items: Inquiry[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
  today: number;
}
