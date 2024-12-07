'use client';
import Header from '@/app/components/Header';
import CartComponent from '@/app/components/Cart';

const CartPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>
      <CartComponent />
    </div>
  );
};

export default CartPage;
