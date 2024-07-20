$(document).ready(function () {
    let shippingCost = 0;

    // Function to update cart display
    function updateCartDisplay() {
        const cartItems = $('#cart-items');
        cartItems.empty();
        let total = 0;

        const cart = JSON.parse(localStorage.getItem('cart')) || {};

        if ($.isEmptyObject(cart)) {
            $('#cart-message').removeClass('d-none');
        } else {
            $('#cart-message').addClass('d-none');
        }

        for (const [product, data] of Object.entries(cart)) {
            const { price, quantity, perSlicePrice } = data;
            const itemTotal = perSlicePrice ? (perSlicePrice * quantity) : (price * quantity);
            total += itemTotal;

            cartItems.append(`
                <tr>
                    <td>${product}</td>
                    <td>₱${perSlicePrice ? perSlicePrice.toFixed(2) + ' per slice' : price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="form-control quantity" data-product="${product}" value="${quantity}" min="1">
                    </td>
                    <td>₱${itemTotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger remove-from-cart" data-product="${product}">Remove</button>
                    </td>
                </tr>
            `);
        }

        $('#shipping-cost').text(shippingCost.toFixed(2));
        total += shippingCost;
        $('#cart-total').text(total.toFixed(2));
    }

    // Add to cart functionality (for cakes.html and drinks.html)
    $('.add-to-cart').click(function () {
        const product = $(this).data('product');
        const price = parseFloat($(this).data('price'));
        const perSlicePrice = parseFloat($(this).data('per-slice-price')) || null;

        let cart = JSON.parse(localStorage.getItem('cart')) || {};

        if (cart[product]) {
            cart[product].quantity += 1;
        } else {
            cart[product] = { price: price, quantity: 1, perSlicePrice: perSlicePrice };
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'cart.html'; // Redirect to cart page
    });

    // Remove item from cart
    $(document).on('click', '.remove-from-cart', function () {
        const product = $(this).data('product');
        let cart = JSON.parse(localStorage.getItem('cart')) || {};

        delete cart[product];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    });

    // Update item quantity
    $(document).on('change', '.quantity', function () {
        const product = $(this).data('product');
        const quantity = parseInt($(this).val(), 10);
        let cart = JSON.parse(localStorage.getItem('cart')) || {};

        if (quantity > 0) {
            cart[product].quantity = quantity;
        } else {
            delete cart[product];
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    });

    // Update shipping cost on change
    $('#shipping-method').change(function() {
        const selectedOption = $(this).find('option:selected');
        shippingCost = parseFloat(selectedOption.data('cost')) || 0;
        updateCartDisplay();
    });

    // Handle checkout
    $('#checkout-form').submit(function (event) {
        event.preventDefault();

        const paymentMethod = $('#payment-method').val();
        const shippingMethod = $('#shipping-method').val();

        if (!paymentMethod || !shippingMethod) {
            alert('Please select both payment and shipping methods.');
            return;
        }

        // Save the order details to local storage
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const order = {
            items: cart,
            shippingCost: shippingCost.toFixed(2),
            total: $('#cart-total').text(),
            paymentMethod: paymentMethod,
            shippingMethod: shippingMethod
        };

        localStorage.setItem('order', JSON.stringify(order));

        // Clear the cart
        localStorage.removeItem('cart');

        // Redirect to the order summary page
        window.location.href = 'order-summary.html';
    });

    // Load cart items on page load
    updateCartDisplay();
});
