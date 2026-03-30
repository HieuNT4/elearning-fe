"use client"

import type {
  CheckoutPayload,
  CheckoutResponse,
  OrderStatusResponse,
} from "../types"

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? (data.error ?? "Request failed")
        : "Request failed"
    throw new Error(message)
  }
  return data as T
}

function submitSepayForm(checkoutURL: string, formFields: Record<string, string>) {
  const form = document.createElement("form")
  form.method = "POST"
  form.action = checkoutURL

  Object.entries(formFields).forEach(([name, value]) => {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

export const orderPaymentService = {
  createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    return fetch("/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<CheckoutResponse>(response))
  },

  getOrderStatus(code: string): Promise<OrderStatusResponse> {
    return fetch(`/api/orders/${encodeURIComponent(code)}/status`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<OrderStatusResponse>(response))
  },

  submitSepayForm,
}
