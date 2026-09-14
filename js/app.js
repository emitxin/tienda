const products = [
    {
        id: 1,
        name: "Remera Básica Algodón",
        price: 4500,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        colors: ["Negro", "Blanco", "Gris"],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Remera Oversized Street",
        price: 5800,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        colors: ["Verde Militar", "Beige", "Negro"],
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: 3,
        name: "Remera Polo Premium",
        price: 7200,
        image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        colors: ["Azul Marino", "Blanco", "Rojo"],
        sizes: ["M", "L", "XL"]
    },
    {
        id: 4,
        name: "Remera Deportiva Tech",
        price: 6500,
        image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        colors: ["Negro", "Azul Eléctrico", "Gris Claro"],
        sizes: ["S", "M", "L", "XL"]
    }
];

// Estado del carrito
let cart = [];

// ===================================================================
// INTEGRACIÓN API MiCorreo (Correo Argentino) - SUCURSALES REALES
// ===================================================================
// Base URL del ambiente. Binario: TEST = https://apitest.correoargentino.com.ar/micorreo/v1
//   PRODUCCIÓN = https://api.correoargentino.com.ar/micorreo/v1
const correoArgentino = {
    baseUrl: "https://apitest.correoargentino.com.ar/micorreo/v1",
    // Credenciales que se solicitan a Correo Argentino (usuario/password de token)
    userToken: "",   // ← COMPLETAR
    passwordToken: "", // ← COMPLETAR
    customerId: "",  // ← COMPLETAR (ej: "0090000025")
    // Proxy CORS (necesario para llamar la API desde el navegador).
    // Dejar vacío si se sirve desde un backend o si el navegador permite la llamada directa.
    // Proxies gratuitos de ejemplo: https://corsproxy.io/?  |  https://api.allorigins.win/raw?url=
    corsProxy: "https://corsproxy.io/?",
};

// Códigos oficiales de provincia (tabla API MiCorreo)
const provinciasAPI = [
    { code: "B", name: "Buenos Aires" },
    { code: "C", name: "CABA" },
    { code: "X", name: "Córdoba" },
    { code: "S", name: "Santa Fe" },
    { code: "M", name: "Mendoza" },
    { code: "T", name: "Tucumán" },
    { code: "E", name: "Entre Ríos" },
    { code: "A", name: "Salta" },
    { code: "W", name: "Corrientes" },
    { code: "N", name: "Misiones" },
    { code: "P", name: "Formosa" },
    { code: "H", name: "Chaco" },
    { code: "G", name: "Santiago del Estero" },
    { code: "K", name: "Catamarca" },
    { code: "J", name: "San Juan" },
    { code: "L", name: "La Pampa" },
    { code: "R", name: "Río Negro" },
    { code: "Q", name: "Neuquén" },
    { code: "U", name: "Chubut" },
    { code: "V", name: "Tierra del Fuego" },
    { code: "Z", name: "Santa Cruz" },
    { code: "D", name: "San Luis" },
    { code: "F", name: "La Rioja" },
    { code: "Y", name: "Jujuy" }
];

// Tarifas de envío configurables
const shippingConfig = {
    moto: 0,       // Envío moto Córdoba: lo paga el comprador al recibir (no se suma al pedido)
    sucursal: 8000 // Envío a sucursal de Correo Argentino (fijo)
};

// Elementos del DOM
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const sucursalProvincia = document.getElementById('sucursal-provincia');
const sucursalSelect = document.getElementById('sucursal-nombre');
const sucursalStatus = document.getElementById('sucursal-status');
const subtotalPriceEl = document.getElementById('subtotal-price');
const shippingCostLabel = document.getElementById('shipping-cost-label');

// Estado de cantidades locales por producto (para antes de agregar al carrito)
let localQty = {};

