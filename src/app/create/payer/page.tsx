"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PayerPage() {
  return (
    <Suspense fallback={null}>
      <PayerContent />
    </Suspense>
  );
}

function PayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tx = searchParams.get("tx");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tx) {
      router.replace("/");
      return;
    }

    fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: tx }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de paiement");
        window.location.href = data.paymentUrl;
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [tx, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      {loading && !error && (
        <p className="text-sm text-muted">Redirection vers le paiement sécurisé...</p>
      )}

      {error && (
        <>
          <h1 className="mb-2 text-xl font-bold">Paiement indisponible</h1>
          <p className="mb-6 text-sm text-muted">
            {error}
            <br />
            <span className="text-xs">
              Vérifie que CINETPAY_API_KEY et CINETPAY_SITE_ID sont configurés
              dans .env.local.
            </span>
          </p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </Button>
        </>
      )}
    </main>
  );
}
