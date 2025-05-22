import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom arrow components
const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-pink-500 text-white p-2 rounded-full shadow-md hover:bg-pink-600 transition"
  >
    <ChevronLeft className="h-6 w-6" />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-pink-500 text-white p-2 rounded-full shadow-md hover:bg-pink-600 transition"
  >
    <ChevronRight className="h-6 w-6" />
  </button>
);

const HeroSection = ({ isVisible }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static list of makeup images from Unsplash
  useEffect(() => {
    const makeupImages = [
      {
        src: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        alt: 'Paleta de sombras de ojos coloridas'
      },
      {
        src: 'https://images.unsplash.com/photo-1522335786678-acb93a6a231d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        alt: 'Labiales de varios tonos'
      },
      {
        src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        alt: 'Cepillos de maquillaje'
      },
      {
        src: 'https://images.unsplash.com/photo-1512495039889-52a3b799c9b2?ixlib=rb-4.0.3&auto format&fit=crop&w=1350&q=80',
        alt: 'Productos de maquillaje organizados'
      },
      {
        src: 'https://images.unsplash.com/photo-1530023367846-d9a7a8c684aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        alt: 'Maquillaje con tonos vibrantes'
      }
    ];
    setImages(makeupImages);
    setLoading(false);
  }, []);

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false, // Hide arrows on mobile for cleaner UI
          dots: true,
        },
      },
    ],
    appendDots: (dots) => (
      <div className="mt-4">
        <ul className="flex justify-center space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-pink-300 rounded-full hover:bg-pink-500 transition cursor-pointer" />
    ),
  };

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="relative bg-pink-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          {/* Slider Section */}
          <div className="w-full md:w-1/2 relative order-1 md:order-2">
            {loading ? (
              <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
            ) : (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Slider {...settings}>
                  {images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white p-3 sm:p-4 rounded shadow-md">
              <p className="text-base sm:text-lg font-bold text-pink-500">#Lo Nuevo</p>
            </div>
          </div>
          {/* Text Section */}
          <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Descubre Tu Estilo
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6">
              Encuentra las últimas tendencias en maquillaje para expresar tu belleza única.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;