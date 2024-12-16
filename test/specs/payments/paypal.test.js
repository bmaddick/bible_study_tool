const test = require('ava');
const sinon = require('sinon');
const { setupPayPalMock, createPaymentMock, executePaymentMock } = require('../../helper/paymentHelper');
const { getPaymentData } = require('../../fixtures/paymentData');
const paypal = require('../../../lib/payments/paypal');
const Cart = require('../../../lib/cart');

test.beforeEach((t) => {
    // Setup PayPal SDK mock
    t.context.paypalMock = setupPayPalMock();

    // Setup session mock
    t.context.session = {
        cart: new Cart(),
        paymentId: null,
        paymentMessage: null,
        customer: {
            email: 'test@example.com'
        }
    };

    // Setup response mock
    t.context.res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        redirect: sinon.stub()
    };
});

test('Creates payment successfully', async (t) => {
    const { session, res, paypalMock } = t.context;
    const paymentData = getPaymentData();
    session.cart.addItem(paymentData.product);

    await paypal.setup(paymentData.config);
    await paypal.createPayment(session, res);

    t.true(createPaymentMock.called);
    t.is(session.paymentId, 'PAY-123');
    t.true(res.redirect.calledWith('https://paypal.com/checkout/PAY-123'));
});

test('Executes payment successfully', async (t) => {
    const { session, res, paypalMock } = t.context;
    const paymentData = getPaymentData();
    session.cart.addItem(paymentData.product);
    session.paymentId = 'PAY-123';

    await paypal.setup(paymentData.config);
    await paypal.executePayment(session, 'PAYER-123', res);

    t.true(executePaymentMock.called);
    t.is(session.paymentMessage, 'Payment completed successfully');
    t.true(res.redirect.calledWith('/payment/complete'));
});

test('Handles empty cart during payment creation', async (t) => {
    const { session, res } = t.context;

    await paypal.setup(getPaymentData().config);
    await paypal.createPayment(session, res);

    t.false(createPaymentMock.called);
    t.is(session.paymentMessage, 'Cart is empty');
    t.true(res.redirect.calledWith('/'));
});

test('Handles invalid payment ID during execution', async (t) => {
    const { session, res } = t.context;

    await paypal.setup(getPaymentData().config);
    await paypal.executePayment(session, 'INVALID-ID', res);

    t.false(executePaymentMock.called);
    t.is(session.paymentMessage, 'Payment not found');
    t.true(res.redirect.calledWith('/checkout/payment'));
});

test('Handles payment creation error', async (t) => {
    const { session, res, paypalMock } = t.context;
    const paymentData = getPaymentData();
    session.cart.addItem(paymentData.product);
    createPaymentMock.throws(new Error('Payment creation failed'));

    await paypal.setup(paymentData.config);
    await paypal.createPayment(session, res);

    t.is(session.paymentMessage, 'Error processing payment');
    t.true(res.redirect.calledWith('/checkout/payment'));
});

test('Handles payment execution error', async (t) => {
    const { session, res, paypalMock } = t.context;
    const paymentData = getPaymentData();
    session.cart.addItem(paymentData.product);
    session.paymentId = 'PAY-123';
    executePaymentMock.throws(new Error('Payment execution failed'));

    await paypal.setup(paymentData.config);
    await paypal.executePayment(session, 'PAYER-123', res);

    t.is(session.paymentMessage, 'Error processing payment');
    t.true(res.redirect.calledWith('/checkout/payment'));
});

test('Handles completed payment execution', async (t) => {
    const { session, res, paypalMock } = t.context;
    const paymentData = getPaymentData();
    session.cart.addItem(paymentData.product);
    session.paymentId = 'PAY-123';
    executePaymentMock.throws({ response: { name: 'PAYMENT_ALREADY_DONE' } });

    await paypal.setup(paymentData.config);
    await paypal.executePayment(session, 'PAYER-123', res);

    t.is(session.paymentMessage, 'Payment has already been completed');
    t.true(res.redirect.calledWith('/payment/complete'));
});
