import { HttpProvider } from '../../../providers/http-provider';
import { ContractOptions } from '../../contract';
import { WalletContract } from '../wallet-contract';
/**
 * Attention: no seqno get-method in this wallet.
 */
export declare class SimpleWalletContractR1 extends WalletContract {
    constructor(provider: HttpProvider, options: ContractOptions);
    getName(): string;
}
