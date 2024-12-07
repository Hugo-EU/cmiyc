'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertHelper from "@/app/helpers/alerts";


const ThankYouPage = () => {
  const [invoice, setInvoice] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartInvoice")) || [];
    const total = parseFloat(localStorage.getItem("cartTotal") || "0.00").toFixed(2);

    if (items.length === 0) {
      AlertHelper.error("No hay datos disponibles para mostrar.");
      router.push("/store");
      return;
    }

    const generatedInvoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleString(),
      items,
      total,
    };

    setInvoice(generatedInvoice);

    setTimeout(() => {
      localStorage.removeItem("cartInvoice");
      localStorage.removeItem("cartTotal");
    }, 500);
  }, [router]);

  if (!invoice) {
    return <p className="text-white">Cargando factura...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">¡Gracias por tu compra!</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Factura #{invoice.id}</h2>
        <p className="mb-2">Fecha: {invoice.date}</p>
        <ul className="border-t border-gray-700 pt-4">
          {invoice.items.map((item, index) => (
            <li
              key={`${item.id}-${item.size}-${index}`}
              className="flex justify-between items-center mb-4"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-400">Talla: {item.size}</p>
                <p className="text-gray-400">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-gray-300 font-bold">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-bold text-right">Total: €{invoice.total}</h3>
      </div>
      <button
        onClick={() => router.push("/store")}
        className="mt-6 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
      >
        Volver a la tienda
      </button>
    </div>
  );
};

export default ThankYouPage;
