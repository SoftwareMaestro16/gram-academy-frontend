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
/**
 > struct NftDataReply {
 >     isInitialized: bool
 >     index: int
 >     collectionAddress: address
 >     ownerAddress: address?
 >     content: cell?
 > }
 */
export interface NftDataReply {
    readonly $: 'NftDataReply';
    isInitialized: boolean;
    index: bigint;
    collectionAddress: c.Address;
    ownerAddress: c.Address | null;
    content: c.Cell | null;
}
export declare const NftDataReply: {
    create(args: {
        isInitialized: boolean;
        index: bigint;
        collectionAddress: c.Address;
        ownerAddress?: c.Address | null;
        content?: c.Cell | null;
    }): NftDataReply;
    fromSlice(s: c.Slice): NftDataReply;
    store(self: NftDataReply, b: c.Builder): void;
    toCell(self: NftDataReply): c.Cell;
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
 > struct (0x5fcc3d14) Transfer {
 >     queryId: uint64
 >     rest: RemainingBitsAndRefs
 > }
 */
export interface Transfer {
    readonly $: 'Transfer';
    queryId: uint64;
    rest: RemainingBitsAndRefs;
}
export declare const Transfer: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        rest: RemainingBitsAndRefs;
    }): Transfer;
    fromSlice(s: c.Slice): Transfer;
    store(self: Transfer, b: c.Builder): void;
    toCell(self: Transfer): c.Cell;
};
/**
 > struct (0x2fcb26a2) GetStaticData {
 >     queryId: uint64
 > }
 */
export interface GetStaticData {
    readonly $: 'GetStaticData';
    queryId: uint64;
}
export declare const GetStaticData: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
    }): GetStaticData;
    fromSlice(s: c.Slice): GetStaticData;
    store(self: GetStaticData, b: c.Builder): void;
    toCell(self: GetStaticData): c.Cell;
};
/**
 > struct (0x8b771735) ReportStaticData {
 >     queryId: uint64
 >     index: uint256
 >     collectionAddress: address
 > }
 */
export interface ReportStaticData {
    readonly $: 'ReportStaticData';
    queryId: uint64;
    index: uint256;
    collectionAddress: c.Address;
}
export declare const ReportStaticData: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        index: uint256;
        collectionAddress: c.Address;
    }): ReportStaticData;
    fromSlice(s: c.Slice): ReportStaticData;
    store(self: ReportStaticData, b: c.Builder): void;
    toCell(self: ReportStaticData): c.Cell;
};
/**
 > struct (0x04ded148) ProveOwnership {
 >     queryId: uint64
 >     dest: address
 >     forwardPayload: cell
 >     withContent: bool
 > }
 */
export interface ProveOwnership {
    readonly $: 'ProveOwnership';
    queryId: uint64;
    dest: c.Address;
    forwardPayload: c.Cell;
    withContent: boolean;
}
export declare const ProveOwnership: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }): ProveOwnership;
    fromSlice(s: c.Slice): ProveOwnership;
    store(self: ProveOwnership, b: c.Builder): void;
    toCell(self: ProveOwnership): c.Cell;
};
/**
 > struct (0x0524c7ae) OwnershipProof {
 >     queryId: uint64
 >     itemId: uint256
 >     owner: address
 >     data: cell
 >     revokedAt: uint64
 >     content: cell?
 > }
 */
export interface OwnershipProof {
    readonly $: 'OwnershipProof';
    queryId: uint64;
    itemId: uint256;
    owner: c.Address;
    data: c.Cell;
    revokedAt: uint64;
    content: c.Cell | null;
}
export declare const OwnershipProof: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        itemId: uint256;
        owner: c.Address;
        data: c.Cell;
        revokedAt: uint64;
        content: c.Cell | null;
    }): OwnershipProof;
    fromSlice(s: c.Slice): OwnershipProof;
    store(self: OwnershipProof, b: c.Builder): void;
    toCell(self: OwnershipProof): c.Cell;
};
/**
 > struct (0xd0c3bfea) RequestOwner {
 >     queryId: uint64
 >     dest: address
 >     forwardPayload: cell
 >     withContent: bool
 > }
 */
export interface RequestOwner {
    readonly $: 'RequestOwner';
    queryId: uint64;
    dest: c.Address;
    forwardPayload: c.Cell;
    withContent: boolean;
}
export declare const RequestOwner: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }): RequestOwner;
    fromSlice(s: c.Slice): RequestOwner;
    store(self: RequestOwner, b: c.Builder): void;
    toCell(self: RequestOwner): c.Cell;
};
/**
 > struct (0x0dd607e3) OwnerInfo {
 >     queryId: uint64
 >     itemId: uint256
 >     initiator: address
 >     owner: address
 >     data: cell
 >     revokedAt: uint64
 >     content: cell?
 > }
 */
export interface OwnerInfo {
    readonly $: 'OwnerInfo';
    queryId: uint64;
    itemId: uint256;
    initiator: c.Address;
    owner: c.Address;
    data: c.Cell;
    revokedAt: uint64;
    content: c.Cell | null;
}
export declare const OwnerInfo: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
        itemId: uint256;
        initiator: c.Address;
        owner: c.Address;
        data: c.Cell;
        revokedAt: uint64;
        content: c.Cell | null;
    }): OwnerInfo;
    fromSlice(s: c.Slice): OwnerInfo;
    store(self: OwnerInfo, b: c.Builder): void;
    toCell(self: OwnerInfo): c.Cell;
};
/**
 > struct (0xd53276db) Excesses {
 >     queryId: uint64
 > }
 */
