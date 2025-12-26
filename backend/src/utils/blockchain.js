// backend/src/utils/blockchain.js
const { ethers } = require('ethers');

// BlockDAG testnet RPC URL
const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || 'https://rpc.awakening.bdagscan.com/';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Smart contract ABI (Application Binary Interface)
// This is the "menu" of functions your contract has
const CONTRACT_ABI = [
  "function addRecord(address patient, string memory ipfsHash) public returns (uint256)",
  "function getPatientRecords(address patient) public view returns (string[] memory)",
  "function getRecordCount(address patient) public view returns (uint256)",
  "function getRecordDetails(address patient, uint256 index) public view returns (string memory ipfsHash, address hospital, uint256 timestamp)",
  "event RecordAdded(address indexed patient, address indexed hospital, string ipfsHash, uint256 timestamp)"
];

// Global variables
let provider;
let wallet;
let contract;
let isInitialized = false;

/**
 * Initialize blockchain connection
 * @returns {Promise<void>}
 */
async function initializeBlockchain() {
  try {
    if (isInitialized) {
      console.log('✅ Blockchain already initialized');
      return;
    }

    console.log('🔗 Initializing BlockDAG connection...');

    // Connect to BlockDAG network
    provider = new ethers.JsonRpcProvider(BLOCKDAG_RPC_URL);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: Chain ID ${network.chainId}`);

    // Create wallet from private key
    const privateKey = process.env.HOSPITAL_PRIVATE_KEY;
    
    if (!privateKey) {
      console.warn('⚠️ HOSPITAL_PRIVATE_KEY not set - blockchain functions will fail');
      console.warn('⚠️ Ask your blockchain developer to provide this');
      return;
    }

    wallet = new ethers.Wallet(privateKey, provider);
    console.log(`✅ Wallet loaded: ${wallet.address}`);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} BDAG`);

    if (balance === 0n) {
      console.warn('⚠️ Wallet has 0 BDAG! Get test tokens from faucet');
      console.warn('⚠️ Faucet: https://awakening.bdagscan.com/faucet');
    }

    // Initialize contract
    if (!CONTRACT_ADDRESS) {
      console.warn('⚠️ CONTRACT_ADDRESS not set - blockchain functions will fail');
      console.warn('⚠️ Ask your blockchain developer to deploy contract first');
      return;
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log(`✅ Contract initialized: ${CONTRACT_ADDRESS}`);

    isInitialized = true;
    console.log('✅ Blockchain initialization complete');

  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
    throw error;
  }
}

/**
 * Store medical record hash on BlockDAG blockchain
 * @param {string} patientWalletAddress - Patient's wallet address
 * @param {string} ipfsHash - IPFS hash of encrypted file
 * @param {string} hospitalId - Hospital MongoDB ID (for logging)
 * @returns {Promise<string>} - Transaction hash
 */
async function storeHashOnBlockchain(patientWalletAddress, ipfsHash, hospitalId) {
  try {
    // Make sure blockchain is initialized
    if (!isInitialized) {
      await initializeBlockchain();
    }

    if (!contract) {
      throw new Error('Smart contract not initialized. Contact your blockchain developer.');
    }

    console.log('⛓️ Storing record on BlockDAG blockchain...');
    console.log(`   Patient: ${patientWalletAddress}`);
    console.log(`   IPFS Hash: ${ipfsHash}`);
    console.log(`   Hospital ID: ${hospitalId}`);

    // Validate patient address
    if (!ethers.isAddress(patientWalletAddress)) {
      throw new Error('Invalid patient wallet address');
    }

    // Estimate gas (optional but good practice)
    try {
      const gasEstimate = await contract.addRecord.estimateGas(patientWalletAddress, ipfsHash);
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.warn('⚠️ Could not estimate gas:', gasError.message);
    }

    // Send transaction to blockchain
    const tx = await contract.addRecord(patientWalletAddress, ipfsHash);
    
    console.log(`📝 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    // Wait for transaction to be mined (confirmed)
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed!');
    console.log(`   Block number: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Transaction hash: ${receipt.hash}`);

    // Return transaction hash
    return receipt.hash;

  } catch (error) {
    console.error('❌ Blockchain storage error:', error);
    
    // Provide helpful error messages
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient BDAG tokens for gas fees. Add funds to hospital wallet.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Cannot connect to BlockDAG network. Check internet connection.');
    } else if (error.message.includes('revert')) {
      throw new Error('Smart contract rejected transaction. Check patient address.');
    }
    
    throw new Error(`Blockchain error: ${error.message}`);
  }
}

/**
 * Get all medical records for a patient from blockchain
 * @param {string} patientWalletAddress - Patient's wallet address
 * @returns {Promise<Array>} - Array of IPFS hashes
 */
async function getRecordsFromBlockchain(patientWalletAddress) {
  try {
    if (!isInitialized) {
      await initializeBlockchain();
    }

    if (!contract) {
      throw new Error('Smart contract not initialized');
    }

    console.log(`🔍 Fetching records for: ${patientWalletAddress}`);

    // Validate address
    if (!ethers.isAddress(patientWalletAddress)) {
      throw new Error('Invalid patient wallet address');
    }

    // Call smart contract
    const records = await contract.getPatientRecords(patientWalletAddress);
    
    console.log(`✅ Found ${records.length} records on blockchain`);

    return records;

  } catch (error) {
    console.error('❌ Blockchain fetch error:', error);
    throw new Error(`Failed to fetch records: ${error.message}`);
  }
}

/**
 * Get patient's record count from blockchain
 * @param {string} patientWalletAddress - Patient's wallet address
 * @returns {Promise<number>} - Number of records
 */
async function getRecordCount(patientWalletAddress) {
  try {
    if (!isInitialized) {
      await initializeBlockchain();
    }

    if (!contract) {
      return 0;
    }

    const count = await contract.getRecordCount(patientWalletAddress);
    return Number(count);

  } catch (error) {
    console.error('❌ Record count error:', error);
    return 0;
  }
}

/**
 * Get blockchain network information
 * @returns {Promise<Object>} - Network info
 */
async function getNetworkInfo() {
  try {
    if (!isInitialized) {
      await initializeBlockchain();
    }

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const balance = wallet ? await provider.getBalance(wallet.address) : '0';

    return {
      connected: true,
      chainId: network.chainId.toString(),
      blockNumber,
      hospitalAddress: wallet ? wallet.address : 'Not set',
      balance: ethers.formatEther(balance),
      contractAddress: CONTRACT_ADDRESS || 'Not deployed yet'
    };

  } catch (error) {
    console.error('❌ Network info error:', error);
    return {
      connected: false,
      error: error.message
    };
  }
}

module.exports = {
  initializeBlockchain,
  storeHashOnBlockchain,
  getRecordsFromBlockchain,
  getRecordCount,
  getNetworkInfo
};