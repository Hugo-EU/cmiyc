"use client";

import { useState, useEffect } from "react";

const SearchResultsCarousel = ({ results }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 4;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + itemsPerPage, results.length - itemsPerPage)
    );
  };

  const currentItems = results.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="search-results-container">
      {currentIndex > 0 && (
        <button className="carousel-button left" onClick={handlePrev}>
          {"<"}
        </button>
      )}
      <div className="search-results-track">
        {currentItems.map((item, index) => (
          <div key={index} className="search-result-item">
            <img
              src={item.data.albumOfTrack.coverArt.sources[0].url}
              alt={item.data.name}
            />
            <h4>{item.data.name}</h4>
            <a href={item.data.uri} target="_blank" rel="noopener noreferrer">
              Escuchar
            </a>
          </div>
        ))}
      </div>
      {currentIndex + itemsPerPage < results.length && (
        <button className="carousel-button right" onClick={handleNext}>
          {">"}
        </button>
      )}
    </div>
  );
};

export default SearchResultsCarousel;
