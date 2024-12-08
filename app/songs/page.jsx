"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import AlbumCarousel from "../components/Carrousel";
import SearchResultsCarousel from "../components/SearchCarousel";
import Image from "next/image";
import "./styles.css";
import AlertHelper from "@/app/helpers/alerts";


const SongsPage = () => {
  const [artistInfo, setArtistInfo] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [singles, setSingles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancion, setCancion] = useState("");
  const [canciones, setCanciones] = useState([]);

  const recommendedArtists = [
    {
      name: "Mvrk",
      image: "/images/recomendado-mvrk.jpg",
      spotifyLink: "https://open.spotify.com/intl-es/artist/6WCTfR8dIuTqWrFrzt2yl0?si=Np6qB84YTWKCXK5bcOc51Q",
    },
    {
      name: "Duki",
      image: "/images/recomendado-duki.jpg",
      spotifyLink: "https://open.spotify.com/intl-es/artist/1bAftSH8umNcGZ0uyV7LMg?si=gJlCPg0_Snqyz2Tj-yiBog",
    },
    {
      name: "Sticky M.A.",
      image: "/images/recomendado-sticky.jpg",
      spotifyLink: "https://open.spotify.com/intl-es/artist/5o7fmoqHl79fzoCzeApdxm?si=3HiNjRiyTvW78vW8oi_wpQ",
    },
  ];

  const fetchArtistAndAlbums = async (artistId) => {
    const artistUrl = `https://spotify23.p.rapidapi.com/artists/?ids=${artistId}`;
    const albumsUrl = `https://spotify23.p.rapidapi.com/artist_albums/?id=${artistId}&offset=0&limit=50`;
    const singlesUrl = `https://spotify23.p.rapidapi.com/artist_singles/?id=${artistId}&offset=0&limit=20`;

    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "074cb6a542msh3755fc4490c4e80p1a4bf8jsn478551785646",
        "x-rapidapi-host": "spotify23.p.rapidapi.com",
      },
    };

    try {
      const artistResponse = await fetch(artistUrl, options);
      const artistData = await artistResponse.json();
      const artist = artistData.artists?.[0];
      setArtistInfo({
        name: artist?.name || "Desconocido",
        followers: artist?.followers?.total.toLocaleString() || "N/A",
        genres: artist?.genres?.join(", ") || "Sin géneros",
        popularity: artist?.popularity || "N/A",
        image: artist?.images?.[0]?.url || "",
      });

      const albumsResponse = await fetch(albumsUrl, options);
      const albumsData = await albumsResponse.json();
      const albums = albumsData.data?.artist?.discography?.albums?.items || [];
      const albumDetailsPromises = albums.map((album) => {
        const albumId = album.releases?.items?.[0]?.id;
        if (albumId) {
          return fetch(
            `https://spotify23.p.rapidapi.com/albums/?ids=${albumId}`,
            options
          )
            .then((res) => res.json())
            .then((data) => {
              const albumDetail = data.albums?.[0];
              return {
                name: albumDetail.name,
                image: albumDetail.images[0]?.url,
                tracks: albumDetail.tracks.items.map((track) => ({
                  name: track.name,
                  previewUrl: track.preview_url,
                })),
              };
            })
            .catch((error) => {
              console.error(`Error fetching album ${albumId}:`, error);
              return null;
            });
        }
        return null;
      });

      const detailedAlbums = (await Promise.all(albumDetailsPromises)).filter(Boolean);
      setAlbums(detailedAlbums);

      const singlesResponse = await fetch(singlesUrl, options);
      const singlesData = await singlesResponse.json();
      const singlesItems =
        singlesData.data?.artist?.discography?.singles?.items || [];
      const latestSingles = singlesItems
        .slice(0, 4)
        .map((single) => {
          const release = single.releases?.items?.[0];
          return {
            name: release.name,
            image: release.coverArt?.sources?.[0]?.url,
            previewUrl: release.tracks?.items?.[0]?.preview_url || null,
            shareUrl: release.sharingInfo?.shareUrl || "#",
          };
        });
      setSingles(latestSingles);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (cancion.trim() === "") {
      AlertHelper.warning("Debes ingresar algo");
      return;
    }
    getSong(cancion);
    setCancion("");
  };

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "074cb6a542msh3755fc4490c4e80p1a4bf8jsn478551785646",
      "x-rapidapi-host": "spotify23.p.rapidapi.com",
    },
  };

  async function getSong(cancion) {
    try {
      const url = `https://spotify23.p.rapidapi.com/search/?q=${cancion}&type=multi&offset=0&limit=10&numberOfTopResults=5`;
      const response = await fetch(url, options);
      const data = await response.json();
      setCanciones(data.tracks.items || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchArtistAndAlbums("699OTQXzgjhIYAHMy9RyPD");
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <main className="parallax-container">
        {/* Banner */}
        {artistInfo && (
          <section id="inicio" className="artist-banner parallax">
            <Image
              src="/images/banner_songs.jpg"
              alt="Banner del Artista"
              layout="fill"
              objectFit="cover"
              priority={true}
              className="artist-banner-image"
            />
            <div className="artist-banner-overlay">
              <img
                src={artistInfo.image}
                alt="Artista"
                className="artist-profile-picture"
              />
              <div className="artist-info">
                <h1 className="artist-name">{artistInfo.name}</h1>
                <p className="artist-followers">
                  Seguidores: {artistInfo.followers}
                </p>
                <p className="artist-popularity">
                  Popularidad: {artistInfo.popularity}
                </p>
                <p className="artist-genres">{artistInfo.genres}</p>
              </div>
            </div>
          </section>
        )}

        {/* Last singles */}
        <section className="singles-grid parallax">
          <div className="singles-title-overlay">
            <h2 className="singles-title">ÚLTIMOS SINGLES</h2>
          </div>
          {singles.map((single, index) => (
            <div
              key={index}
              className="single-card"
              style={{
                backgroundImage: `url(${single.image})`,
              }}
              onClick={() => window.open(single.shareUrl, "_blank")}
            >
              <div className="single-overlay">
                <h3 className="single-title">{single.name}</h3>
              </div>
            </div>
          ))}
        </section>

        {/* Albums */}
        <section className="albums parallax">
          <AlbumCarousel albums={albums} />
        </section>

        {/* Search bar */}
        <section className="search-parallax parallax">
          <h2 className="search-title">Busca otros artistas o canciones:</h2>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Busca una canción o artista..."
              value={cancion}
              onChange={(e) => setCancion(e.target.value)}
              className="border rounded-md p-2"
            />
            <button type="submit" className="search-btn">
              Buscar
            </button>
          </form>

          {canciones.length > 0 && <SearchResultsCarousel results={canciones} />}

          {/* Reccomended artists*/}
          <div className="recommended-artists">
            <h3 className="recommended-artist-title white">Artistas Recomendados:</h3>
            <div className="recommended-artists-container">
              {recommendedArtists.map((artist, index) => (
                <div key={index} className="recommended-artist">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="recommended-artist-image"
                  />
                  <p>{artist.name}</p>
                  <a
                    href={artist.spotifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recommended-artist-link"
                  >
                    Ver en Spotify
                  </a>
                </div>
              ))}
            </div>
          </div>
          {/* Back to top */}
          <div className="back-to-top-container">
            <a href="#inicio" className="back-to-top-btn">
              ⬆
            </a>
          </div>

        </section>

      </main>
    </>
  );
};

export default SongsPage;
