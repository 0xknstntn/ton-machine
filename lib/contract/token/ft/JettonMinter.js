const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {createOffchainUriCell, parseOffchainUriCell, parseAddress} = require("../nft/NftUtils");
const {Address, BN, bytesToBase64} = require("../../../utils");

/**
 * ATTENTION: this is DRAFT, there will be changes
 */
class JettonMinter extends Contract {

    /**
     * @param provider
     * @param options   {{adminAddress: Address, jettonContentUri: string, jettonWalletCodeHex: string, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C72410209010001AA000114FF00F4A413F4BCF2C80B0102016202030202CC040502037A60070801D5D9910E38048ADF068698180B8D848ADF07D201800E98FE99FF6A2687D007D206A6A18400AA9385D47181A9AA8AAE382F9702480FD207D006A18106840306B90FD001812881A28217804502A906428027D012C678B666664F6AA7041083DEECBEF0BDD71812F83C207F9784060093DFC142201B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064907C80383A6465816503E5FFE4E83BC00C646582AC678B28027D0109E5B589666664B8FD80400FC03FA00FA40F82854120870542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05008C705F2E04A12A1035024C85004FA0258CF16CCCCC9ED5401FA403020D70B01C3008E1F8210D53276DB708010C8CB055003CF1622FA0212CB6ACB1FCB3FC98042FB00915BE2007DADBCF6A2687D007D206A6A183618FC1400B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064FC80383A6465816503E5FFE4E840001FAF16F6A2687D007D206A6A183FAA9040F6B06B3C');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains jetton minter data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeCoins(0); // total supply
        cell.bits.writeAddress(this.options.adminAddress);
        cell.refs[0] = createOffchainUriCell(this.options.jettonContentUri);
        cell.refs[1] = Cell.oneFromBoc(this.options.jettonWalletCodeHex);
        return cell;
    }

    /**
     * params   {{jettonAmount: BN, destination: Address, amount: BN, queryId?: number}}
     * @return {Cell}
     */
     createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(21, 32); // OP mint
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.destination);
        body.bits.writeCoins(params.amount); // in Toncoins

        const transferBody = new Cell(); // internal transfer
        transferBody.bits.writeUint(0x178d4519, 32); // internal_transfer op
        transferBody.bits.writeUint(params.queryId || 0, 64);
        transferBody.bits.writeCoins(params.jettonAmount);
        transferBody.bits.writeAddress(null); // from_address
        transferBody.bits.writeAddress(null); // response_address
        transferBody.bits.writeCoins(new BN(0)); // forward_amount
        transferBody.bits.writeBit(false); // forward_payload in this slice, not separate cell

        body.refs[0] = transferBody;
        return body;
    }

    /**
     * @return {Promise<{ totalSupply: BN, isMutable: boolean, adminAddress: Address|null, jettonContentUri: string, tokenWalletCode: Cell }>}
     */
    async getJettonData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_jetton_data');

        const totalSupply = result[0];
        const isMutable = result[1].toNumber() === -1;
        const adminAddress = parseAddress(result[2]);
        const jettonContentUri = parseOffchainUriCell(result[3]);
        const tokenWalletCode = result[4];

        return {totalSupply, isMutable, adminAddress, jettonContentUri, tokenWalletCode};
    }

    /**
     * params   {{ownerAddress: Address}}
     * @return {Promise<Address>}
     */
    async getJettonWalletAddress(ownerAddress) {
        const myAddress = await this.getAddress();
        const cell = new Cell()
        cell.bits.writeAddress(ownerAddress)

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_wallet_address',
            [['tvm.Slice', bytesToBase64(await cell.toBoc(false))]],
        );
        return parseAddress(result)
    }

}

module.exports = {JettonMinter};