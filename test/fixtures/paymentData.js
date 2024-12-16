const getPaymentData = () => ({
    config: {
        mode: 'sandbox',
        client_id: 'test_client_id',
        client_secret: 'test_client_secret'
    },
    product: {
        productId: 'test-product',
        title: 'Test Product',
        quantity: 1,
        totalItemPrice: 99.99,
        options: {}
    }
});

module.exports = {
    getPaymentData
};
