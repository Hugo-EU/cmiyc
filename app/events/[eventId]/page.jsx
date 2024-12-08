"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "../../components/Header";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/app/firebase/config";
import Footer from "@/app/components/Footer";
import AlertHelper from "@/app/helpers/alerts";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketsToBuy, setTicketsToBuy] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ ...eventSnap.data(), id: eventSnap.id });
        } else {
          router.push("/events");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleBuyTickets = async () => {
    if (!user) {
      AlertHelper.warning("Por favor, inicia sesión para comprar entradas.");
      router.push("/sign-in");
      return;
    }

    if (ticketsToBuy > event.ticketsAvailable || ticketsToBuy > 6) {
      AlertHelper.warning("No puedes comprar más de 6 entradas o exceder la cantidad disponible.");
      return;
    }

    try {
      const updatedTickets = event.ticketsAvailable - ticketsToBuy;
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { ticketsAvailable: updatedTickets });
      setEvent((prevEvent) => ({ ...prevEvent, ticketsAvailable: updatedTickets }));

      AlertHelper.success(`Has comprado ${ticketsToBuy} entrada(s) para ${event.name}.`);
    } catch (error) {
      console.error("Error al actualizar las entradas disponibles:", error);
    }
  };

  if (loading) return <p>Cargando...</p>;

  if (!event) return <p>Evento no encontrado</p>;

  const isPastEvent = new Date(event.date) < new Date();
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDAEKIx4fszCIXs2f9Xk-aetkTcbyMafko&q=${encodeURIComponent(
    event.location
  )}`;

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.name
  )}&dates=${new Date(event.date)
    .toISOString()
    .replace(/[-:.]/g, "")}/${new Date(event.date)
      .toISOString()
      .replace(/[-:.]/g, "")}Z&details=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location)}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 mt-20">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {event.imagePath && (
            <div className="flex justify-center mb-6">
              <img
                src={`/images/events/${event.imagePath}`}
                alt={event.name}
                className="max-w-full max-h-96 object-contain rounded-md shadow-md"
              />
            </div>
          )}

          <h1 className="text-5xl font-bold mb-4 text-center text-indigo-500">{event.name}</h1>
          <div className="text-center space-y-2">
            <p className="text-gray-400">Fecha: {new Date(event.date).toLocaleDateString()}</p>
            <p className="text-gray-400">Hora: {event.time}</p>
            <p className="text-gray-400">Ciudad: {event.city}</p>
            <p className="text-gray-400">Ubicación: {event.location}</p>
            <p className="text-gray-400">Precio: ${event.price}</p>
            <p className="text-gray-400">Entradas disponibles: {event.ticketsAvailable}</p>
            <p className="text-gray-300 mt-4">{event.description}</p>
          </div>

          {!isPastEvent ? (
            <div className="flex flex-col items-center space-y-4 mt-6">
              <p className="text-gray-300">Máximo 6 entradas</p>
              <input
                type="number"
                min="1"
                max={Math.min(6, event.ticketsAvailable)}
                value={ticketsToBuy}
                onChange={(e) => setTicketsToBuy(parseInt(e.target.value) || 1)}
                className="w-24 p-2 text-center rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleBuyTickets}
                className="bg-green-500 px-6 py-3 rounded-lg text-white text-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Comprar Entrada(s)
              </button>
            </div>
          ) : (
            <p className="text-red-500 text-center text-xl font-bold mt-6">
              Este evento ya ha pasado.
            </p>
          )}
        </div>

        {/*Map*/}
        <div className="mt-10">
          <div className="overflow-hidden rounded-lg shadow-md">
            <iframe
              title="Google Maps"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              src={googleMapsUrl}
              allowFullScreen
              className="rounded-md"
            ></iframe>
          </div>
        </div>

        {/* Add to Google Calendar */}
        <div className="mt-8 flex justify-center">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Añadir a Google Calendar
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
