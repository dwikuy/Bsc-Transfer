const ethers = require('ethers');
const readline = require('readline-sync');
const fs = require('fs-extra');

const BSC_RPC_URL = "https://rpc.ankr.com/bsc/";
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);
const TOKEN_ADDRESS = "0xe846Dd34Dc07ab517e78f5e58edae79D80222FD0"; // Replace with your token contract address
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

async function sendToken(wallet, toAddress, amount, contractAddress) {
    const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, wallet);
    return await tokenContract.transfer(toAddress, amount);
}

async function processWallets(file, mainAddress, contractAddress) {
    const list = await fs.readFile(file, "utf-8");
    const walletData = list.split('\r\n');

    for (const data of walletData) {
        try {
            let wallet;
            if (data.includes(" ")) {
                wallet = ethers.Wallet.fromMnemonic(data, null, provider);
            } else {
                wallet = new ethers.Wallet(data, provider);
            }

            const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
            const balance = await tokenContract.balanceOf(wallet.address);
            console.log(`Address: ${wallet.address} | Token Balance: ${ethers.utils.formatEther(balance)}`);

            if (!balance.isZero()) {
                const tx = await sendToken(wallet, mainAddress, balance, contractAddress);
                console.log(`Token transfer successful: ${tx.hash}`);
            } else {
                console.log(`No tokens to transfer for wallet: ${wallet.address}`);
            }
        } catch (error) {
            console.error(`Error processing wallet: ${error.message}`);
        }
    }
}

async function main() {
    const file = readline.question("Enter the file name containing the wallets: ");
    const mainAddress = readline.question("Enter the main address: ");
    await processWallets(file, mainAddress, TOKEN_ADDRESS);
}

main();
