import React, { useState, useEffect } from "react";

const Carrousel = ({ albums }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevAlbum = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + albums.length) % albums.length);
  };

  const handleNextAlbum = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % albums.length);
  };

  const getAlbumClass = (index) => {
    if (index === currentIndex) return "album-card center";
    if (index === (currentIndex - 1 + albums.length) % albums.length) return "album-card left";
    if (index === (currentIndex + 1) % albums.length) return "album-card right";
    return "album-card hidden";
  };

  return (
    <div className="albums">
      <h2 className="albums-title">Álbumes</h2>
      <div className="carousel-container">
        <button className="carousel-button left" onClick={handlePrevAlbum}>
          {"<"}
        </button>
        <div className="carousel-track">
          {albums.map((album, index) => (
            <div
              key={index}
              className={getAlbumClass(index)}
              style={{ backgroundImage: `url(${album.image})` }}
            >
              <div className="album-info">
                <h3>{album.name}</h3>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-button right" onClick={handleNextAlbum}>
          {">"}
        </button>
        <div className="current-album-tracks">
        <h2>Canciones de {albums[currentIndex].name}</h2>
        <ul className="track-list">
          {albums[currentIndex].tracks.map((track, trackIndex) => (
            <li key={trackIndex} className="track-item">
              <span>{track.name}</span>
              {track.previewUrl && (
                <audio controls>
                  <source src={track.previewUrl} type="audio/mpeg" />
                </audio>
              )}
            </li>
          ))}
        </ul>
      </div>
      </div>

    </div>
  );
};

export default Carrousel;
