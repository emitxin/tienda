const products = [
    { id: 1, name: "No Pasarán", price: 30000, image: "img/remera-16.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    {
        id: 2,
        name: "Siembra mundos",
        price: 30000,
        image: "img/remera-14.webp",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "Negro", image: "img/remera-14.webp" },
            { name: "Violeta", image: "img/remera-14-violeta.webp" }
        ]
    },
    { id: 3, name: "Palestina libre", price: 30000, image: "img/remera-15.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 4, name: "Conspirar", price: 30000, image: "img/remera-13.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 5, name: "Las Malvinas son argentinas", price: 30000, image: "img/remera-01.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 6, name: "Abya Yala, ¡carajo!", price: 30000, image: "img/remera-02.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 7, name: "La libertad", price: 30000, image: "img/remera-03.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 8, name: "No somos territorio de sacrificio", price: 30000, image: "img/remera-04.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 9, name: "Cómplices", price: 30000, image: "img/remera-05.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 10, name: "Ni una menos", price: 30000, image: "img/remera-06.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 11, name: "Nunca más", price: 30000, image: "img/remera-07.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 12, name: "Seremos tumba del fascismo", price: 30000, image: "img/remera-08.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 13, name: "Pumitas", price: 30000, image: "img/remera-09.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 14, name: "Me cuidan mis amigues 10", price: 30000, image: "img/remera-10.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 15, name: "Niñes y Kuffiyeh", price: 30000, image: "img/remera-11.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 16, name: "Pachamama, no los perdones", price: 30000, image: "img/remera-12.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 17, name: "Revolución española", price: 30000, image: "img/remera-17.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 18, name: "Ruditx", price: 30000, image: "img/remera-18.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 19, name: "Cocineras", price: 30000, image: "img/remera-19.webp", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 20, name: "La esperanza", price: 30000, image: "img/remera-20.webp", sizes: ["S", "M", "L", "XL", "XXL"] }
];

// Estado del carrito
let cart = [];

// Pedido a registrar en Google Sheets pendiente de confirmar (al volver de WhatsApp)
let pendingOrder = null;
let orderSentToSheet = false;

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
            <img id="product-image-${product.id}" src="${product.image}" alt="${product.name}">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toLocaleString()}</p>
            
            <div class="product-options">
                <div class="option-row">
                    <div class="option-group">
                        <label for="size-${product.id}">Talle:</label>
                        <select id="size-${product.id}">
                            ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                        </select>
                    </div>

                    ${product.colors ? `
                    <div class="option-group">
                        <label for="color-${product.id}">Color:</label>
                        <select id="color-${product.id}" onchange="updateProductColor(${product.id})">
                            ${product.colors.map(color => `<option value="${color.name}">${color.name}</option>`).join('')}
                        </select>
                    </div>` : ''}

                    <div class="option-group">
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

function updateProductColor(productId) {
    const product = products.find(p => p.id === productId);
    const color = document.getElementById(`color-${productId}`).value;
    const variant = product.colors.find(item => item.name === color);
    document.getElementById(`product-image-${productId}`).src = variant.image;
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const size = document.getElementById(`size-${productId}`).value;
    const color = product.colors ? document.getElementById(`color-${productId}`).value : null;
    const qtyToAdd = localQty[productId] || 1;

    const existingItem = cart.find(item =>
        item.id === productId && item.size === size && item.color === color
    );

    if (existingItem) {
        existingItem.quantity += qtyToAdd;
    } else {
        cart.push({
            ...product,
            size,
            color,
            image: product.colors ? product.colors.find(item => item.name === color).image : product.image,
            quantity: qtyToAdd
        });
    }

    // Reset local qty
    localQty[productId] = 1;
    renderProducts();

    updateCart();
    // El carrito NO se abre: la persona sigue navegando

    // Micro-feedback visual en el ícono del carrito
    const cartIcon = document.getElementById('open-cart');
    cartIcon.classList.remove('cart-pop');
    void cartIcon.offsetWidth;
    cartIcon.classList.add('cart-pop');
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
                    <h4>${item.name} <span class="cart-item-size">(${item.size}${item.color ? ` - ${item.color}` : ''})</span></h4>
                    <div class="cart-item-controls">
                        <div class="qty-controls">
                            <button type="button" onclick="adjustCartQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" onclick="adjustCartQty(${index}, 1)">+</button>
                        </div>
                        <span class="cart-item-total">$${(item.price * item.quantity).toLocaleString()}</span>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">Eliminar</button>
                    </div>
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

// Al volver de WhatsApp (la persona mandó/envió el mensaje), se registra el pedido
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && pendingOrder && !orderSentToSheet) {
        orderSentToSheet = true;
        sendOrderToSheet(pendingOrder);
        pendingOrder = null;
        cart = [];
        updateCart();
        toggleCart(false);
    }
});

