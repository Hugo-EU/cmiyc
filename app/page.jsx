"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getProducts } from "@/app/helpers/products";
import Cookies from "js-cookie";
import AlertHelper from "@/app/helpers/alerts";
import { useSearchParams, useRouter } from "next/navigation";

const sections = [
  // Tu definición de secciones permanece igual
];

function HomeContent() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [products, setProducts] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const cookieWarning = searchParams.get("cookieWarning");
    if (cookieWarning === "true") {
      AlertHelper.error("Debes aceptar las cookies para navegar a otras páginas.");
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleNavigation = (path) => {
    if (!Cookies.get("cookieConsent")) {
      router.push(`${path}?cookieWarning=true`);
      return;
    }
    router.push(path);
  };

  const handleClick = (section) => {
    setSelectedSection(section);
  };

  const handleClose = () => {
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center bg-fixed">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/banner1.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="relative z-10 bg-black bg-opacity-20 p-8 rounded-lg">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100">
            Bienvenido a CMIYC
          </h1>
          <p className="text-lg text-gray-300 mt-4">Página oficial de Yazwick</p>
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-16 bg-gray-800 relative flex flex-col items-center"
        style={{
          backgroundImage: "url('/images/banner-carti.jpg')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
        }}
      >
        <div className="container max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-8">Sobre Yazwick</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-gray-700 bg-opacity-25 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleClick(section)}
              >
                <h3 className="text-2xl font-bold text-center">{section.title}</h3>
              </div>
            ))}
          </div>

          {selectedSection && (
            <div
              id="selected-popup"
              className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            >
              <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg max-w-3xl text-center relative">
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
                <h3 className="text-3xl font-bold mb-4">{selectedSection.title}</h3>
                <div
                  className="text-lg text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: selectedSection.content.replace(
                      /<a /g,
                      '<a style="color: #1e90ff; text-decoration: underline;" '
                    ),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Store Carousel */}
        <div className="mt-16 w-full max-w-5xl overflow-hidden">
          <motion.div
            className="flex space-x-4 pb-4 justify-center"
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
              repeatType: "loop",
            }}
            style={{ width: "200%" }}
          >
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-gray-900 bg-opacity-20 p-4 rounded-lg shadow-md min-w-[250px] cursor-pointer flex-shrink-0"
                onClick={() => handleNavigation(`/store`)}
              >
                <Image
                  src={product.image || "/images/default-product.jpg"}
                  alt={product.name}
                  width={250}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Music Banner Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-fixed"
        style={{
          backgroundImage: "url('/images/banner-music.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="relative z-10 bg-black bg-opacity-20 p-8 rounded-lg cursor-pointer"
          onClick={() => handleNavigation("/songs")}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100">
            Descubre su Música
          </h1>
        </div>
      </section>

      {/* Events Banner Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-fixed"
        style={{
          backgroundImage: "url('/images/banner-events.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="relative z-10 bg-black bg-opacity-20 p-8 rounded-lg cursor-pointer"
          onClick={() => handleNavigation("/events")}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100">
            Yazwick en Directo
          </h1>
        </div>
      </section>

      {/* Back to Top Button */}
      <div className="fixed bottom-10 right-10">
        <a
          href="#"
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all"
          title="Volver al inicio"
        >
          ⬆
        </a>
      </div>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
