"use client";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getCartItems,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
} from "@/app/helpers/cart";
import { useRouter } from "next/navigation";
import AlertHelper from "@/app/helpers/alerts";

const CartComponent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const fetchCart = async () => {
    if (!user) {
      AlertHelper.warning("Inicia sesión para ver el carrito.");
      router.push("/sign-in");
      return;
    }

    const items = await getCartItems(user.uid);
    setCartItems(items);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleQuantityChange = async (productId, size, newQuantity) => {
    const uniqueId = `${productId}-${size}`;
    if (newQuantity <= 0) {
      handleRemoveItem(productId, size);
      return;
    }

    try {
      await updateCartItemQuantity(user.uid, uniqueId, newQuantity);
      fetchCart(); 
    } catch (error) {
      AlertHelper.error("Error al actualizar la cantidad del producto.");
    }
  };

  const handleRemoveItem = async (productId, size) => {
    const uniqueId = `${productId}-${size}`;

    try {
      await removeItemFromCart(user.uid, uniqueId);
      fetchCart(); 
      AlertHelper.success("Producto eliminado.");
    } catch (error) {
      AlertHelper.error("Error al remover producto.");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      AlertHelper.warning("El carrito está vacío.");
      return;
    }

    try {
      localStorage.setItem("cartInvoice", JSON.stringify(cartItems));
      localStorage.setItem("cartTotal", total.toFixed(2));

      await clearCart(user.uid);

      router.push("/thank-you");
    } catch (error) {
      AlertHelper.error("Error en el proceso de pago.");
    }
  };






  return (
    <div>
      {cartItems.length === 0 ? (
        <>
          <p>El carrito está vacío.</p>
          <button
            onClick={() => router.push("/store")}
            className="btn btn-primary mt-4"
          >
            Vuelve a la tienda
          </button>
        </>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li
                key={`${item.id}-${item.size}`}
                className="flex justify-between items-center mb-4 bg-gray-900 p-4 rounded"
              >
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-400">
                    Precio: {Number(item.price).toFixed(2) || "0.00"}€
                  </p>
                  <p className="text-gray-400">Talla: {item.size}</p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.size, item.quantity - 1)
                      }
                      className="btn btn-sm btn-outline"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.size, item.quantity + 1)
                      }
                      className="btn btn-sm btn-outline"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, item.size)}
                  className="btn btn-error"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h2 className="text-2xl font-bold">Total: {total}€</h2>
            <button
              onClick={handleCheckout}
              className="btn btn-success mt-4"
            >
              Pagar
            </button>
            <button
              onClick={() => router.push("/store")}
              className="btn btn-primary mt-4 ml-5"
            >
              Vuelve a la tienda
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartComponent;
