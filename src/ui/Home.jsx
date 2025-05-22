import React, { useState, useEffect } from 'react';
import HeroSection from '../components/Home/HeroSection';
import Categories from '../components/Home/Categories';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import Footer from '../components/Home/Footer';

const Landing = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    categories: false,
    products: false,
    testimonials: false,
    newsletter: false,
  });

  useEffect(() => {
    // Trigger animations sequentially
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 300);
    setTimeout(() => setIsVisible((prev) => ({ ...prev, categories: true })), 800);
    setTimeout(() => setIsVisible((prev) => ({ ...prev, products: true })), 1300);
    setTimeout(() => setIsVisible((prev) => ({ ...prev, testimonials: true })), 1800);
    setTimeout(() => setIsVisible((prev) => ({ ...prev, newsletter: true })), 2300);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection isVisible={isVisible.hero} />
        <Categories isVisible={isVisible.categories} />
        <FeaturedProducts isVisible={isVisible.products} />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;