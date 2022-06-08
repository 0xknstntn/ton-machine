const TonWeb = require("./index");
const {JettonMinter, JettonWallet} = TonWeb.token.jetton;
const tonMnemonic = require("tonweb-mnemonic");
var readlineSync = require('readline-sync');


const Address = TonWeb.utils.Address;
tonMnemonic.wordlists.EN;
var seed_from_create;
var tonweb;
var JETTON_WALLET_ADDRESS
function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

async function init(net, api, keyPath, collectionPath) {
    var json = require(keyPath.toString());
    var jsonCollection = require(collectionPath.toString());
    if (net=='testnet') {
        tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: api}));
        console.log("Using network: ", net);
    } else {
        tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: api}));
        console.log("Using network: ", net);
    }
    var seed = (json.seed).toString();
    
    let arr = seed.split(' ');

    const keyPair = await tonMnemonic.mnemonicToKeyPair(arr);
    const WalletClass = tonweb.wallet.all['v3R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0 
    });
    const walletAddress = await wallet.getAddress();
    console.log()
    console.log('   Usint wallet address =', walletAddress.toString(true, true, true));
    console.log()

    const minter = new JettonMinter(tonweb.provider, {
        adminAddress: walletAddress,
        jettonContentUri: (jsonCollection.collectionContentUri).toString(),
        jettonWalletCodeHex: JettonWallet.codeHex
    });
    const minterAddress = await minter.getAddress();
    console.log('Minter address =', minterAddress.toString(true, true, true));
    const deployMinter = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: minterAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano(0.1),
                seqno: seqno,
                payload: null, 
                sendMode: 3,
                stateInit: (await minter.createStateInit()).stateInit
            }).send()
        );
    }

    const getMinterInfo = async () => {
        const data = await minter.getJettonData();
        data.totalSupply = data.totalSupply.toString();
        data.adminAddress = data.adminAddress.toString(true, true, true);
        console.log(data);
        const jettonWalletAddress = await minter.getJettonWalletAddress(walletAddress);
        console.log('Jetto nWallet Address =', jettonWalletAddress.toString(true, true, true));
    }

    const mint = async () => {
        var mintAmount = readlineSync.questionInt('Amount mint: ')
        const seqno = (await wallet.methods.seqno().call()) || 0;

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: minterAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.01'),
                seqno: seqno,
                payload: await minter.createMintBody({
                    jettonAmount: TonWeb.utils.toNano(mintAmount),
                    destination: walletAddress,
                    amount: TonWeb.utils.toNano('0.03')
                }),
                sendMode: 3,
            }).send()
        );
    }
    const getJettonWalletInfo = async () => {
        const jettonWalletAddress = await minter.getJettonWalletAddress(walletAddress);
        const jettonWallet = new JettonWallet(tonweb.provider, {
            address: jettonWalletAddress.toString(true, true, true)
        });
        const data = await jettonWallet.getData();
        data.balance = data.balance.toString();
        data.ownerAddress = data.ownerAddress.toString(true, true, true);
        data.jettonMinterAddress = data.jettonMinterAddress.toString(true, true, true);
        console.log(data);

    }

    const transfer = async () => {
        var seqno = (await wallet.methods.seqno().call()) || 0;
        var transferAmount = readlineSync.questionInt('Amount to transfer: ')
        var transferWhom = readlineSync.question('Address to transfer: ')
        const jettonWalletAddress = await minter.getJettonWalletAddress(walletAddress);
        const jettonWallet = new JettonWallet(tonweb.provider, {
            address: jettonWalletAddress.toString(true, true, true)
        });
        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: jettonWalletAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano(0.035),
                seqno: seqno,
                payload: await jettonWallet.createTransferBody({
                    jettonAmount: TonWeb.utils.toNano(transferAmount),
                    toAddress: new TonWeb.utils.Address(transferWhom),
                    forwardAmount: null,
                    forwardPayload: null
                }),
                sendMode: 3,
            }).send()
        );
    }
 

    const burn = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        var burnAmount = readlineSync.questionInt('Amount to burn: ')
        const jettonWalletAddress = await minter.getJettonWalletAddress(walletAddress);
        const jettonWallet = new JettonWallet(tonweb.provider, {
            address: jettonWalletAddress.toString(true, true, true)
        });
        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: jettonWalletAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano(0.04),
                seqno: seqno,
                payload: await jettonWallet.createBurnBody({
                    jettonAmount: TonWeb.utils.toNano(burnAmount),
                    responseAddress: walletAddress
                }),
                sendMode: 3,
            }).send()
        );
    }
   
    while(1) {
        var bash = `
            1  deployMinter
            2  getMinterInfo
            3  mint
            4  getJettonWalletInfo
            5  transfer
            6  burn
        `
        console.log(bash)
        var expr = readlineSync.question('Choice: ');
        switch (expr) {
            case "011":
                await get_seqno();
                break;
            case "1":
                await deployMinter();
                break;
            case "2":
                await getMinterInfo();
                break;
            case "3":
                await mint();
                break;
            case "4":
                await getJettonWalletInfo();
                break;
            case "5":
                await transfer();
                break;
            case "6":
                await burn();
                break;
        }
    }/**/
}


init(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);