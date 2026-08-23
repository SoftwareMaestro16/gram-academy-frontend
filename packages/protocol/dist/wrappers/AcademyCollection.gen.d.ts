import * as c from '@ton/core';
import { ContractProvider, Sender, SendMode } from '@ton/core';
type RemainingBitsAndRefs = c.Slice;
export type CellRef<T> = {
    ref: T;
};
type CustomPackToBuilderFn<T> = (self: T, b: c.Builder) => void;
type CustomUnpackFromSliceFn<T> = (s: c.Slice) => T;
type coins = bigint;
type uint32 = bigint;
type uint64 = bigint;
type uint256 = bigint;
type bits512 = c.Slice;
/**
 > struct CollectionDataReply {
 >     nextItemIndex: int
 >     collectionContent: cell
 >     ownerAddress: address?
 > }
 */
export interface CollectionDataReply {
    readonly $: 'CollectionDataReply';
    nextItemIndex: bigint;
    collectionContent: c.Cell;
    ownerAddress: c.Address | null;
}
export declare const CollectionDataReply: {
    create(args: {
        nextItemIndex: bigint;
        collectionContent: c.Cell;
        ownerAddress: c.Address | null;
    }): CollectionDataReply;
    fromSlice(s: c.Slice): CollectionDataReply;
    store(self: CollectionDataReply, b: c.Builder): void;
    toCell(self: CollectionDataReply): c.Cell;
};
/**
 > struct CollectionConfigReply {
 >     adminAddress: address
 >     backendPublicKey: uint256
 >     subwalletId: uint32
 > }
 */
export interface CollectionConfigReply {
    readonly $: 'CollectionConfigReply';
    adminAddress: c.Address;
    backendPublicKey: uint256;
    subwalletId: uint32;
}
export declare const CollectionConfigReply: {
    create(args: {
        adminAddress: c.Address;
        backendPublicKey: uint256;
        subwalletId: uint32;
    }): CollectionConfigReply;
    fromSlice(s: c.Slice): CollectionConfigReply;
    store(self: CollectionConfigReply, b: c.Builder): void;
    toCell(self: CollectionConfigReply): c.Cell;
};
/**
 > struct (0x00000000) TopUp {
 >     comment: RemainingBitsAndRefs
 > }
 */
export interface TopUp {
    readonly $: 'TopUp';
    comment: RemainingBitsAndRefs;
}
export declare const TopUp: {
    PREFIX: number;
    create(args: {
        comment: RemainingBitsAndRefs;
    }): TopUp;
    fromSlice(s: c.Slice): TopUp;
    store(self: TopUp, b: c.Builder): void;
    toCell(self: TopUp): c.Cell;
};
/**
 > struct (0x4637289b) AskToDeployItem {
 >     signature: bits512
 >     signedData: Cell<SignedCertificateMint>
 > }
 */
export interface AskToDeployItem {
    readonly $: 'AskToDeployItem';
    signature: bits512;
    signedData: CellRef<SignedCertificateMint>;
}
export declare const AskToDeployItem: {
    PREFIX: number;
    create(args: {
        signature: bits512;
        signedData: CellRef<SignedCertificateMint>;
    }): AskToDeployItem;
    fromSlice(s: c.Slice): AskToDeployItem;
    store(self: AskToDeployItem, b: c.Builder): void;
    toCell(self: AskToDeployItem): c.Cell;
};
/**
 > struct SignedCertificateMint {
 >     subwalletId: uint32
 >     validSince: uint32
 >     validTill: uint32
 >     tokenName: TelegramString
 >     ownerAddress: address
 >     referrerAddress: address?
 >     content: cell
 > }
 */
export interface SignedCertificateMint {
    readonly $: 'SignedCertificateMint';
    subwalletId: uint32;
    validSince: uint32;
    validTill: uint32;
    tokenName: TelegramString;
    ownerAddress: c.Address;
    referrerAddress: c.Address | null;
    content: c.Cell;
}
export declare const SignedCertificateMint: {
    create(args: {
        subwalletId: uint32;
        validSince: uint32;
        validTill: uint32;
        tokenName: TelegramString;
        ownerAddress: c.Address;
        referrerAddress: c.Address | null;
        content: c.Cell;
    }): SignedCertificateMint;
    fromSlice(s: c.Slice): SignedCertificateMint;
    store(self: SignedCertificateMint, b: c.Builder): void;
    toCell(self: SignedCertificateMint): c.Cell;
};
/**
 > struct (0x47414344) CertificateDeploy {
 >     queryId: uint64
 >     ownerAddress: address
 >     content: cell
 >     tokenName: Cell<TelegramString>
 >     sendExcessesTo: address
 > }
 */
export interface CertificateDeploy {
    readonly $: 'CertificateDeploy';
    queryId: uint64;
    ownerAddress: c.Address;
    content: c.Cell;
    tokenName: CellRef<TelegramString>;
    sendExcessesTo: c.Address;
}
export declare const CertificateDeploy: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        ownerAddress: c.Address;
        content: c.Cell;
        tokenName: CellRef<TelegramString>;
        sendExcessesTo: c.Address;
    }): CertificateDeploy;
    fromSlice(s: c.Slice): CertificateDeploy;
    store(self: CertificateDeploy, b: c.Builder): void;
    toCell(self: CertificateDeploy): c.Cell;
};
/**
 > struct (0x57434f4c) WithdrawCollectionBalance {
 >     queryId: uint64
 >     destination: address
 > }
 */
