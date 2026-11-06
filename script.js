// 1. Predefined array containing product objects
const order = [
    { id: 1, name: "Wireless Headphones", price: 30.00, quantity: 1 },
    { id: 2, name: "USB-C Fast Charger", price: 5.00, quantity: 2 },
    { id: 3, name: "Mousepad", price: 12.00, quantity: 1 }
];

// 2. Select DOM elements
const productListContainer = document.getElementById("product-list");
const totalItemsEl = document.getElementById("total-items");
const subtotalEl = document.getElementById("subtotal");
const deliveryCostEl = document.getElementById("delivery-cost");
const grandTotalEl = document.getElementById("grand-total");

const checkoutForm = document.getElementById("checkout-form");
const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

// Payment method elements
const payButtons = document.querySelectorAll(".pay-btn");
const cardDetailsContainer = document.getElementById("card-details-container");
let selectedPaymentMethod = "cod"; // Default is Cash on Delivery

// Promo Code Elements
const promoInput = document.getElementById("promo-input");
const applyBtn = document.getElementById("apply-btn");
const promoMsg = document.getElementById("promo-msg");
const discountRow = document.getElementById("discount-row");
const discountAmountEl = document.getElementById("discount-amount");

let discountRate = 0; // Tracks discount (0 = no discount, 0.10 = 10% off)

// 3. Render Order Function
function renderOrderSummary() {
    let totalItems = 0;
    let subtotal = 0;

    // Clear existing content
    productListContainer.innerHTML = "";

    // Loop through products to generate HTML dynamically
    order.forEach((product) => {
        const itemTotal = product.price * product.quantity;
        subtotal += itemTotal;
        totalItems += product.quantity;

        // Create product HTML row
        const productElement = document.createElement("div");
        productElement.classList.add("product-item");

        const divInfo = document.createElement("div");
        divInfo.classList.add("product-info");

        const divTotal = document.createElement("div");
        divTotal.classList.add("product-total");

        const h4 = document.createElement("h4");
        h4.textContent = product.name;

        const p = document.createElement("p");
        p.textContent = `Qty: ${product.quantity} x $${product.price.toFixed(2)}`;

        divInfo.append(h4, p);
        divTotal.textContent = `$${itemTotal.toFixed(2)}`;
        productElement.append(divInfo, divTotal);
        productListContainer.appendChild(productElement);
    });

    // Calculate Discount
    const discountValue = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountValue;

    // Get selected delivery option cost
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const deliveryCost = selectedDelivery ? parseFloat(selectedDelivery.value) : 5.00;

    const grandTotal = discountedSubtotal + deliveryCost;

    // Update DOM with calculated values
    totalItemsEl.textContent = totalItems;
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    if (discountRate > 0) {
        if (discountRow) discountRow.style.display = "flex";
        if (discountAmountEl) discountAmountEl.textContent = `-$${discountValue.toFixed(2)}`;
    } else {
        if (discountRow) discountRow.style.display = "none";
    }

    if (deliveryCostEl) deliveryCostEl.textContent = `$${deliveryCost.toFixed(2)}`;
    grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;
}

// 4. Initialize rendering on page load
renderOrderSummary();

// --- EVENT LISTENERS ---

// Listen for changes on delivery options
deliveryRadios.forEach(radio => {
    radio.addEventListener("change", renderOrderSummary);
});

// Handle payment method 
payButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        payButtons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        selectedPaymentMethod = this.getAttribute("data-method");

        if (selectedPaymentMethod === "card") {
            cardDetailsContainer.style.display = "block";
        } else {
            cardDetailsContainer.style.display = "none";
            clearError("card-number");
            clearError("card-expiry");
            clearError("card-cvv");
        }
    });
});

// Handle Promo Code Apply Button
applyBtn.addEventListener("click", function () {
    const promoCode = promoInput.value.trim().toUpperCase();

    if (promoCode === "") {
        promoMsg.textContent = "Please enter a promo code.";
        promoMsg.style.color = "red";
        discountRate = 0;
        if (discountRow) discountRow.style.display = "none";
    } else if (promoCode === "SAVE10") {
        promoMsg.textContent = "Success! 10% discount applied.";
        promoMsg.style.color = "green";
        discountRate = 0.10; // 10% discount
    } else {
        promoMsg.textContent = "Invalid promo code.";
        promoMsg.style.color = "red";
        discountRate = 0;
        if (discountRow) discountRow.style.display = "none";
    }

    renderOrderSummary();
});

