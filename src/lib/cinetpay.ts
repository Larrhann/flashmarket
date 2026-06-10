// Intégration CinetPay (https://docs.cinetpay.com/)
// Nécessite CINETPAY_API_KEY et CINETPAY_SITE_ID dans .env.local

const CINETPAY_INIT_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

export interface InitPaymentParams {
  transactionId: string;
  amount: number;
  description: string;
  returnUrl: string;
  notifyUrl: string;
  customerName?: string;
  customerSurname?: string;
  customerPhone?: string;
}

export interface CinetPayInitResponse {
  code: string;
  message: string;
  data?: {
    payment_token: string;
    payment_url: string;
  };
}

export async function initCinetPayPayment(
  params: InitPaymentParams
): Promise<CinetPayInitResponse> {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;

  if (!apiKey || !siteId) {
    throw new Error(
      "CinetPay non configuré : ajoute CINETPAY_API_KEY et CINETPAY_SITE_ID dans .env.local"
    );
  }

  const res = await fetch(CINETPAY_INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: params.transactionId,
      amount: params.amount,
      currency: "XOF",
      description: params.description,
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
      channels: "ALL", // Mobile Money + Wave + carte
      customer_name: params.customerName ?? "Client",
      customer_surname: params.customerSurname ?? "FlashMarket",
      customer_phone_number: params.customerPhone,
    }),
  });

  return res.json();
}

export interface CinetPayCheckResponse {
  code: string;
  message: string;
  data?: {
    status: "ACCEPTED" | "REFUSED" | "PENDING" | "CANCELLED";
    amount: string;
    currency: string;
    operator_id?: string;
    payment_method?: string;
  };
}

export async function checkCinetPayTransaction(
  transactionId: string
): Promise<CinetPayCheckResponse> {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;

  if (!apiKey || !siteId) {
    throw new Error("CinetPay non configuré");
  }

  const res = await fetch(CINETPAY_CHECK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
    }),
  });

  return res.json();
}
