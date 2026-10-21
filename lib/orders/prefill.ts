"use client";

import { OrderCustomer, OrderItem, OrderSource } from "@/lib/orders/types";

/**
 * Lets other admin screens (Gelen Talepler, Teklifler, Ödemeler) open the order editor
 * pre-filled: they dispatch this event and the admin page switches to the Siparişler tab.
 */

export interface OrderPrefill {
  title?: string;
  customer?: Partial<OrderCustomer>;
  items?: Pick<OrderItem, "name" | "description" | "quantity" | "unitPrice">[];
  vatRate?: number;
  note?: string;
  source?: OrderSource;
  clientId?: string;
  crmPaymentId?: string;
}

export const NEW_ORDER_EVENT = "dv:new-order";

export function requestNewOrder(prefill: OrderPrefill) {
  window.dispatchEvent(new CustomEvent<OrderPrefill>(NEW_ORDER_EVENT, { detail: prefill }));
}
