"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, addDoc, query, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import Header from "../components/Header";
import AlertHelper from "@/app/helpers/alerts";
import Footer from "@/app/components/Footer";
const ForumPage = () => {
  const [topics, setTopics] = useState([]);
  const [user] = useAuthState(auth);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    const fetchTopicsAndRole = async () => {
      try {
        if (user) {
          const userDoc = await getDocs(collection(db, "users"));
          const userData = userDoc.docs.find((doc) => doc.id === user.uid);
          const role = userData?.data()?.role || "user";
          setIsStaff(role === "admin" || role === "editor");
        }

        const topicsCollection = collection(db, "topics");
        const querySnapshot = await getDocs(query(topicsCollection));
        const fetchedTopics = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(fetchedTopics);
      } catch (error) {
        console.error("Error fetching topics or user role:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsAndRole();
  }, [user]);

  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      AlertHelper.warning("El nombre del tópico es obligatorio.");
      return;
    }

    try {
      const topicsCollection = collection(db, "topics");
      const newDoc = await addDoc(topicsCollection, {
        name: newTopicName,
        restricted: isRestricted,
        createdBy: user.uid,
      });

      setTopics((prevTopics) => [
        ...prevTopics,
        { id: newDoc.id, name: newTopicName, restricted: isRestricted, createdBy: user.uid },
      ]);

      setNewTopicName("");
      setIsRestricted(false);
      setShowNewTopicForm(false);
      AlertHelper.success("Tópico creado con éxito.");
    } catch (error) {
      console.error("Error creating new topic:", error.message);
      AlertHelper.error("Error al crear el tópico.");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!isStaff) return AlertHelper.warning("No tienes permiso para eliminar tópicos.");
    try {
      await deleteDoc(doc(db, "topics", topicId));
      setTopics((prevTopics) => prevTopics.filter((topic) => topic.id !== topicId));
      AlertHelper.success("Tópico eliminado con éxito.");
    } catch (error) {
      console.error("Error dleting topic:", error);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 mt-20 flex-grow">
        <h1 className="text-4xl font-extrabold mt-10 mb-10 text-center">Foro de Yazwick</h1>

        {isStaff && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowNewTopicForm(!showNewTopicForm)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              {showNewTopicForm ? "Cancelar" : "Crear Nuevo Tópico"}
            </button>
            {showNewTopicForm && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Nombre del tópico"
                  className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                  <input
                    type="checkbox"
                    checked={isRestricted}
                    onChange={(e) => setIsRestricted(e.target.checked)}
                  />
                  Acceso Restringido
                </label>
                <button
                  onClick={handleCreateNewTopic}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
                >
                  Crear Tópico
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="relative bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition group"
            >
              <Link href={`/forum/topic/${topic.id}`}>
                <h2 className="text-2xl flex justify-center font-semibold mb-2 group-hover:underline">
                  {topic.name}
                </h2>
              </Link>
              {isStaff && (
                <button
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default ForumPage;
