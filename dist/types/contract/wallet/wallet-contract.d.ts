import BN from 'bn.js';
import { Contract, ContractMethods, ContractOptions, Method } from '../contract';
import { Cell } from '../../boc/cell';
import { HttpProvider } from '../../providers/http-provider';
import { Address, AddressType } from '../../utils/Address';
export interface WalletContractOptions extends ContractOptions {
    publicKey?: Uint8Array;
}
export interface TransferMethodParams {
    secretKey: Uint8Array;
    toAddress: AddressType;
    amount: (BN | number);
    seqno: number;
    payload: (string | Uint8Array | Cell);
    sendMode: number;
    stateInit?: Cell;
}
export interface WalletContractMethods extends ContractMethods {
    transfer: TransferMethod;
    seqno: SeqnoMethod;
}
export declare type TransferMethod = ((params: TransferMethodParams) => Method);
export declare type SeqnoMethod = (() => SeqnoMethodResult);
export interface SeqnoMethodResult {
    call: () => Promise<number | undefined>;
}
export declare type DeployMethod = ((secretKey: Uint8Array) => Method);
export interface ExternalMessage {
    address: Address;
    signature: Uint8Array;
    message: Cell;
    body: Cell;
    signingMessage: Cell;
    stateInit?: Cell;
    code?: Cell;
    data?: Cell;
}
/**
 * Abstract standard wallet class.
 */
export declare class WalletContract<WalletType extends WalletContractOptions = WalletContractOptions, MethodsType extends WalletContractMethods = WalletContractMethods> extends Contract<WalletType, MethodsType> {
    readonly deploy: DeployMethod;
    constructor(provider: HttpProvider, options: WalletContractOptions);
    /**
     * Returns name of the contract.
     */
    getName(): string;
    /**
     * External message for initialization
     * @param secretKey  {Uint8Array} nacl.KeyPair.secretKey
     * @return {{address: Address, message: Cell, body: Cell, sateInit: Cell, code: Cell, data: Cell}}
     */
    createInitExternalMessage(secretKey: any): Promise<{
        address: Address;
        message: Cell;
        body: Cell;
        signingMessage: Cell;
        stateInit: Cell;
        code: Cell;
        data: Cell;
    }>;
    createTransferMessage(
    /**
     * `nacl.KeyPair.secretKey`
     * @todo: improve the description
     */
    secretKey: Uint8Array, address: AddressType, nanograms: (BN | number), seqno: number, payload?: (string | Uint8Array | Cell), sendMode?: number, dummySignature?: boolean, stateInit?: Cell): Promise<ExternalMessage>;
    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell;
    protected createSigningMessage(seqno?: number): Cell;
    protected createExternalMessage(signingMessage: Cell, 
    /**
     * `nacl.KeyPair.secretKey`
     * @todo: improve the description
     */
    secretKey: Uint8Array, seqno: number, dummySignature?: boolean): Promise<ExternalMessage>;
    private parsePayload;
}