export interface Excesses {
    readonly $: 'Excesses';
    queryId: uint64;
}
export declare const Excesses: {
    PREFIX: number;
    create(args: {
        queryId: uint64;
    }): Excesses;
    fromSlice(s: c.Slice): Excesses;
    store(self: Excesses, b: c.Builder): void;
    toCell(self: Excesses): c.Cell;
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
 > struct CertificateConfig {
 >     index: uint256
 >     collectionAddress: address
 > }
 */
export interface CertificateConfig {
    readonly $: 'CertificateConfig';
    index: uint256;
    collectionAddress: c.Address;
}
export declare const CertificateConfig: {
    create(args: {
        index: uint256;
        collectionAddress: c.Address;
    }): CertificateConfig;
    fromSlice(s: c.Slice): CertificateConfig;
    store(self: CertificateConfig, b: c.Builder): void;
    toCell(self: CertificateConfig): c.Cell;
};
/**
 > struct CertificateStorageNotInitialized {
 >     config: Cell<CertificateConfig>
 > }
 */
export interface CertificateStorageNotInitialized {
    readonly $: 'CertificateStorageNotInitialized';
    config: CellRef<CertificateConfig>;
}
export declare const CertificateStorageNotInitialized: {
    create(args: {
        config: CellRef<CertificateConfig>;
    }): CertificateStorageNotInitialized;
    fromSlice(s: c.Slice): CertificateStorageNotInitialized;
    store(self: CertificateStorageNotInitialized, b: c.Builder): void;
    toCell(self: CertificateStorageNotInitialized): c.Cell;
};
/**
 > struct AcademyCertificateStorage {
 >     config: Cell<CertificateConfig>
 >     ownerAddress: address
 >     authorityAddress: address
 >     revokedAt: uint32
 >     content: cell
 >     tokenName: Cell<TelegramString>
 > }
 */
export interface AcademyCertificateStorage {
    readonly $: 'AcademyCertificateStorage';
    config: CellRef<CertificateConfig>;
    ownerAddress: c.Address;
    authorityAddress: c.Address;
    revokedAt: uint32;
    content: c.Cell;
    tokenName: CellRef<TelegramString>;
}
export declare const AcademyCertificateStorage: {
    create(args: {
        config: CellRef<CertificateConfig>;
        ownerAddress: c.Address;
        authorityAddress: c.Address;
        revokedAt: uint32;
        content: c.Cell;
        tokenName: CellRef<TelegramString>;
    }): AcademyCertificateStorage;
    fromSlice(s: c.Slice): AcademyCertificateStorage;
    store(self: AcademyCertificateStorage, b: c.Builder): void;
    toCell(self: AcademyCertificateStorage): c.Cell;
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
export declare class AcademyCertificate implements c.Contract {
    static CodeCell: c.Cell;
    static Errors: {
        'Errors.WrongTopupComment': number;
        'Errors.UnknownOp': number;
        'Errors.Uninited': number;
        'Errors.ForbiddenNotDeploy': number;
        'Errors.SbtNonTransferable': number;
        'Errors.NotOwner': number;
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
    static fromAddress(address: c.Address): AcademyCertificate;
    static fromStorage(emptyStorage: {
        config: CellRef<CertificateConfig>;
    }, deployedOptions?: DeployedAddrOptions): AcademyCertificate;
    static createCellOfCertificateDeploy(body: {
        queryId: uint64;
        ownerAddress: c.Address;
        content: c.Cell;
        tokenName: CellRef<TelegramString>;
        sendExcessesTo: c.Address;
    }): c.Cell;
    static createCellOfTransfer(body: {
        queryId: uint64;
        rest: RemainingBitsAndRefs;
    }): c.Cell;
    static createCellOfGetStaticData(body: {
        queryId: uint64;
    }): c.Cell;
    static createCellOfProveOwnership(body: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }): c.Cell;
    static createCellOfRequestOwner(body: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }): c.Cell;
    static createCellOfTopUp(body: {
        comment: RemainingBitsAndRefs;
    }): c.Cell;
    sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions): Promise<void>;
    sendCertificateDeploy(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
        ownerAddress: c.Address;
        content: c.Cell;
        tokenName: CellRef<TelegramString>;
        sendExcessesTo: c.Address;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
        rest: RemainingBitsAndRefs;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendGetStaticData(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendProveOwnership(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendRequestOwner(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64;
        dest: c.Address;
        forwardPayload: c.Cell;
        withContent: boolean;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    sendTopUp(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        comment: RemainingBitsAndRefs;
    }, extraOptions?: ExtraSendOptions): Promise<void>;
    getNftData(provider: ContractProvider): Promise<NftDataReply>;
    getTelemintTokenName(provider: ContractProvider): Promise<TelegramString>;
    getAuthorityAddress(provider: ContractProvider): Promise<c.Address>;
    getRevokedTime(provider: ContractProvider): Promise<bigint>;
}
export {};
