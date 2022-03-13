const TonWeb = require("./index");
const {NftItem} = require("./contract/token/nft/NftItem");
const {NftCollection} = require("./contract/token/nft/NftCollection");
const {NftMarketplace} = require("./contract/token/nft/NftMarketplace");
const {NftSale} = require("./contract/token/nft/NftSale");
const tonMnemonic = require("tonweb-mnemonic");
var readlineSync = require('readline-sync');


const Address = TonWeb.utils.Address;
tonMnemonic.wordlists.EN;
var seed_from_create;
var tonweb;

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

    const nftCollection = new NftCollection(tonweb.provider, {
        ownerAddress: walletAddress,
        royalty: Number(jsonCollection.royalty),
        royaltyAddress: walletAddress,
        collectionContentUri: (jsonCollection.collectionContentUri).toString(),
        nftItemContentBaseUri: (jsonCollection.collectionContentUri).toString(),
        nftItemCodeHex: NftItem.codeHex
    });

    console.log('Info:')
    const nftCollectionAddress = await nftCollection.getAddress();
    console.log('   Сollection address = ', nftCollectionAddress.toString(true, true, true));

    const deployNftCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, false),
                amount: TonWeb.utils.toNano(0.01),
                seqno: seqno,
                payload: null,
                sendMode: 3,
                stateInit: (await nftCollection.createStateInit()).stateInit
            }).send()
        );
    }
    
    const getNftCollectionInfo = async () => {
        const data = await nftCollection.getCollectionData();
        data.ownerAddress = data.ownerAddress.toString(true, true, true);
        console.log()
        console.log("Collection information: ")
        console.log(data);
        const royaltyParams = await nftCollection.getRoyaltyParams();
        royaltyParams.royaltyAddress = royaltyParams.royaltyAddress.toString(true, true, true);
        console.log()
        console.log("Royalty information: ")
        console.log(royaltyParams);
        console.log("Address with index 0:", (await nftCollection.getNftItemAddressByIndex(0)).toString(true, true, true));
        console.log("Address with index 1:", (await nftCollection.getNftItemAddressByIndex(1)).toString(true, true, true));
        console.log()
    }


    while(1) {
        var bash = `
            1  Deploy Nft Collection
            2  Get Nft Collection Info
        `
        console.log(bash)
        var expr = readlineSync.question('Choice: ');
        switch (expr) {
            case "1":
                await deployNftCollection();
                break;
            case "2":
                await getNftCollectionInfo();
                break;
        }
    }
}


init(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);