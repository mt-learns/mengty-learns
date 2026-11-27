export interface OrderItem {
  sku: string;
  priceCents: number;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  totalCents: number;
}
