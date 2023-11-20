const ethers = require('ethers');
const fs = require('fs-extra');
const readline = require('readline-sync');

const BSC_RPC_URL = "https://rpc.ankr.com/bsc/";
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendBNB(wallet, toAddress, amount) {
    const tx = {
        to: toAddress,
        value: ethers.utils.parseEther(amount),
        gasPrice: ethers.utils.parseUnits("3", "gwei"),
        gasLimit: 21000
    };

    return await wallet.sendTransaction(tx);
}

async function distributeBNB(senderPrivateKey, amount) {
    const fileContent = await fs.readFile("./address.txt", "utf-8");
    const addresses = fileContent.split('\n')
                        .map(line => line.trim()) // Trim whitespace from each line
                        .filter(line => ethers.utils.isAddress(line)); // Validate each address

    const wallet = new ethers.Wallet(senderPrivateKey, provider);

    for (const address of addresses) {
        try {
            console.log(`Sending BNB to: ${address}`);
            const tx = await sendBNB(wallet, address, amount);
            console.log(`Transaction successful: ${tx.hash}`);
            await sleep(5000); // Wait for 5 seconds
        } catch (error) {
            console.error(`Error sending to ${address}: ${error.message}`);
        }
    }
}

async function main() {
    const senderPrivateKey = readline.question("Enter sender's private key: ", { hideEchoBack: true });
    const amount = readline.question("Enter the amount of BNB to send to each address: ");
    await distributeBNB(senderPrivateKey, amount);
}

main();
