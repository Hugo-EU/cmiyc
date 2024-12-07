"use client";
import { useState, useEffect } from "react";

const ProductModal = ({ type, product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    size: [],
  });

  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        image: product.image || "",
        size: product.size || [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSize = () => {
    if (newSize && !formData.size.includes(newSize)) {
      setFormData({ ...formData, size: [...formData.size, newSize] });
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    setFormData({
      ...formData,
      size: formData.size.filter((size) => size !== sizeToRemove),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduct = {
      id: product?.id || null,
      name: formData.name,
      price: formData.price,
      image: formData.image,
      description: formData.description,
      stock: formData.stock,
      size: formData.size,
    };
    onSubmit(updatedProduct);
  };

  return (
    <div className="modal-container">
      <div className="modal-header">
        <h2>{type === "add" ? "Añadir Producto" : "Editar Producto"}</h2>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-body">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción"
        ></textarea>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Precio"
        />
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
        />
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="URL de la Imagen"
        />

        <div className="sizes-section">
          <label>Tallas Disponibles:</label>
          <div className="sizes-list">
            {formData.size.map((size) => (
              <div key={size} className="size-item">
                {size}
                <button
                  type="button"
                  className="remove-size-btn"
                  onClick={() => handleRemoveSize(size)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="add-size">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Añadir nueva talla"
            />
            <button type="button" onClick={handleAddSize} className="add-size-btn">
              Añadir
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn save">
            {type === "add" ? "Guardar" : "Actualizar"}
          </button>
          <button onClick={onClose} type="button" className="btn cancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductModal;
