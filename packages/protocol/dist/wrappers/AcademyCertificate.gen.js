// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a AcademyCertificate contract in Tolk.
/* eslint-disable */
import * as c from '@ton/core';
import { beginCell } from '@ton/core';
function makeCellFrom(self, storeFn_T) {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}
function loadAndCheckPrefix32(s, expected, structName) {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}
function lookupPrefix(s, expected, prefixLen) {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}
function throwNonePrefixMatch(fieldPath) {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}
function storeCellRef(cell, b, storeFn_T) {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}
function loadCellRef(s, loadFn_T) {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}
function storeTolkRemaining(v, b) {
    b.storeSlice(v);
}
function loadTolkRemaining(s) {
    let rest = s.clone();
    s.loadBits(s.remainingBits);
    while (s.remainingRefs) {
        s.loadRef();
    }
    return rest;
}
function storeTolkNullable(v, b, storeFn_T) {
    if (v === null) {
        b.storeUint(0, 1);
    }
    else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}
// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//
class StackReader {
    tuple;
    constructor(tuple) {
        this.tuple = tuple;
    }
    static fromGetMethod(expectedN, getMethodResult) {
        let tuple = [];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }
    popExpecting(itemType) {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }
    popCellLike() {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }
    readBigInt() {
        return this.popExpecting('int').value;
    }
    readBoolean() {
        return this.popExpecting('int').value !== 0n;
    }
    readCell() {
        return this.popCellLike();
    }
    readSlice() {
        return this.popCellLike().beginParse();
    }
    readNullable(readFn_T) {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }
}
let customSerializersRegistry = new Map;
function ensureCustomSerializerRegistered(typeName) {
    if (!customSerializersRegistry.has(typeName)) {
        throw new Error(`Custom packToBuilder/unpackFromSlice was not registered for type 'AcademyCertificate.${typeName}'.\n(in Tolk code, they have custom logic \`fun ${typeName}__packToBuilder\`)\nSteps to fix:\n1) in your code, create and implement\n > function ${typeName}__packToBuilder(self: ${typeName}, b: Builder): void { ... }\n > function ${typeName}__unpackFromSlice(s: Slice): ${typeName} { ... }\n2) register them in advance by calling\n > AcademyCertificate.registerCustomPackUnpack('${typeName}', ${typeName}__packToBuilder, ${typeName}__unpackFromSlice);`);
    }
}
function invokeCustomPackToBuilder(typeName, self, b) {
    ensureCustomSerializerRegistered(typeName);
    customSerializersRegistry.get(typeName)[0](self, b);
}
function invokeCustomUnpackFromSlice(typeName, s) {
    ensureCustomSerializerRegistered(typeName);
    return customSerializersRegistry.get(typeName)[1](s);
}
export const NftDataReply = {
    create(args) {
        return {
            $: 'NftDataReply',
            ownerAddress: null,
            content: null,
            ...args
        };
    },
    fromSlice(s) {
        throw new Error(`Can't unpack 'NftDataReply' from cell, because 'NftDataReply.index' is 'int' (not int32/uint64/etc.)`);
    },
    store(self, b) {
        throw new Error(`Can't pack 'NftDataReply' to cell, because 'self.index' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self) {
        return makeCellFrom(self, NftDataReply.store);
    }
};
export const TopUp = {
    PREFIX: 0x00000000,
    create(args) {
        return {
            $: 'TopUp',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x00000000, 'TopUp');
        return {
            $: 'TopUp',
            comment: loadTolkRemaining(s),
        };
    },
    store(self, b) {
        b.storeUint(0x00000000, 32);
        storeTolkRemaining(self.comment, b);
    },
    toCell(self) {
        return makeCellFrom(self, TopUp.store);
    }
};
export const CertificateDeploy = {
    PREFIX: 0x47414344,
    create(args) {
        return {
            $: 'CertificateDeploy',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x47414344, 'CertificateDeploy');
        return {
            $: 'CertificateDeploy',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            content: s.loadRef(),
            tokenName: loadCellRef(s, TelegramString.fromSlice),
            sendExcessesTo: s.loadAddress(),
        };
    },
    store(self, b) {
        b.storeUint(0x47414344, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeRef(self.content);
        storeCellRef(self.tokenName, b, TelegramString.store);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self) {
        return makeCellFrom(self, CertificateDeploy.store);
    }
};
export const Transfer = {
    PREFIX: 0x5fcc3d14,
    create(args) {
        return {
            $: 'Transfer',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x5fcc3d14, 'Transfer');
        return {
            $: 'Transfer',
            queryId: s.loadUintBig(64),
            rest: loadTolkRemaining(s),
        };
    },
    store(self, b) {
        b.storeUint(0x5fcc3d14, 32);
        b.storeUint(self.queryId, 64);
        storeTolkRemaining(self.rest, b);
    },
    toCell(self) {
        return makeCellFrom(self, Transfer.store);
    }
};
export const GetStaticData = {
    PREFIX: 0x2fcb26a2,
    create(args) {
        return {
            $: 'GetStaticData',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x2fcb26a2, 'GetStaticData');
        return {
            $: 'GetStaticData',
            queryId: s.loadUintBig(64),
        };
    },
    store(self, b) {
        b.storeUint(0x2fcb26a2, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self) {
        return makeCellFrom(self, GetStaticData.store);
    }
};
export const ReportStaticData = {
    PREFIX: 0x8b771735,
    create(args) {
        return {
            $: 'ReportStaticData',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x8b771735, 'ReportStaticData');
        return {
            $: 'ReportStaticData',
            queryId: s.loadUintBig(64),
            index: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
        };
    },
    store(self, b) {
        b.storeUint(0x8b771735, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.index, 256);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self) {
        return makeCellFrom(self, ReportStaticData.store);
    }
};
export const ProveOwnership = {
    PREFIX: 0x04ded148,
    create(args) {
        return {
            $: 'ProveOwnership',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x04ded148, 'ProveOwnership');
        return {
            $: 'ProveOwnership',
            queryId: s.loadUintBig(64),
            dest: s.loadAddress(),
            forwardPayload: s.loadRef(),
            withContent: s.loadBoolean(),
        };
    },
    store(self, b) {
        b.storeUint(0x04ded148, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.dest);
        b.storeRef(self.forwardPayload);
        b.storeBit(self.withContent);
    },
    toCell(self) {
        return makeCellFrom(self, ProveOwnership.store);
    }
};
export const OwnershipProof = {
    PREFIX: 0x0524c7ae,
    create(args) {
        return {
            $: 'OwnershipProof',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x0524c7ae, 'OwnershipProof');
        return {
            $: 'OwnershipProof',
            queryId: s.loadUintBig(64),
            itemId: s.loadUintBig(256),
            owner: s.loadAddress(),
            data: s.loadRef(),
            revokedAt: s.loadUintBig(64),
            content: s.loadBoolean() ? s.loadRef() : null,
        };
    },
    store(self, b) {
        b.storeUint(0x0524c7ae, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.itemId, 256);
        b.storeAddress(self.owner);
        b.storeRef(self.data);
        b.storeUint(self.revokedAt, 64);
        storeTolkNullable(self.content, b, (v, b) => b.storeRef(v));
    },
    toCell(self) {
        return makeCellFrom(self, OwnershipProof.store);
    }
};
export const RequestOwner = {
    PREFIX: 0xd0c3bfea,
    create(args) {
        return {
            $: 'RequestOwner',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0xd0c3bfea, 'RequestOwner');
        return {
            $: 'RequestOwner',
            queryId: s.loadUintBig(64),
            dest: s.loadAddress(),
            forwardPayload: s.loadRef(),
            withContent: s.loadBoolean(),
        };
    },
    store(self, b) {
        b.storeUint(0xd0c3bfea, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.dest);
        b.storeRef(self.forwardPayload);
        b.storeBit(self.withContent);
    },
    toCell(self) {
        return makeCellFrom(self, RequestOwner.store);
    }
};
export const OwnerInfo = {
    PREFIX: 0x0dd607e3,
    create(args) {
        return {
            $: 'OwnerInfo',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x0dd607e3, 'OwnerInfo');
        return {
            $: 'OwnerInfo',
            queryId: s.loadUintBig(64),
            itemId: s.loadUintBig(256),
            initiator: s.loadAddress(),
            owner: s.loadAddress(),
            data: s.loadRef(),
            revokedAt: s.loadUintBig(64),
            content: s.loadBoolean() ? s.loadRef() : null,
        };
    },
    store(self, b) {
        b.storeUint(0x0dd607e3, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.itemId, 256);
        b.storeAddress(self.initiator);
        b.storeAddress(self.owner);
        b.storeRef(self.data);
        b.storeUint(self.revokedAt, 64);
        storeTolkNullable(self.content, b, (v, b) => b.storeRef(v));
    },
    toCell(self) {
        return makeCellFrom(self, OwnerInfo.store);
    }
};
export const Excesses = {
    PREFIX: 0xd53276db,
    create(args) {
        return {
            $: 'Excesses',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0xd53276db, 'Excesses');
        return {
            $: 'Excesses',
            queryId: s.loadUintBig(64),
        };
    },
    store(self, b) {
        b.storeUint(0xd53276db, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self) {
        return makeCellFrom(self, Excesses.store);
    }
};
export const TelegramString = {
    fromSlice(s) {
        return invokeCustomUnpackFromSlice('TelegramString', s);
    },
    store(self, b) {
        invokeCustomPackToBuilder('TelegramString', self, b);
    },
    toCell(self) {
        return makeCellFrom(self, TelegramString.store);
    }
};
export const CertificateConfig = {
    create(args) {
        return {
            $: 'CertificateConfig',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'CertificateConfig',
            index: s.loadUintBig(256),
            collectionAddress: s.loadAddress(),
        };
    },
    store(self, b) {
        b.storeUint(self.index, 256);
        b.storeAddress(self.collectionAddress);
    },
    toCell(self) {
        return makeCellFrom(self, CertificateConfig.store);
    }
};
export const CertificateStorageNotInitialized = {
    create(args) {
        return {
            $: 'CertificateStorageNotInitialized',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'CertificateStorageNotInitialized',
            config: loadCellRef(s, CertificateConfig.fromSlice),
        };
    },
    store(self, b) {
        storeCellRef(self.config, b, CertificateConfig.store);
    },
    toCell(self) {
        return makeCellFrom(self, CertificateStorageNotInitialized.store);
    }
};
export const AcademyCertificateStorage = {
    create(args) {
        return {
            $: 'AcademyCertificateStorage',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'AcademyCertificateStorage',
            config: loadCellRef(s, CertificateConfig.fromSlice),
            ownerAddress: s.loadAddress(),
            authorityAddress: s.loadAddress(),
            revokedAt: s.loadUintBig(32),
            content: s.loadRef(),
            tokenName: loadCellRef(s, TelegramString.fromSlice),
        };
    },
    store(self, b) {
        storeCellRef(self.config, b, CertificateConfig.store);
        b.storeAddress(self.ownerAddress);
        b.storeAddress(self.authorityAddress);
        b.storeUint(self.revokedAt, 32);
        b.storeRef(self.content);
        storeCellRef(self.tokenName, b, TelegramString.store);
    },
    toCell(self) {
        return makeCellFrom(self, AcademyCertificateStorage.store);
    }
};
function calculateDeployedAddress(code, data, options) {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();
    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }
    return new c.Address(options.workchain ?? 0, addrHash);
}
export class AcademyCertificate {
    static CodeCell = c.Cell.fromBase64('te6ccgECEQEAAqwAART/APSkE/S88sgLAQIBYgIDBPjQ+JGOT9csJ/////Tyv9dM0NcsICkmPXTy4NDTP9P/+kjU0z/0BNHtRND6SDDIz5AUkx66F8s/Fcv/E/pSzMs/9ADJyM+FCBL6UnHPC27MyYBC+wDg7UTQINdJ4wPU+kj6SDHTH9TUMdEk1ywiOgoaJOMC1ywi/mHopOMCBAUGBwIBIAsMALbU0SDQ0/8x+kgw+JIhxwXy4NIC1ywiOgoaJPLg0NM/+kjU1PpI0QXIzBP6UhX6Us+QAAAAAhTME8zJ7VSCCmJaAHL7AsjPhQj6UoIQ1TJ2288Ljss/yYEAgvsAAF41XwPQ0/8x+kgw+JLHBfLg1dM/+kgx+kgwyM+FCPpSghDVMnbbzwuOyz/JgEL7AAAG8sDmA+CJ1yeOMTVfA9AB1ws/AdP/+kgw+JLIz5It3FzWFMs/Esv/+lLJyM+FCBL6UnHPC27MyYBA+wDg1ywgJvaKROMC1ywmhh3/VOMCbEHXLCAAAAAEjhUxIItiN0b3B1cIxwUB10rAALDy4M/gMMcA8uDQCAkKAAgvyyaiAJo1+JIjxwXy4OcD0ATTP/pI1NcKAAfXC/9Qdm3jBMjPkBSTHroTyz8Vy/8T+lIUzBPLPxL0AMnIz4WIEvpSz4QQc/oCcc8LZczJgED7AACINQPQBNM/+kjU1woAB9cL//iSUIdt4wTIz5A3WB+OFMs/F8v/FfpSE/pSFMwTyz8S9ADJyM+FCBL6UnHPC27MyYBA+wACASANDgBbvH5/aiaBBrpM5qaOhp//0kGDgstrbw6n0kfSQY6Y+Y6moY6IFoaf/9JBg/oJpAApuPgu1E0NQx1DHXTNDTBwGqAtcY0YAgEgDxAAF7VjHaiaH0kGP0kGEAAdt7B9qJofSQY/SQY64WPw');
    static Errors = {
        'Errors.WrongTopupComment': 207,
        'Errors.UnknownOp': 208,
        'Errors.Uninited': 210,
        'Errors.ForbiddenNotDeploy': 213,
        'Errors.SbtNonTransferable': 230,
        'Errors.NotOwner': 231,
    };
    address;
    init;
    constructor(address, init) {
        this.address = address;
        this.init = init;
    }
    static registerCustomPackUnpack(typeName, packToBuilderFn, unpackFromSliceFn) {
        if (customSerializersRegistry.has(typeName)) {
            throw new Error(`Custom pack/unpack for 'AcademyCertificate.${typeName}' already registered`);
        }
        customSerializersRegistry.set(typeName, [packToBuilderFn, unpackFromSliceFn]);
    }
    static fromAddress(address) {
        return new AcademyCertificate(address);
    }
    static fromStorage(emptyStorage, deployedOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? AcademyCertificate.CodeCell,
            data: CertificateStorageNotInitialized.toCell(CertificateStorageNotInitialized.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new AcademyCertificate(address, initialState);
    }
    static createCellOfCertificateDeploy(body) {
        return CertificateDeploy.toCell(CertificateDeploy.create(body));
    }
    static createCellOfTransfer(body) {
        return Transfer.toCell(Transfer.create(body));
    }
    static createCellOfGetStaticData(body) {
        return GetStaticData.toCell(GetStaticData.create(body));
    }
    static createCellOfProveOwnership(body) {
        return ProveOwnership.toCell(ProveOwnership.create(body));
    }
    static createCellOfRequestOwner(body) {
        return RequestOwner.toCell(RequestOwner.create(body));
    }
    static createCellOfTopUp(body) {
        return TopUp.toCell(TopUp.create(body));
    }
    async sendDeploy(provider, via, msgValue, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }
    async sendCertificateDeploy(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CertificateDeploy.toCell(CertificateDeploy.create(body)),
            ...extraOptions
        });
    }
    async sendTransfer(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Transfer.toCell(Transfer.create(body)),
            ...extraOptions
        });
    }
    async sendGetStaticData(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: GetStaticData.toCell(GetStaticData.create(body)),
            ...extraOptions
        });
    }
    async sendProveOwnership(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ProveOwnership.toCell(ProveOwnership.create(body)),
            ...extraOptions
        });
    }
    async sendRequestOwner(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestOwner.toCell(RequestOwner.create(body)),
            ...extraOptions
        });
    }
    async sendTopUp(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUp.toCell(TopUp.create(body)),
            ...extraOptions
        });
    }
    async getNftData(provider) {
        const r = StackReader.fromGetMethod(5, await provider.get('get_nft_data', []));
        return ({
            $: 'NftDataReply',
            isInitialized: r.readBoolean(),
            index: r.readBigInt(),
            collectionAddress: r.readSlice().loadAddress(),
            ownerAddress: r.readNullable((r) => r.readSlice().loadAddress()),
            content: r.readNullable((r) => r.readCell()),
        });
    }
    async getTelemintTokenName(provider) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_telemint_token_name', []));
        return r.readSlice();
    }
    async getAuthorityAddress(provider) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_authority_address', []));
        return r.readSlice().loadAddress();
    }
    async getRevokedTime(provider) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_revoked_time', []));
        return r.readBigInt();
    }
}
