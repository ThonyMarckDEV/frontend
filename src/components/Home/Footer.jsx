import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-pink-500 mb-4">Elegancia</h3>
            <p className="text-gray-600 mb-4">Tu destino para moda y belleza con estilo y elegancia.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-pink-500 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-500 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-500 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Compras</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Ropa</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Maquillaje</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Accesorios</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Ofertas</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Cuenta</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Mi Cuenta</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Mis Pedidos</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Lista de Deseos</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Devoluciones</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Información</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Sobre Nosotros</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Contacto</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Política de Privacidad</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition">Términos y Condiciones</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>© 2025 Elegancia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;