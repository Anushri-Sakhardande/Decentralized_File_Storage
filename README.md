# Decentralised File Storage 

A fully functional decentralized storage marketplace built with React, Solidity, and ethers.js. It enables secure and efficient data access transactions between Data Owners and Data Requesters, leveraging blockchain technology for transparency and immutability.

![pick role](https://github.com/user-attachments/assets/ca6abc3a-b25b-4334-8eaa-083020dde96b)


## Key Features
- **File Listings:** Data Owners can upload files (stored securely on IPFS) displayed to Data Requesters in a user-friendly interface.
- **Dynamic Bidding System:** Data Requesters can place bids on files owned by Data Owners, specifying an amount they are willing to pay for access.
- **Smart Contract Integration:** Bids and access permissions are managed through Ethereum smart contracts, ensuring a trustless transaction environment.
- **Seamless Interaction:** Integrated ethers.js for contract interactions and bid placement, with bid amounts processed directly in ETH.
- **Access Control:** A robust access control system allows Data Owners to grant or revoke file access to Data Requesters.
- **Responsive Interface:** The front end, built using React and styled with Tailwind CSS, provides a clean and intuitive experience.

![block diagram](https://github.com/user-attachments/assets/508a9bd6-e519-4b5f-bc64-24328c3c08e0)

## Technical Highlights
- Utilized Framer Motion for smooth animations, enhancing the user experience.
- Implemented BigNumber handling for accurate transaction processing on the Ethereum blockchain.
- Integrated events and logging to track actions like bids placed, accepted, and access granted.
- Designed smart contracts with mappings and dynamic arrays to efficiently manage file metadata, bids, and access permissions.

## Running the Decentralized Storage Bidding Platform Locally

Follow the steps below to set up and run the project locally on your machine.

---

### **Prerequisites**
1. **Node.js and npm**: Ensure Node.js (v16+) and npm are installed.  
   Download from [Node.js official website](https://nodejs.org/).
2. **Hardhat**: Installed globally for smart contract testing.  
   ```bash
   npm install --global hardhat
   ```
3. **Metamask Wallet**: Install the [Metamask browser extension](https://metamask.io/) for interacting with the dApp.
4. **IPFS (Optional)**: Use [Pinata](https://pinata.cloud/) or set up a local IPFS node for file storage.

---

### **Steps to Run**

#### **1. Clone the Repository**
```bash
git clone <repository-url>
cd <repository-folder>
```

#### **2. Install Dependencies**
Navigate to both the client and smart contract directories to install the required packages.

**For the client:**
```bash
cd client
npm install
```

**For the contracts:**
```bash
cd contracts
npm install
```

---

#### **3. Configure Environment Variables**
1. In the **src** directory, create a `.env` file and configure your environment variables:
   ```env
   VITE_API_KEY=<your-pinata-key>
   VITE_API_SECRET=<your-pinata-secret>
   ```

---

#### **4. Compile and Deploy the Smart Contract**
Compile and deploy the Solidity smart contracts using Hardhat.

1. Compile the contract:
   ```bash
   npx hardhat compile
   ```

2. Deploy the contract locally:
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

---

#### **5. Start the Client**
1. Navigate to the **client** directory.
2. Run the development server:
   ```bash
   npm start
   ```

---

#### **6. Interact with the dApp**
1. Open your browser and go to `http://localhost:3000`.
2. Connect your Metamask wallet and switch to the appropriate network (local or testnet).
3. Start interacting with the bidding platform.

---

### **Using Testnets**
To deploy on a public testnet (e.g., Sepolia):
1. Update the `hardhat.config.js` file with testnet configuration.
2. Deploy the contract using:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

Replace the local contract address with the testnet address in your `.env`.

---

### **Optional Enhancements**
- **Run Tests**: Execute unit tests for the smart contracts.
  ```bash
  npx hardhat test
  ```

With these steps, you can have the platform running locally for development and testing! 🚀
