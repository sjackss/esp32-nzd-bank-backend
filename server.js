const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let transactions = [];

app.post('/api/transfer', (req, res) => {
  const tx = req.body;

  console.log('\n=== INCOMING TRANSACTION ===');
  console.log('TX ID:', tx.txId);
  console.log('From:', tx.fromName, '(' + tx.fromWallet + ')');
  console.log('To Account:', tx.toAccount);
  console.log('To SWIFT:', tx.toSwift);
  console.log('Amount NZD:', tx.amountNZD);
  console.log('Fee NZD:', tx.feeNZD);
  console.log('Checksum:', tx.hmac);
  console.log('============================\n');

  if (!tx.hmac) {
    return res.json({
      status: 'REJECTED',
      reason: 'Missing checksum'
    });
  }

  if (!tx.toAccount || tx.toAccount.length === 0) {
    return res.json({
      status: 'REJECTED',
      reason: 'Invalid account number'
    });
  }

  if (!tx.toSwift || tx.toSwift.length === 0) {
    return res.json({
      status: 'REJECTED',
      reason: 'Invalid SWIFT/BIC'
    });
  }

  const approval = {
    status: 'APPROVED',
    txId: tx.txId,
    amount: tx.amountNZD,
    toAccount: tx.toAccount,
    toSwift: tx.toSwift,
    timestamp: new Date().toISOString(),
    bankConfirmation: 'TXN_' + Math.random().toString(36).substring(7).toUpperCase(),
    message: 'Transfer of ' + tx.amountNZD + ' NZD approved to ' + tx.toAccount
  };

  transactions.push(approval);

  return res.json(approval);
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', transactions: transactions.length });
});

app.listen(PORT, () => {
  console.log(`Bank server listening on port ${PORT}`);
});