export interface WithdrawCollectionBalance {
    readonly $: 'WithdrawCollectionBalance';
    queryId: uint64;
    destination: c.Address;
}
export declare const WithdrawCollectionBalance: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        destination: c.Address;
    }): WithdrawCollectionBalance;
    fromSlice(s: c.Slice): WithdrawCollectionBalance;
    store(self: WithdrawCollectionBalance, b: c.Builder): void;
    toCell(self: WithdrawCollectionBalance): c.Cell;
};
/**
 > struct (0x43524457) CollectionRevenueWithdrawn {
 >     queryId: uint64
 > }
 */
export interface CollectionRevenueWithdrawn {
    readonly $: 'CollectionRevenueWithdrawn';
    queryId: uint64;
}
export declare const CollectionRevenueWithdrawn: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
    }): CollectionRevenueWithdrawn;
    fromSlice(s: c.Slice): CollectionRevenueWithdrawn;
    store(self: CollectionRevenueWithdrawn, b: c.Builder): void;
    toCell(self: CollectionRevenueWithdrawn): c.Cell;
};
/**
 > struct (0x52454650) ReferralPayout {
 >     queryId: uint64
 > }
 */
export interface ReferralPayout {
    readonly $: 'ReferralPayout';
    queryId: uint64;
}
export declare const ReferralPayout: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
    }): ReferralPayout;
    fromSlice(s: c.Slice): ReferralPayout;
    store(self: ReferralPayout, b: c.Builder): void;
    toCell(self: ReferralPayout): c.Cell;
};
/**
 > type TelegramString = slice
 */
export type TelegramString = c.Slice;
export declare const TelegramString: {
    fromSlice(s: c.Slice): TelegramString;
    store(self: TelegramString, b: c.Builder): void;
    toCell(self: TelegramString): c.Cell;
};
/**
 > struct AcademyCollectionStorage {
 >     adminAddress: address
 >     backendPublicKey: uint256
 >     subwalletId: uint32
 >     content: cell
 > }
 */
export interface AcademyCollectionStorage {
    readonly $: 'AcademyCollectionStorage';
    adminAddress: c.Address;
    backendPublicKey: uint256;
    subwalletId: uint32;
    content: c.Cell;
}
export declare const AcademyCollectionStorage: {
    create(args: {
        adminAddress: c.Address;
        backendPublicKey: uint256;
        subwalletId: uint32;
        content: c.Cell;
    }): AcademyCollectionStorage;
    fromSlice(s: c.Slice): AcademyCollectionStorage;
    store(self: AcademyCollectionStorage, b: c.Builder): void;
    toCell(self: AcademyCollectionStorage): c.Cell;
};
interface ExtraSendOptions {
    bounce?: boolean;
    sendMode?: SendMode;
    extraCurrencies?: c.ExtraCurrency;
}
interface DeployedAddrOptions {
    workchain?: number;
    toShard?: {
        fixedPrefixLength: number;
        closeTo: c.Address;
    };
    overrideContractCode?: c.Cell;
}
export declare class AcademyCollection implements c.Contract {
    static CodeCell: c.Cell;
    static Errors: {
        'Errors.InvalidSignature': number;
        'Errors.WrongSubwalletId': number;
        'Errors.NotYetValidSignature': number;
        'Errors.ExpiredSignature': number;
        'Errors.NotEnoughFunds': number;
        'Errors.WrongTopupComment': number;
        'Errors.UnknownOp': number;
        'Errors.InvalidSender': number;
        'Errors.UnauthorizedAdmin': number;
        'Errors.IncorrectWorkchain': number;
    };
    readonly address: c.Address;
    readonly init: {
        code: c.Cell;
        data: c.Cell;
    } | undefined;
    protected constructor(address: c.Address, init?: {
        code: c.Cell;
        data: c.Cell;
    });
    static registerCustomPackUnpack<T>(typeName: string, packToBuilderFn: CustomPackToBuilderFn<T> | null, unpackFromSliceFn: CustomUnpackFromSliceFn<T> | null): void;
    static fromAddress(address: c.Address): AcademyCollection;
    static fromStorage(emptyStorage: {
        adminAddress: c.Address;
        backendPublicKey: uint256;
        subwalletId: uint32;
        content: c.Cell;
    }, deployedOptions?: DeployedAddrOptions): AcademyCollection;
    static createCellOfTopUp(body: {
        comment: RemainingBitsAndRefs;
    }): c.Cell;
    static createCellOfAskToDeployItem(body: {
        signature: bits512;
        signedData: CellRef<SignedCertificateMint>;
    }): c.Cell;
    static createCellOfWithdrawCollectionBalance(body: {
        queryId: uint64;
        destination: c.Address;
    }): c.Cell;
    sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions): Promise<void>;
    sendTopUp(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        comment: RemainingBitsAndRefs;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendAskToDeployItem(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        signature: bits512;
        signedData: CellRef<SignedCertificateMint>;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendWithdrawCollectionBalance(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
        destination: c.Address;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    getCollectionData(provider: ContractProvider): Promise<CollectionDataReply>;
    getNftAddressByIndex(provider: ContractProvider, index: bigint): Promise<c.Address>;
    getNftAddressByTokenName(provider: ContractProvider, tokenName: c.Slice): Promise<c.Address>;
    getNftContent(provider: ContractProvider, _index: bigint, individualNftContent: c.Cell): Promise<c.Cell>;
    getAcademyCollectionConfig(provider: ContractProvider): Promise<CollectionConfigReply>;
}
export {};
