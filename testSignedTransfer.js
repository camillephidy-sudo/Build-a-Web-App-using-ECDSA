const secp = require('ethereum-cryptography/secp256k1');
const { sha256 } = require('ethereum-cryptography/sha256');
const { utf8ToBytes, hexToBytes, toHex } = require('ethereum-cryptography/utils');

(async function () {
  const privateKey = '0a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef';
  const sender = '0x04d6e9a62a51e391a1c169e8efd529a66dc3e700fcc9665a1ec4436284ae518e0dafd43434a672cbddda3d2c13435a24e58ab35a36efdb0c2ec7517da42dc88798';
  const recipient = '0x0437bb7b43e1742cd2e66e8ccba3a25a28d2e44862e530f40e9392ccdbe5b504b2e894d9a656dcbe437c086bad4181acf9982d07cb601cfb4e55a4dbcb56eaa392';
  const amount = 10;
  const nonce = 0;
  const message = `${recipient}:${amount}:${nonce}`;
  const messageHash = sha256(utf8ToBytes(message));

  try {
    const [signature, recovery] = await secp.sign(messageHash, hexToBytes(privateKey), { recovered: true });
    const signatureHex = toHex(signature);

    console.log('Sending transaction with signature:', signatureHex.slice(0, 20) + '...', 'recovery', recovery);

    const sendResponse = await fetch('http://localhost:3042/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount, signature: signatureHex, recovery, message }),
    });

    const sendData = await sendResponse.json();
    if (!sendResponse.ok) {
      throw new Error(JSON.stringify(sendData));
    }
    console.log('Send response:', sendData);

    const balanceResponse = await fetch(`http://localhost:3042/balance/${sender}`);
    const balanceData = await balanceResponse.json();
    console.log('New sender balance:', balanceData.balance);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();