// ===================================================================
// INTEGRACIÓN GOOGLE SHEETS (registro de pedidos)
// ===================================================================
const googleSheetConfig = {
    url: "https://script.google.com/macros/s/AKfycbxZUg4v45Lm2q11h53IO41WB5GtGwBtaqymW_TdC8zRCKUJfeKTDUrQCs9asUdxeXFu/exec",
    secreto: "tienda-emitxin-2024",
};

// Envía el pedido a Google Sheets (registrar + descontar stock)
async function sendOrderToSheet(order) {
    try {
        await fetch(googleSheetConfig.url, {
            method: "POST",
            body: JSON.stringify({
                secreto: googleSheetConfig.secreto,
                nombre: order.nombre,
                telefono: order.telefono,
                email: order.email,
                envio: order.envio,
                total: order.total,
                pedido: order.pedido,
            }),
        });
    } catch (err) {
        console.error("Error guardando el pedido en Google Sheets:", err);
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

    const envioTxt = mode === "moto"
        ? `Moto Córdoba: ${address} (a pagar por el comprador)`
        : `Sucursal Correo Argentino ($${shippingCost.toLocaleString()}): ${sucursalProv} - ${sucursalNombre}`;

    // NO se registra todavía: se guarda como pendiente hasta volver de WhatsApp
    pendingOrder = {
        nombre: name,
        telefono: phone,
        email: email,
        envio: envioTxt,
        total: total,
        pedido: cart.map(item => ({
            nombre: item.name,
            talle: item.size,
            color: item.color,
            cantidad: item.quantity,
            subtotal: item.price * item.quantity,
        })),
    };
    orderSentToSheet = false;

    let msg = "🛒 *Nuevo Pedido - Tienda Emitxin*\n\n";

    msg += "--- PRODUCTOS ---\n";
    cart.forEach(item => {
        msg += `• ${item.name}\n`;
        msg += `  Talle: ${item.size}${item.color ? ` | Color: ${item.color}` : ''} | Cant: ${item.quantity}\n`;
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
    msg += "🏦 *Transferencia Bancaria*\n";
    msg += "Alias: PILAREM — Pilar Emilse Martin.\n";
    msg += "¡No te olvides de enviar el comprobante!";

    // Codificar el mensaje para URL
    const encodedMsg = encodeURIComponent(msg);

    // IMPORTANTE: Reemplaza "549XXXXXXXXX" con tu número de WhatsApp con código de país
    const phoneNumber = "5493515932336"; // Ejemplo: +54 9 11 5555 1234

    // Navegar a WhatsApp en la misma pestaña: al volver, se confirma el envío
    window.location.href = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
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

// Parallax del hero: el fondo se mueve a mitad de velocidad que el scroll
const heroImg = document.querySelector('.hero-parallax > img');

function updateParallax() {
    if (!heroImg) return;
    const speed = 0.5;
    const offset = window.scrollY * speed;
    heroImg.style.transform = `translateY(${offset}px)`;
    requestAnimationFrame(updateParallax);
}

if (heroImg) requestAnimationFrame(updateParallax);

// Tema claro / oscuro
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('tienda-theme', theme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('tienda-theme') || 'light');

// Inicializar
renderProducts();
updateCart();
populateProvincias();