// Renderizar productos
function renderProducts() {
    productGrid.innerHTML = products.map(product => {
        if (!localQty[product.id]) localQty[product.id] = 1;
        return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toLocaleString()}</p>
            
            <div class="product-options">
                <div class="option-row">
                    <div class="option-group">
                        <label for="color-${product.id}">Color:</label>
                        <select id="color-${product.id}">
                            ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label for="size-${product.id}">Talle:</label>
                        <select id="size-${product.id}">
                            ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="option-row center-row">
                    <div class="option-group qty-selector">
                        <label>Cant:</label>
                        <div class="qty-controls">
                            <button type="button" onclick="adjustLocalQty(${product.id}, -1)">-</button>
                            <span id="qty-val-${product.id}">${localQty[product.id]}</span>
                            <button type="button" onclick="adjustLocalQty(${product.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="btn-add" onclick="addToCart(${product.id})">Agregar al Carrito</button>
        </div>
    `}).join('');
}

function adjustLocalQty(productId, change) {
    let current = localQty[productId] || 1;
    current += change;
    if (current < 1) current = 1;
    localQty[productId] = current;
    document.getElementById(`qty-val-${productId}`).textContent = current;
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const color = document.getElementById(`color-${productId}`).value;
    const size = document.getElementById(`size-${productId}`).value;
    const qtyToAdd = localQty[productId] || 1;

    const existingItem = cart.find(item =>
        item.id === productId && item.color === color && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += qtyToAdd;
    } else {
        cart.push({
            ...product,
            color,
            size,
            quantity: qtyToAdd
        });
    }

    // Reset local qty
    localQty[productId] = 1;
    renderProducts();

    updateCart();
    toggleCart(true); // Abrir carrito
}

// Actualizar carrito
function updateCart() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Renderizar items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#666; margin-top:2rem;">Tu carrito está vacío</p>';
        document.getElementById('shipping-section').style.display = 'none';
        document.getElementById('checkout-whatsapp').disabled = true;
        document.getElementById('checkout-whatsapp').classList.add('btn-disabled');
        document.getElementById('btn-helper').style.display = 'block';
    } else {
        document.getElementById('shipping-section').style.display = 'block';
        document.getElementById('checkout-whatsapp').disabled = false;
        document.getElementById('checkout-whatsapp').classList.remove('btn-disabled');
        document.getElementById('btn-helper').style.display = 'none';

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Talle: ${item.size} | Color: ${item.color}</p>
                    <p>$${item.price.toLocaleString()} c/u</p>
                    
                    <div class="cart-item-controls">
                        <div class="qty-controls">
                            <button type="button" onclick="adjustCartQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" onclick="adjustCartQty(${index}, 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">Eliminar</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // Calcular subtotal y total con envío
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalPriceEl.textContent = subtotal.toLocaleString();
    shippingCostLabel.textContent = "$" + getShippingCost().toLocaleString();
    totalPriceEl.textContent = (subtotal + getShippingCost()).toLocaleString();
}

function adjustCartQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    updateCart();
}

function getDeliveryMode() {
    const selected = document.querySelector('input[name="delivery-mode"]:checked');
    return selected ? selected.value : "moto";
}

// Devuelve el costo de envío según la opción elegida
function getShippingCost() {
    const mode = getDeliveryMode();
    return mode === "sucursal" ? shippingConfig.sucursal : shippingConfig.moto;
}

// Eliminar item
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Toggle Carrito
function toggleCart(show) {
    if (show) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    } else {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
}

// Generar mensaje de WhatsApp
function sendWhatsApp() {
    if (cart.length === 0) return;

    const name = document.getElementById('ship-name').value;
    const phone = document.getElementById('ship-phone').value;
    const email = document.getElementById('ship-email').value;
    const address = document.getElementById('ship-address').value;
    const sucursalNombre = document.getElementById('sucursal-nombre').value.trim();
    const sucursalProv = document.getElementById('sucursal-provincia').value;
    const notes = document.getElementById('ship-notes').value;

    const mode = getDeliveryMode();
    const shippingCost = getShippingCost();

    if (!name || !phone || !email) {
        alert("Por favor, completá tu nombre, teléfono y e-mail.");
        return;
    }

    if (mode === "moto" && !address) {
        alert("Completá la dirección de entrega en Córdoba.");
        return;
    }

    if (mode === "sucursal" && (!sucursalProv || !sucursalNombre)) {
        alert("Completá la provincia y el nombre de la sucursal.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    let msg = "🛒 *Nuevo Pedido - RemerasShop*\n\n";

    msg += "--- PRODUCTOS ---\n";
    cart.forEach(item => {
        msg += `• ${item.name}\n`;
        msg += `  Talle: ${item.size} | Color: ${item.color} | Cant: ${item.quantity}\n`;
        msg += `  Subtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });

    msg += `Subtotal: $${subtotal.toLocaleString()}\n`;
    msg += `Envío: $${shippingCost.toLocaleString()}\n`;
    msg += `💰 *TOTAL: $${total.toLocaleString()}*\n\n`;

    msg += "--- DATOS DE ENVÍO ---\n";
    msg += `👤 Nombre: ${name}\n`;
    msg += `📞 Tel: ${phone}\n`;
    msg += `📧 E-mail: ${email}\n`;
    if (mode === "moto") {
        msg += `🛵 *Envío moto (Córdoba):* ${address} (a pagar por el comprador)\n`;
    } else {
        msg += `🏢 *Sucursal de Correo Argentino:* ($${shippingCost.toLocaleString()})\n`;
        msg += `   - Provincia: ${sucursalProv}\n`;
        msg += `   - Sucursal: ${sucursalNombre}\n`;
    }
    if (notes) msg += `📝 Notas: ${notes}\n\n`;

    msg += "--- PAGO ---\n";
    msg += "Me van a compartir el Alias de la cuenta para la transferencia.";

    // Codificar el mensaje para URL
    const encodedMsg = encodeURIComponent(msg);

    // IMPORTANTE: Reemplaza "549XXXXXXXXX" con tu número de WhatsApp con código de país
    const phoneNumber = "5493515932336"; // Ejemplo: +54 9 11 5555 1234

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
}

// Event Listeners
document.getElementById('open-cart').addEventListener('click', () => toggleCart(true));
document.getElementById('close-cart').addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));
document.getElementById('checkout-whatsapp').addEventListener('click', sendWhatsApp);

// ===================================================================
// SUCURSALES DE CORREO ARGENTINO
// ===================================================================

// Rellena el selector de provincias (las 24 provincias)
function populateProvincias() {
    sucursalProvincia.innerHTML = '<option value="">Seleccioná Provincia</option>';
    provinciasAPI.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = p.name;
        sucursalProvincia.appendChild(opt);
    });
}

// El nombre de la sucursal lo escribe el cliente en el campo de texto
sucursalProvincia.addEventListener('change', () => {
    sucursalStatus.textContent = "";
});

// Toggle entre Envío moto Córdoba y Sucursal de Correo Argentino
function updateShipping() {
    const isSucursal = getDeliveryMode() === "sucursal";
    document.getElementById('delivery-sucursal').style.display = isSucursal ? 'block' : 'none';
    document.getElementById('delivery-moto').style.display = isSucursal ? 'none' : 'block';
    updateCart();
}

document.querySelectorAll('input[name="delivery-mode"]').forEach(radio => {
    radio.addEventListener('change', updateShipping);
});

// Inicializar
renderProducts();
updateCart();
populateProvincias();
