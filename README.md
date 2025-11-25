# **MediDAG – Blockchain Medical Records System**

A secure, decentralized platform that enables hospitals to store encrypted patient data on a blockchain network, allowing patients to access their medical records anytime without needing to return physically for results.

---

## **📌 Overview**

BlockHealth is a **BlockDAG-powered healthcare data system** designed to solve the problem of fragmented and inaccessible medical records in hospitals.
The platform ensures that:

- Hospitals can **upload encrypted patient test results**.
- Patients can **securely access their records from anywhere**.
- Data is **tamper-proof, transparent, and decentralized**.
- Doctors can **reference patient history instantly** through permission-based access.

This project combines **blockchain**, **encryption**, and **smart contract automation** to create a trusted healthcare ecosystem.

---

## **🚀 Features**

### **🔐 1. Patient Data Storage**

- Hospitals upload medical test results (PDF, text, imaging metadata).
- Files are encrypted using **AES + asymmetric keys**.
- Hash stored on blockchain; encrypted file stored on IPFS or distributed storage.

### **👤 2. Patient Access Portal**

- Patients sign in using:

  - Email + password
  - Biometrics (optional depending on device)

- Patients view all past results in a clean dashboard.

### **🏥 3. Hospital Admin Dashboard**

- Upload patient test results.
- Manage patient profiles.
- Approve or reject data access requests.
- Track records uploaded by staff.

### **📱 4. Doctor/Clinician Dashboard**

- View patient history (with patient consent).
- Add notes or diagnoses.
- Update test status.

### **⛓️ 5. Blockchain Layer (BlockDAG)**

- Smart contracts manage:

  - Patient identity hashes
  - Results metadata
  - Access permissions
  - Upload tracking

- Decentralized, immutable, and transparent.

### **🔑 6. Token System (Optional for later phase)**

- Native token rewards:

  - Staff who upload verified data
  - Patients who verify their identity

- Token used for premium medical services or micro-payments.

---

## **🧩 System Architecture**

### **1. Frontend (React / Next.js / Flutter)**

- Patient App
- Hospital Admin Portal
- Doctor Portal
- Authentication Screens
- Results Viewer
- Dashboard UI

### **2. Backend**

- Node.js / Nest.js API
- Encryption service
- Patient identity management
- File processing service

### **3. Blockchain Layer**

- Smart contracts (Solidity or Rust depending on chain)
- Record hash storage
- Permission registry

### **4. Storage Layer**

- IPFS / S3 compatible storage for encrypted files
- On-chain metadata

### **5. Security Layer**

- AES-256 encryption
- Public/private key system
- JWT authentication
- Role-based access control (RBAC)

---

## **🛠️ Tech Stack**

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React • Next.js • TailwindCSS • Figma UI  |
| Mobile     | Flutter (optional)                        |
| Backend    | Node.js • Nest.js • Express               |
| Blockchain | BlockDAG / Solidity-style smart contracts |
| Storage    | IPFS • Pinata • AWS S3                    |
| Auth       | JWT • OAuth2                              |
| Database   | PostgreSQL / MongoDB                      |
| DevOps     | Docker • GitHub Actions                   |

---

## **📂 Project Structure**

```
/frontend
  /components
  /screens
  /hooks
  /styles
/backend
  /controllers
  /services
  /routes
  /models
  /middleware
/blockchain
  /contracts
  /tests
/storage
  /ipfs
/docs
  architecture-diagram.png
  api-docs.md
README.md
```

---

## **📸 Frontend Screens Included**

- Login / Register
- Patient Dashboard
- Hospital Admin Dashboard
- Doctor Dashboard
- Upload Test Results
- View Results
- Analytics Dashboard
- Profile & Settings

---

## **🧪 Smart Contract Functionalities**

### **Patient Contract**

- registerPatient()
- updatePatientHash()
- grantAccess(address doctor)
- revokeAccess(address doctor)

### **Record Contract**

- uploadRecord(ipfsHash, timestamp, hospitalId)
- getPatientRecords(patientAddress)

### **Access Control Contract**

- verifyPermission(patient, requester) returns (bool)

---

## **🌍 Use Cases**

### **Patients**

- View all medical records from any hospital.
- Share data securely with any doctor.
- Avoid repeated tests due to loss of files.

### **Hospitals**

- Reduce paperwork.
- Maintain accurate patient history.
- Prevent duplicate testing.

### **Doctors**

- See verified medical records instantly.
- Prevent misdiagnosis due to missing data.

---

## **🧰 Installation**

```bash
git clone https://github.com/jshuashrewd/MediDAG.git
cd MediDAG
```

### **Install Frontend**

```bash
cd frontend
npm install
npm run dev
```

### **Install Backend**

```bash
cd backend
npm install
npm start
```

### **Compile Smart Contracts**

```bash
cd blockchain
npm install
npx hardhat compile
```

---

## **🧿 Vision**

To create a **global medical record system** that empowers patients, increases hospital efficiency, and makes healthcare smarter, faster, and more secure through blockchain technology.

---

## **📞 Contact**

For collaboration or partnership:
**Email:** [jshuashrewd@gmail.com](mailto:jshuashrewd@gmail.com)
**Maintainer:** Joshua
