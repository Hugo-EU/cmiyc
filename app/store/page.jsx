"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/app/helpers/products';
import { addItemToCart } from '@/app/helpers/cart';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import './styles.css';
import AlertHelper from "@/app/helpers/alerts";


const Store = () => {
  const [products, setProducts] = useState([]);
  const [user] = useAuthState(auth);
  const [isEditor, setIsEditor] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(1000);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const router = useRouter();


  useEffect(() => {
    const fetchProductsAndRole = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setIsEditor(userDoc.exists() && (userDoc.data().role === 'editor' || userDoc.data().role === 'admin'));
        }
      } catch (error) {
        AlertHelper.error('Error al cargar usuario o productos.');
      }
    };

    fetchProductsAndRole();
  }, [user]);

  const handleAddToCart = async (product, size) => {
    if (!user) {
      AlertHelper.warning('Inicia sesión para ver los productos.');
      router.push('/sign-in');
      return;
    }

    if (!size) {
      AlertHelper.warning('Selecciona una talla antes de añadir al carrito.');
      return;
    }

    try {
      await addItemToCart(user.uid, { ...product, selectedSize: size });
      AlertHelper.success(`${product.name} añadido al carrito.`);
    } catch (error) {
      AlertHelper.error('Error al añadir al carrito.');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      setProducts(await getProducts());
      setModalType(null);
    } catch (error) {
      AlertHelper.error('Error al añadir producto.');
    }
  };


  const handleUpdateProduct = async (updatedProduct) => {
    try {
      if (!updatedProduct || !updatedProduct.id) {
        throw new Error('Error: revisa los campos');
      }

      await updateProduct(updatedProduct);

      if (!Array.isArray(products)) {
        throw new Error('No se ha actualizado correctamente (no es array).');
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      setModalType(null);
      AlertHelper.success('Producto actualizado');
    } catch (error) {
      AlertHelper.error('Error al actualizar');
    }
  };



  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(await getProducts());
    } catch (error) {
      AlertHelper.error('Error al eliminar producto.');
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      product.price <= priceRange &&
      (selectedType ? product.name.toLowerCase().includes(selectedType.toLowerCase()) : true) &&
      (selectedSize ? product.size?.includes(selectedSize) : true) &&
      (selectedColor ? (product.name.toLowerCase().includes(selectedColor.toLowerCase()) || product.description?.toLowerCase().includes(selectedColor.toLowerCase())) : true)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="store-container flex flex-col lg:flex-row">
        {/* Filters sidebar */}
        <div className="filters-container w-full lg:w-1/4 p-6 bg-gray-800 rounded mb-6 lg:mb-0">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mb-4 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <div className="flex flex-col gap-4">
            <div>
              <label>Rango de precio:</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full"
              />
              <p>Hasta €{priceRange}</p>
            </div>
            <div>
              <label>Tipo:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-700 text-white rounded"
              >
                <option value="">Todos</option>
                <option value="camiseta">Camiseta</option>
                <option value="pantalón">Pantalón</option>
                <option value="accesorio">Accesorio</option>
              </select>
            </div>
            <div>
              <label>Talla:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-gray-700 text-white rounded"
              >
                <option value="">Todas</option>
                <option value="S">XXS</option>
                <option value="S">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XL">XXL</option>

              </select>
            </div>
            <div>
              <label>Color:</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-gray-700 text-white rounded"
              >
                <option value="">Todos</option>
                <option value="rojo">Rojo</option>
                <option value="azul">Azul</option>
                <option value="verde">Verde</option>
                <option value="negro">Negro</option>
                <option value="blanco">Blanco</option>
                <option value="blanco">Beige</option>
                <option value="verde">Gris</option>


              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="products-container flex-1 p-6">
          <div className="store-title-container">
            <h1 className="text-3xl font-bold">Tienda</h1>
          </div>
          {isEditor && (
            <button
              onClick={() => {
                setSelectedProduct(null);
                setModalType('add');
              }}
              className="button mb-6"
            >
              Añadir producto
            </button>
          )}
          <div className="flex flex-wrap justify-around gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card flex flex-col items-center p-4">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
                <h2 className="text-lg font-bold mt-4">{product.name}</h2>
                <p className="text-center text-sm mt-2 mb-4">{product.description}</p>
                <p className="text-center font-semibold mb-4">€{product.price}</p>

                <select
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="bg-gray-800 text-white rounded mb-4"
                >
                  <option value="">Selecciona una talla</option>
                  {product.size?.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAddToCart(product, selectedSize)}
                  className="button mt-auto"
                >
                  Añadir al carrito
                </button>

                {isEditor && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setModalType('edit');
                      }}
                      className="admin-button edit"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="admin-button delete"
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

      {modalType && (
        <ProductModal
          type={modalType}
          product={selectedProduct}
          onClose={() => setModalType(null)}
          onSubmit={modalType === 'add' ? handleAddProduct : handleUpdateProduct}
        />
      )}

    </div>
  );

};

export default Store;
