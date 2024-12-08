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
  {
    id: "informacion-personal",
    title: "Información Personal",
    content: `
      Yael Aquilino Días, más conocido como yazwick, es un artista emergente nacido en Madrid en el año 2003.
      Yael tiene ascendencia africana, exactamente de la República Democrática del Congo. Al igual que sus raíces, practica la religión católica cristiana.
      Su trayectoria académica es más que impecable. Graduado en Bachillerato de ciencias de la salud en el instituto IES 1º de Mayo.
      Años más tarde se graduaría en producción musical en la academia SAE de Madrid.
    `,
  },
  {
    id: "carrera-musical",
    title: "Carrera Musical",
    content: `
      El joven de 21 años, quien acaba de empezar en el mundo de la música, está causando sensación en el mundo de la música urbana.
      Hizo su debut en las plataformas digitales con el sencillo de trap <a href='https://open.spotify.com/intl-es/album/3y2FrY68gA1isCFdaZVUnJ?si=geS3vNGITku7vsh_llC54A' target='_blank'>"P Hardaway"</a> el día 6 de junio de 2024.
      Más adelante se atrevería con un pequeño EP en el que lanzaría dos singles: <a href='https://open.spotify.com/intl-es/album/3HBrazc2I4RSKurUVTI33c?si=voDw6gsKQYuO5uIksW7TJA' target='_blank'>"Fashionwick"</a> y <a href='https://open.spotify.com/intl-es/album/23rLl0U8M2fPQXUU6fLu0d?si=2YY-fsclSmuW8l8mz3UPfA' target='_blank'>"Rest in Peace"</a>.
    `,
  },
  {
    id: "influencias",
    title: "Influencias",
    content: `
      El estilo fresco y renovado que trae el madrileño es culpa de la mezcla de diversas influencias a lo largo de su vida. Sus influencias más "raperas" son artistas como: JPEGMafia, Playboi Carti, A$AP Rocky, Travis Scott, Esqui o 44, entre otros.
      Sin dejar atrás sus influencias culturales de parte de su familia de origen africano. El artista rescata su gran pasión por el Jazz que puede demostrar en las progresiones típicas de sus temas.
      Wick es un apasionado de la moda, prefiriendo marcas como Rick Owens, Margiela, OffWhite y Ecler.
    `,
  },
  {
    id: "tropiezos",
    title: "Tropiezos",
    content: `
      No todo ha sido camino de rosas en la vida de Yael. En su adolescencia pasó por un centro de menores debido a su acumulación de delitos leves, más tarde pasaría seis meses en la prisión de Alcalá Meco debido a escándalo público.
      Actualmente, tras varios juicios fue resuelto como inocente y quedó sin antecedentes penales.
    `,
  },
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
