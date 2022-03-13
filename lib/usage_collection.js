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
    } else {
        tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: api}));
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
                amount: TonWeb.utils.toNano(0.001),
                seqno: seqno,
                payload: null,
                sendMode: 3,
                stateInit: (await nftCollection.createStateInit()).stateInit
            }).send()
        );
    }
    const nftByIndex = async(id) => {
        const addressByIndex = await nftCollection.getNftItemAddressByIndex(id);
        return addressByIndex.toString(true, true, true)
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

    const deployNftItem = async () => {
        var deployNftMenu = readlineSync.question('Mint of one token or more than 1?\n1 - One token\n2 - Multiple: ');
        if(deployNftMenu==1) {
            var tokenID = readlineSync.question("Number json file: ");
            const seqno = (await wallet.methods.seqno().call()) || 0;
            console.log({seqno})
            const amount = TonWeb.utils.toNano(0.001);
            console.log(
                await wallet.methods.transfer({
                    secretKey: keyPair.secretKey,
                    toAddress: nftCollectionAddress.toString(true, true, true),
                    amount: amount,
                    seqno: seqno,
                    payload: await nftCollection.createMintBody({
                        amount,
                        itemIndex: 0,
                        itemOwnerAddress: walletAddress,
                        itemContentUri: `${tokenID}.json`
                    }),
                    sendMode: 3,
                }).send()
            );
        } 
        if(deployNftMenu==2) {
            var amountToken = readlineSync.question("How many NFT: ");
            for(var i = 0; i<amountToken; i++) {
                const seqno = (await wallet.methods.seqno().call()) || 0;
                console.log(`Deploy NFT: ${i}`)
                console.log({seqno})
                const amount = TonWeb.utils.toNano(0.001);
                console.log(
                    await wallet.methods.transfer({
                        secretKey: keyPair.secretKey,
                        toAddress: nftCollectionAddress.toString(true, true, true),
                        amount: amount,
                        seqno: seqno,
                        payload: await nftCollection.createMintBody({
                            amount,
                            itemIndex: i,
                            itemOwnerAddress: walletAddress,
                            itemContentUri: `${i}.json`
                        }),
                        sendMode: 3,
                    }).send()
                );
            }
            
        }
        
    }

    const changeCollectionOwner = async () => {
        var WALLET_NEW_OWNER = readlineSync.question('Addres New Owner: ');
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})
        const amount = TonWeb.utils.toNano(0.001);
        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createChangeOwnerBody({
                    newOwnerAddress: new TonWeb.utils.Address(WALLET_NEW_OWNER)
                }),
                sendMode: 3,
            }).send()
        );
    }
    const addressNftItem = await nftByIndex(0);
    const nftItemAddress = new TonWeb.utils.Address(addressNftItem);
    console.log('   NFT item address (index 0) =', nftItemAddress.toString(true, true, true));
    const nftItem = new NftItem(tonweb.provider, {address: nftItemAddress});

    const getNftItemInfo = async () => {
        var indexNFT = readlineSync.question("index NFT: ");
        const addressNftItem = await nftByIndex(indexNFT);
        const nftItemAddress = new TonWeb.utils.Address(addressNftItem);
        console.log('   NFT item address (index 0) =', nftItemAddress.toString(true, true, true));
        const nftItem = new NftItem(tonweb.provider, {address: nftItemAddress});

        const data = await nftCollection.methods.getNftItemContent(nftItem);
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress?.toString(true, true, true);
        console.log(data);
    }

    const marketplace = new NftMarketplace(tonweb.provider, {ownerAddress: walletAddress});
    const marketplaceAddress = await marketplace.getAddress();
    console.log('   Matketplace address =', marketplaceAddress.toString(true, true, true));


    const deployMarketplace = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: marketplaceAddress.toString(true, true, false), // non-bounceable
                amount: TonWeb.utils.toNano(0.001),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await marketplace.createStateInit()).stateInit
            }).send()
        );
    }

    const sale = new NftSale(tonweb.provider, {
        marketplaceAddress: marketplaceAddress,
        nftAddress: nftItemAddress,
        fullPrice: TonWeb.utils.toNano('1.3'),
        marketplaceFee: TonWeb.utils.toNano('0.2'),
        royaltyAddress: nftCollectionAddress,
        royaltyAmount: TonWeb.utils.toNano('0.1'),
    });
    const saleAddress =  await sale.getAddress();
    console.log('   Sale address =', saleAddress.toString(true, true, true));

    const transferNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.001);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await nftItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: saleAddress,
                    forwardAmount: TonWeb.utils.toNano(0.001),
                    forwardPayload: new TextEncoder().encode('gift'),
                    responseAddress: walletAddress
                }),
                sendMode: 3,
            }).send()
        );
    }
    const deploySale = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.001);

        const body = new TonWeb.boc.Cell();
        body.bits.writeUint(1, 32); // OP deploy new auction
        body.bits.writeCoins(amount);
        body.refs.push((await sale.createStateInit()).stateInit);
        body.refs.push(new TonWeb.boc.Cell());

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: marketplaceAddress,
                amount: amount,
                seqno: seqno,
                payload: body,
                sendMode: 3,
            }).send()
        );
    }

    const cancelSale = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.001);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: saleAddress,
                amount: amount,
                seqno: seqno,
                payload: await sale.createCancelBody({}),
                sendMode: 3,
            }).send()
        );
    }

    const getSaleInfo = async () => {
        const data = await sale.methods.getData();
        data.marketplaceAddress = data.marketplaceAddress.toString(true, true, true);
        data.nftAddress = data.nftAddress.toString(true, true, true);
        data.nftOwnerAddress = data.nftOwnerAddress?.toString(true, true, true);
        data.fullPrice = data.fullPrice.toString();
        data.marketplaceFee = data.marketplaceFee.toString();
        data.royaltyAmount = data.royaltyAmount.toString();
        data.royaltyAddress = data.royaltyAddress.toString(true, true, true);
        console.log(data);
    };

    while(1) {
        var bash = `
            1  Deploy Nft Collection
            2  Get Nft Collection Info
            3  Deploy Nft Item
            4  Get Nft Item Info
            5  Deploy Marketplace
            6  Deploy Sale
            7  Get Sale Info
            8  Transfer Nft Item
            9  Cancel Sale
            10 Change Collection Owner
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
            case "3":
                await deployNftItem();
                break;
            case "4":
                await getNftItemInfo();
                break;
            case "5":
                await deployMarketplace();
                break;
            case "6":
                await deploySale();
                break;
            case "7":
                await getSaleInfo();
                break;
            case "8":
                await transferNftItem();
                break;
            case "9":
                await cancelSale();
                break;
            case "10":
                await changeCollectionOwner();
                break;
        }
    }
}


init(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);