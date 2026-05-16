# ECDSA Secure Transaction Web App

A secure, centralized transaction system that leverages **Elliptic Curve Digital Signature Algorithm (ECDSA)** to ensure only account owners can authorize transfers. This application demonstrates cryptographic principles including public key derivation, digital signatures, signature recovery, and nonce-based replay prevention.

## ✨ Features

- **Public Key Cryptography**: Secure address derivation from private keys using secp256k1 elliptic curve
- **Digital Signatures**: All transactions are signed with the sender's private key
- **Signature Recovery**: Server recovers the sender's public key from the signature to verify ownership
- **Replay Attack Prevention**: Nonce-based transaction sequencing prevents double-spending and replays
- **Real-time Balance Updates**: Immediate feedback on transaction success
- **Secure Session Management**: Each wallet maintains its own nonce counter

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ 
- npm v9+

### Installation & Running

**Terminal 1 - Start the Server:**
```bash
cd server
npm install
node index
# Or use nodemon for auto-restart: npm i -g nodemon && nodemon index
```
Server runs on `http://localhost:3042`

**Terminal 2 - Start the Client:**
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

### Test Accounts

Three test accounts are pre-funded in the server with the following private keys:

1. **Account 1** (100 units)
   - Private Key: `0a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef`

2. **Account 2** (50 units)
   - Private Key: `1a2b3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef0`

3. **Account 3** (75 units)
   - Private Key: `2a3b4c5d6e7f890123456789abcdef0123456789abcdef0123456789abcdef01`

## 📱 How to Use

1. **Enter your private key** in the "Private Key" field
2. Your **wallet address** will be automatically derived
3. Your **current balance** will be fetched from the server
4. **Enter the recipient address** and **amount** to send
5. Click **Transfer** to sign and send the transaction
6. The server validates the signature and nonce, then processes the transfer

## 🔐 How It Works

### Phase 1: Basic Setup
The foundation uses Express.js on the backend and React with Vite on the frontend, with a simple balance tracking system.

### Phase 2: Public Key Cryptography
Accounts are represented by their full 65-byte public keys (derived from private keys using the secp256k1 curve). Only users with the correct private key can derive the matching address.

**Key function:**
```js
const publicKey = secp.getPublicKey(hexToBytes(privateKey));
```

### Phase 3: Digital Signatures & Recovery
Transactions are signed on the client with the sender's private key. The server recovers the sender's public key from the signature to verify they authorized the transaction.

**Flow:**
1. Client creates message: `recipient:amount:nonce`
2. Client signs the message hash with private key
3. Server receives: signature, recovery byte, and message
4. Server recovers public key: `secp.recoverPublicKey(messageHash, signature, recovery)`
5. Server validates recovered address matches a funded account
6. Server processes the transfer

### Phase 4: Replay Prevention with Nonces
Each account maintains a **nonce** (number used once) that increments with each successful transaction. The nonce is included in every signed message.

**Security benefit:**
- Even if an attacker intercepts a signed transaction, replaying it fails because the server expects the next nonce
- Prevents double-spending and ensures transaction ordering
- Client fetches the current nonce before signing
- Client increments nonce locally after successful transfer
- Server validates and increments nonce on transaction success

## �️ Project Architecture

### Client-Side (`/client`)
- **React + Vite**: Fast, modern frontend
- **Wallet.jsx**: Manages private key input and address derivation
- **Transfer.jsx**: Handles transaction creation and signing
- **ethereum-cryptography**: Signs transactions locally

### Server-Side (`/server`)
- **Express.js**: RESTful API server
- **Balances & Nonces**: Tracks account state
- **Signature Recovery**: Verifies transaction authenticity
- **ethereum-cryptography**: Recovers sender from signature

## 📡 API Endpoints

### `GET /balance/:address`
Returns the balance of an account.
```
Response: { balance: number }
```

### `GET /nonce/:address`
Returns the current nonce (transaction counter) for an account.
```
Response: { nonce: number }
```

### `POST /send`
Sends a signed transaction. Validates signature and nonce before processing.
```json
{
  "recipient": "0x04...",
  "amount": 10,
  "signature": "304502...",
  "recovery": 0,
  "message": "0x04...:10:0"
}
```
```
Response: { balance: number } (new sender balance)
```

## 📚 Technologies Used

- **[ethereum-cryptography v1.2.0](https://www.npmjs.com/package/ethereum-cryptography/v/1.2.0)**: ECDSA signing and recovery
- **[secp256k1](https://github.com/paulmillr/noble-secp256k1)**: Elliptic curve cryptography
- **[Express.js](https://expressjs.com/)**: Backend framework
- **[React](https://react.dev/)**: Frontend framework
- **[Vite](https://vitejs.dev/)**: Frontend build tool

## 🔍 Security Considerations

✅ **Private keys never leave the client**  
✅ **All transactions are cryptographically signed**  
✅ **Server cannot forge transactions without private key**  
✅ **Nonces prevent replay and double-spending attacks**  
✅ **Signature recovery ensures sender authenticity**  

⚠️ **Limitations (for educational purposes):**
- Single centralized server (no distributed consensus)
- No transaction persistence across restarts
- No encryption for network transport (use TLS in production)
- Test accounts are hardcoded

## 📖 Implementation Phases

The project was built in four phases of increasing security:

### **Phase 1: Basic Setup** ✅
- React client with Vite dev server
- Express.js backend with balance tracking
- Simple address-based transfers (no security)
- Real-time balance updates

### **Phase 2: Public Key Cryptography** ✅
- Real public keys (secp256k1) instead of simple addresses
- Private key input to derive wallet address
- Users can only see balances for their derived addresses
- Foundation for secure account ownership

### **Phase 3: Digital Signatures** ✅
- Client signs transactions with private key (stays on client!)
- Server recovers sender's public key from signature
- `secp.recoverPublicKey()` verifies transaction authenticity
- No private key exposure to server

### **Phase 4: Replay Prevention** ✅
- Nonce tracking per account
- Client fetches nonce before signing
- Nonce included in signed message: `recipient:amount:nonce`
- Server validates and increments nonce on success
- Prevents replay attacks and double-spending

## 🧪 Testing

Test the signed transfer endpoint directly:
```bash
node testSignedTransfer.js
```

This script demonstrates:
- Private key to public key derivation
- Message signing with nonce
- Sending signed transaction to server
- Verifying balance change

## 📝 File Structure

```
.
├── client/
│   ├── src/
│   │   ├── App.jsx              # Main component, manages state
│   │   ├── Wallet.jsx           # Private key input & address derivation
│   │   ├── Transfer.jsx         # Transaction sending & signing
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js                 # Express server, balance & nonce tracking
│   └── package.json
├── testSignedTransfer.js        # Test script for signed transactions
└── README.md
```

## 🎓 Learning Outcomes

By working through this project, you'll understand:
- **Public Key Cryptography**: How addresses are derived from private keys
- **Digital Signatures**: How to sign data with ECDSA and verify authenticity
- **Signature Recovery**: How to recover a public key from a signature
- **Replay Attack Prevention**: Why nonces are essential for transaction security
- **Client-Server Security**: How to build secure applications without storing secrets server-side

