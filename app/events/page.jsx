"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "../components/Header";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './styles.css';
import AlertHelper from "@/app/helpers/alerts";


const EventsPage = () => {
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("user");
    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        time: "",
        city: "",
        location: "",
        price: "0",
        ticketsAvailable: "0",
        description: "",
        imagePath: "",
    });
    const [showNewEventForm, setShowNewEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCalendar, setShowCalendar] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role || "user");
                    }
                }

                const eventsCollection = collection(db, "events");
                const eventsSnapshot = await getDocs(eventsCollection);
                const eventsList = eventsSnapshot.docs.map((doc) => {
                    const eventData = doc.data();

                    const {
                        name = "Sin nombre",
                        date,
                        time = "Sin hora",
                        city = "Sin ciudad",
                        location = "Sin ubicación",
                        price = 0,
                        ticketsAvailable = 0,
                        description = "Sin descripción",
                        imagePath = null,
                    } = eventData;

                    let imageUrl = null;
                    if (imagePath) {
                        imageUrl = `/images/events/${imagePath}`;
                    }

                    return {
                        id: doc.id,
                        name,
                        date,
                        time,
                        city,
                        location,
                        price,
                        ticketsAvailable,
                        description,
                        imageUrl,
                    };
                });
                setEvents(eventsList);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    const handleAddEvent = async () => {
        if (
            !newEvent.name.trim() ||
            !newEvent.city.trim() ||
            !newEvent.location.trim() ||
            !newEvent.description.trim() ||
            !newEvent.date.trim()
        ) {
            AlertHelper.warning("Se requieren todos los campos");
            return;
        }

        try {
            const eventsCollection = collection(db, "events");
            const eventToAdd = {
                ...newEvent,
                price: parseFloat(newEvent.price) || 0,
                ticketsAvailable: parseInt(newEvent.ticketsAvailable) || 0,
            };
            await addDoc(eventsCollection, eventToAdd);
            setEvents((prevEvents) => [...prevEvents, { ...eventToAdd, id: Date.now().toString() }]);
            setNewEvent({
                name: "",
                date: "",
                time: "",
                city: "",
                location: "",
                price: "0",
                ticketsAvailable: "0",
                description: "",
                imagePath: "",
            });
            setShowNewEventForm(false);
        } catch (error) {
            console.error("Error adding event:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(db, "events", eventId));
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleEditEvent = async () => {
        if (!editingEvent) return;

        if (
            !editingEvent.name.trim() ||
            !editingEvent.city.trim() ||
            !editingEvent.location.trim() ||
            !editingEvent.description.trim() ||
            !editingEvent.date.trim()
        ) {
            AlertHelper.warning("Se requiren todos los campos");
            return;
        }

        try {
            await updateDoc(doc(db, "events", editingEvent.id), {
                ...editingEvent,
                price: parseFloat(editingEvent.price) || 0,
                ticketsAvailable: parseInt(editingEvent.ticketsAvailable) || 0,
            });
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === editingEvent.id ? { ...event, ...editingEvent } : event
                )
            );
            setEditingEvent(null);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredEvents = events.filter((event) => {
        const query = searchQuery.toLowerCase();
        return (
            event.name.toLowerCase().includes(query) ||
            event.city.toLowerCase().includes(query) ||
            new Date(event.date).toLocaleDateString().includes(query)
        );
    });

    const handleDayClick = (value) => {
        const event = events.find(
            (event) => new Date(event.date).toDateString() === value.toDateString()
        );
        if (event) {
            setSearchQuery(event.name);
        }
    };

    if (loading) return <p>Cargando...</p>;
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <div className="container mx-auto p-6 mt-20">
                <h1 className="text-4xl font-bold mb-8 text-center">Eventos del Yazwick</h1>

                <div className="flex justify-center mb-8">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad o fecha"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="p-2 rounded-md bg-gray-700 text-white w-full max-w-lg"
                    />
                </div>

                <div className="flex justify-center mb-4">
                    <button
                        onClick={() => setShowCalendar((prev) => !prev)}
                        className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                        {showCalendar ? "Ocultar Calendario" : "Mostrar Calendario"}
                    </button>
                </div>

                {showCalendar && (
                    <div className="flex justify-center mb-8">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={({ date }) => {
                                const matchingEvent = events.find((event) => {
                                    if (!event.date) return false;
                                    return (
                                        new Date(event.date).toDateString() ===
                                        date.toDateString()
                                    );
                                });
                                return matchingEvent ? (
                                    <div className="flex justify-center items-center h-full">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    </div>
                                ) : null;
                            }}
                            tileClassName={({ date }) => {
                                const matchingEvent = events.find((event) => {
                                    if (!event.date) return false;
                                    return (
                                        new Date(event.date).toDateString() ===
                                        date.toDateString()
                                    );
                                });
                                return matchingEvent ? "hover:bg-gray-700" : "";
                            }}
                            onClickDay={handleDayClick}
                            className="react-calendar-custom"
                        />
                    </div>
                )}

                {user && (userRole === "admin" || userRole === "editor") && (
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() => setShowNewEventForm(!showNewEventForm)}
                            className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600"
                        >
                            {showNewEventForm ? "Cancelar" : "Añadir Nuevo Evento"}
                        </button>
                    </div>
                )}

                {(showNewEventForm || editingEvent) && (
                    <div className="bg-gray-800 p-6 rounded-md shadow-md mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingEvent ? "Editar Evento" : "Añadir Evento"}
                        </h2>
                        <input
                            type="text"
                            placeholder="Nombre del evento"
                            value={editingEvent ? editingEvent.name : newEvent.name}
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          name: e.target.value,
                                      })
                                    : setNewEvent({ ...newEvent, name: e.target.value });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="date"
                            value={editingEvent ? editingEvent.date : newEvent.date}
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          date: e.target.value,
                                      })
                                    : setNewEvent({ ...newEvent, date: e.target.value });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Ciudad"
                            value={editingEvent ? editingEvent.city : newEvent.city}
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          city: e.target.value,
                                      })
                                    : setNewEvent({ ...newEvent, city: e.target.value });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Ubicación"
                            value={
                                editingEvent ? editingEvent.location : newEvent.location
                            }
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          location: e.target.value,
                                      })
                                    : setNewEvent({ ...newEvent, location: e.target.value });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <textarea
                            placeholder="Descripción"
                            value={
                                editingEvent
                                    ? editingEvent.description
                                    : newEvent.description
                            }
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          description: e.target.value,
                                      })
                                    : setNewEvent({
                                          ...newEvent,
                                          description: e.target.value,
                                      });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Ruta de la imagen"
                            value={
                                editingEvent ? editingEvent.imagePath : newEvent.imagePath
                            }
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          imagePath: e.target.value,
                                      })
                                    : setNewEvent({
                                          ...newEvent,
                                          imagePath: e.target.value,
                                      });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="number"
                            placeholder="Precio"
                            value={editingEvent ? editingEvent.price : newEvent.price}
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          price: e.target.value || "0",
                                      })
                                    : setNewEvent({
                                          ...newEvent,
                                          price: e.target.value || "0",
                                      });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="number"
                            placeholder="Entradas disponibles"
                            value={
                                editingEvent
                                    ? editingEvent.ticketsAvailable
                                    : newEvent.ticketsAvailable
                            }
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          ticketsAvailable: e.target.value || "0",
                                      })
                                    : setNewEvent({
                                          ...newEvent,
                                          ticketsAvailable: e.target.value || "0",
                                      });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <input
                            type="time"
                            placeholder="Hora"
                            value={editingEvent ? editingEvent.time : newEvent.time}
                            onChange={(e) => {
                                editingEvent
                                    ? setEditingEvent({
                                          ...editingEvent,
                                          time: e.target.value,
                                      })
                                    : setNewEvent({ ...newEvent, time: e.target.value });
                            }}
                            className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
                        />
                        <button
                            onClick={editingEvent ? handleEditEvent : handleAddEvent}
                            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            {editingEvent ? "Guardar Cambios" : "Guardar Evento"}
                        </button>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-4">Próximos Eventos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents
                            .filter((event) => {
                                if (!event.date) return false;
                                return new Date(event.date) >= new Date();
                            })
                            .map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-gray-800 p-6 rounded-md shadow-md cursor-pointer hover:bg-gray-700"
                                    onClick={() => router.push(`/events/${event.id}`)}
                                >
                                    {event.imageUrl && (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-full h-48 object-cover rounded-md mb-4"
                                        />
                                    )}
                                    <h3 className="text-xl font-bold mb-2">
                                        {event.name} -{" "}
                                        {new Date(event.date).toLocaleDateString()}
                                    </h3>
                                    <p className="text-gray-400 mb-2">
                                        Hora: {event.time}
                                    </p>
                                    <p className="text-gray-400 mb-2">
                                        Ubicación: {event.location}
                                    </p>
                                    <p className="text-gray-400 mb-2">
                                        Precio: ${event.price}
                                    </p>
                                    <p className="text-gray-400 mb-2">
                                        Entradas disponibles:{" "}
                                        {event.ticketsAvailable}
                                    </p>
                                    <p className="text-gray-300 mb-4">
                                        {event.description}
                                    </p>
                                    {user && userRole !== "user" && (
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingEvent(event);
                                                }}
                                                className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEvent(event.id);
                                                }}
                                                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-4">Eventos Pasados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents
                            .filter((event) => {
                                if (!event.date) return false;
                                return new Date(event.date) < new Date();
                            })
                            .map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-gray-800 p-6 rounded-md shadow-md cursor-pointer hover:bg-gray-700"
                                    onClick={() => router.push(`/events/${event.id}`)}
                                >
                                    {event.imageUrl && (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-full h-48 object-cover rounded-md mb-4"
                                        />
                                    )}
                                    <h3 className="text-xl font-bold mb-2">
                                        {event.name} -{" "}
                                        {new Date(event.date).toLocaleDateString()}
                                    </h3>
                                    <p className="text-gray-400 mb-2">
                                        Hora: {event.time}
                                    </p>
                                    <p className="text-gray-400 mb-2">
                                        Ubicación: {event.location}
                                    </p>
                                    <p className="text-gray-400 mb-2">
                                        Precio: ${event.price}
                                    </p>
                                    {user && userRole !== "user" && (
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingEvent(event);
                                                }}
                                                className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEvent(event.id);
                                                }}
                                                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;
