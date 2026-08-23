import { Address, Cell } from "@ton/core";
export declare function certIndex(tokenName: string): bigint;
export declare function certItemAddress(collectionAddress: Address, tokenName: string): Address;
export interface CertMintParams {
    subwalletId: number;
    validSince: number;
    validTill: number;
    tokenName: string;
    ownerAddress: Address;
    referrerAddress?: Address | null;
    content: Cell;
}
export declare function buildCertMintCell(p: CertMintParams): Cell;
export declare function wrapSignedMint(signedCell: Cell, signature: Buffer): Cell;
export declare function formatAddress(addr: Address, opts?: {
    bounceable?: boolean;
    testOnly?: boolean;
}): string;
