const sinon = require('sinon');

const createPaymentMock = sinon.stub().yields(null, { id: 'PAY-123', links: [{ rel: 'approval_url', href: 'https://paypal.com/checkout/PAY-123' }] });
const executePaymentMock = sinon.stub().yields(null, { id: 'PAY-123', state: 'approved' });

const setupPayPalMock = () => {
    const paypalMock = {
        configure: sinon.stub(),
        payment: {
            create: createPaymentMock,
            execute: executePaymentMock
        }
    };

    return paypalMock;
};

module.exports = {
    setupPayPalMock,
    createPaymentMock,
    executePaymentMock
};