// Listen for the form submission
checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the values typed into the inputs
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    // Track if everything is valid
    let isValid = true;

    // Check Name
    if (name === "") {
        setError("name", "Please enter your full name.");
        isValid = false;
    } else {
        clearError("name");
    }

    // Check Email
    if (email === "") {
        setError("email", "Email address is required.");
        isValid = false;
    } else if (!email.includes("@") || !email.includes(".")) {
        setError("email", "Please enter a valid email address.");
        isValid = false;
    } else {
        clearError("email");
    }

    // Check Phone
    if (phone === "") {
        setError("phone", "Phone number is required.");
        isValid = false;
    } else if (!/^\d+$/.test(phone)) {
        setError("phone", "Phone number must contain digits only.");
        isValid = false;
    } else if (phone.length !== 8) {
        setError("phone", "Phone number must be exactly 8 digits.");
        isValid = false;
    } else {
        clearError("phone");
    }

    // Check Address
    if (address === "") {
        setError("address", "Delivery address is required.");
        isValid = false;
    } else {
        clearError("address");
    }

    // --- Check Payment Method Details (if Card is selected) ---
    if (selectedPaymentMethod === "card") {
        const cardNumber = document.getElementById("card-number").value.trim();
        const cardExpiry = document.getElementById("card-expiry").value.trim();
        const cardCvv = document.getElementById("card-cvv").value.trim();

        if (cardNumber === "") {
            setError("card-number", "Card number is required.");
            isValid = false;
        } else if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) {
            setError("card-number", "Enter a valid 16-digit dummy card number.");
            isValid = false;
        } else {
            clearError("card-number");
        }

        if (cardExpiry === "") {
            setError("card-expiry", "Expiry date is required.");
            isValid = false;
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
            setError("card-expiry", "Use MM/YY format.");
            isValid = false;
        } else {
            clearError("card-expiry");
        }

        if (cardCvv === "") {
            setError("card-cvv", "CVV is required.");
            isValid = false;
        } else if (!/^\d{3}$/.test(cardCvv)) {
            setError("card-cvv", "CVV must be 3 digits.");
            isValid = false;
        } else {
            clearError("card-cvv");
        }
    }

    // Final check: Only trigger confirmation if ALL validations passed
    if (isValid) {
        // 1. Generate a random order number (e.g., ORD-739281)
        const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        const currentDate = new Date().toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // 2. Populate confirmation details onto the screen
        document.getElementById("conf-order-id").textContent = orderNumber;
        document.getElementById("conf-date").textContent = currentDate;
        document.getElementById("conf-payment").textContent = (selectedPaymentMethod === "card") ? "Credit/Debit Card (Simulated)" : "Cash on Delivery";

        document.getElementById("conf-name").textContent = name;
        document.getElementById("conf-email").textContent = email;
        document.getElementById("conf-phone").textContent = phone;
        document.getElementById("conf-address").textContent = address;
        document.getElementById("conf-grand-total").textContent = grandTotalEl.textContent;

        // Populate items summary list dynamically
        const confProductList = document.getElementById("conf-product-list");
        confProductList.innerHTML = "";
        order.forEach(product => {
            const itemRow = document.createElement("div");
            itemRow.style.display = "flex";
            itemRow.style.justifyContent = "space-between";
            itemRow.style.margin = "5px 0";
            itemRow.innerHTML = `<span>${product.name} (x${product.quantity})</span><span>$${(product.price * product.quantity).toFixed(2)}</span>`;
            confProductList.appendChild(itemRow);
        });

        // 3. Hide the main checkout form and display the confirmation receipt screen
        const checkoutContainer = document.querySelector(".checkout-container");
        if (checkoutContainer) checkoutContainer.style.display = "none";

        const confirmationContainer = document.getElementById("confirmation-container");
        if (confirmationContainer) confirmationContainer.style.display = "block";
    }
});

// --- HELPER FUNCTIONS ---

function setError(fieldId, message) {
    const inputField = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "-error");

    if (inputField) inputField.classList.add("error");
    if (errorElement) errorElement.textContent = message;
}

function clearError(fieldId) {
    const inputField = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "-error");

    if (inputField) inputField.classList.remove("error");
    if (errorElement) errorElement.textContent = "";
}