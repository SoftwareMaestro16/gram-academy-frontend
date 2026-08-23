// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a AcademyCollection contract in Tolk.
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
function storeTolkBitsN(v, nBits, b) {
    if (v.remainingBits !== nBits) {
        throw new Error(`expected ${nBits} bits, got ${v.remainingBits}`);
    }
    if (v.remainingRefs !== 0) {
        throw new Error(`expected 0 refs, got ${v.remainingRefs}`);
    }
    b.storeSlice(v);
}
function loadTolkBitsN(s, nBits) {
    return new c.Slice(new c.BitReader(s.loadBits(nBits)), []);
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
        throw new Error(`Custom packToBuilder/unpackFromSlice was not registered for type 'AcademyCollection.${typeName}'.\n(in Tolk code, they have custom logic \`fun ${typeName}__packToBuilder\`)\nSteps to fix:\n1) in your code, create and implement\n > function ${typeName}__packToBuilder(self: ${typeName}, b: Builder): void { ... }\n > function ${typeName}__unpackFromSlice(s: Slice): ${typeName} { ... }\n2) register them in advance by calling\n > AcademyCollection.registerCustomPackUnpack('${typeName}', ${typeName}__packToBuilder, ${typeName}__unpackFromSlice);`);
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
export const CollectionDataReply = {
    create(args) {
        return {
            $: 'CollectionDataReply',
            ...args
        };
    },
    fromSlice(s) {
        throw new Error(`Can't unpack 'CollectionDataReply' from cell, because 'CollectionDataReply.nextItemIndex' is 'int' (not int32/uint64/etc.)`);
    },
    store(self, b) {
        throw new Error(`Can't pack 'CollectionDataReply' to cell, because 'self.nextItemIndex' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self) {
        return makeCellFrom(self, CollectionDataReply.store);
    }
};
export const CollectionConfigReply = {
    create(args) {
        return {
            $: 'CollectionConfigReply',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'CollectionConfigReply',
            adminAddress: s.loadAddress(),
            backendPublicKey: s.loadUintBig(256),
            subwalletId: s.loadUintBig(32),
        };
    },
    store(self, b) {
        b.storeAddress(self.adminAddress);
        b.storeUint(self.backendPublicKey, 256);
        b.storeUint(self.subwalletId, 32);
    },
    toCell(self) {
        return makeCellFrom(self, CollectionConfigReply.store);
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
export const AskToDeployItem = {
    PREFIX: 0x4637289b,
    create(args) {
        return {
            $: 'AskToDeployItem',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x4637289b, 'AskToDeployItem');
        return {
            $: 'AskToDeployItem',
            signature: loadTolkBitsN(s, 512),
            signedData: loadCellRef(s, SignedCertificateMint.fromSlice),
        };
    },
    store(self, b) {
        b.storeUint(0x4637289b, 32);
        storeTolkBitsN(self.signature, 512, b);
        storeCellRef(self.signedData, b, SignedCertificateMint.store);
    },
    toCell(self) {
        return makeCellFrom(self, AskToDeployItem.store);
    }
};
export const SignedCertificateMint = {
    create(args) {
        return {
            $: 'SignedCertificateMint',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'SignedCertificateMint',
            subwalletId: s.loadUintBig(32),
            validSince: s.loadUintBig(32),
            validTill: s.loadUintBig(32),
            tokenName: TelegramString.fromSlice(s),
            ownerAddress: s.loadAddress(),
            referrerAddress: s.loadMaybeAddress(),
            content: s.loadRef(),
        };
    },
    store(self, b) {
        b.storeUint(self.subwalletId, 32);
        b.storeUint(self.validSince, 32);
        b.storeUint(self.validTill, 32);
        TelegramString.store(self.tokenName, b);
        b.storeAddress(self.ownerAddress);
        b.storeAddress(self.referrerAddress);
        b.storeRef(self.content);
    },
    toCell(self) {
        return makeCellFrom(self, SignedCertificateMint.store);
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
export const WithdrawCollectionBalance = {
    PREFIX: 0x57434f4c,
    create(args) {
        return {
            $: 'WithdrawCollectionBalance',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x57434f4c, 'WithdrawCollectionBalance');
        return {
            $: 'WithdrawCollectionBalance',
            queryId: s.loadUintBig(64),
            destination: s.loadAddress(),
        };
    },
    store(self, b) {
        b.storeUint(0x57434f4c, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.destination);
    },
    toCell(self) {
        return makeCellFrom(self, WithdrawCollectionBalance.store);
    }
};
export const CollectionRevenueWithdrawn = {
    PREFIX: 0x43524457,
    create(args) {
        return {
            $: 'CollectionRevenueWithdrawn',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x43524457, 'CollectionRevenueWithdrawn');
        return {
            $: 'CollectionRevenueWithdrawn',
            queryId: s.loadUintBig(64),
        };
    },
    store(self, b) {
        b.storeUint(0x43524457, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self) {
        return makeCellFrom(self, CollectionRevenueWithdrawn.store);
    }
};
export const ReferralPayout = {
    PREFIX: 0x52454650,
    create(args) {
        return {
            $: 'ReferralPayout',
            ...args
        };
    },
    fromSlice(s) {
        loadAndCheckPrefix32(s, 0x52454650, 'ReferralPayout');
        return {
            $: 'ReferralPayout',
            queryId: s.loadUintBig(64),
        };
    },
    store(self, b) {
        b.storeUint(0x52454650, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self) {
        return makeCellFrom(self, ReferralPayout.store);
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
export const AcademyCollectionStorage = {
    create(args) {
        return {
            $: 'AcademyCollectionStorage',
            ...args
        };
    },
    fromSlice(s) {
        return {
            $: 'AcademyCollectionStorage',
            adminAddress: s.loadAddress(),
            backendPublicKey: s.loadUintBig(256),
            subwalletId: s.loadUintBig(32),
            content: s.loadRef(),
        };
    },
    store(self, b) {
        b.storeAddress(self.adminAddress);
        b.storeUint(self.backendPublicKey, 256);
        b.storeUint(self.subwalletId, 32);
        b.storeRef(self.content);
    },
    toCell(self) {
        return makeCellFrom(self, AcademyCollectionStorage.store);
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
export class AcademyCollection {
    static CodeCell = c.Cell.fromBase64('te6ccgECIAEABM0AART/APSkE/S88sgLAQIBYgIDAeDQ+JHyQCDXLCAAAAAEjhUxIItiN0b3B1cIxwUB10rAALDy4M/g1ywiMblE3OMC1ywiuhp6ZI4yMe1E0PpIMPiSxwXy4OiCCvrwgHL7AtM/+kgwyM+FCPpSghBDUkRXzwuOyz/JgQCC+wDgMMcA8uDQBAIBIAcIAf4x7UTQAYMI1xjXTCD5AAP6SDHT/9cLH0Qz+RDy4MoB0NMf0x/TH9MHAaoC1xj6SPpQ1NFQdrry4Mv4I1FEufLgzFq58uDN+JIhxwXy4OD4l4IQCPDRgL7y4M4g+kQw8tFNI26zIJck+kQw8tFN3oIQBo53gCGCCvrwgHDjBKF0BQL++wKOMoIK+vCAyM+FCBX6UlAE+gKNBkAAAAAAAAAAAAAAAAACkioygAAAAAAAAAAEzxbJc/sAkTPiIPkC+CiIAsjL//pSycjMycgj10mrAs8LBxPOySTIi8R0FDRAAAAAAAAAAAjPFvpSFMwTzBP6UsnIz4kIAV3Iz4TQzMz5Fg8GACbPC/+BAI3PC3QSzBLMzMmDBvsAAgEgCQoCASALDAAHuLXTGAFDuno/goiALIy//6UsnIzMkByM+E0MzM+RbIz4oAQMv/z1CA8CASANDgFHuQ5vkC+CiIAsjL//pSycjMyQHIz4TQzMz5FsjPigBAy//PUIDwAVtgt9qJoa6Y/gLbAAGbTaXaiaH0kaf/rhY/ABFP8A9KQT9LzyyAsQAgFiERIE+ND4kY5P1ywn////9PK/10zQ1ywgKSY9dPLg0NM/0//6SNTTP/QE0e1E0PpIMMjPkBSTHroXyz8Vy/8T+lLMyz/0AMnIz4UIEvpScc8LbszJgEL7AODtRNAg10njA9T6SPpIMdMf1NQx0STXLCI6Chok4wLXLCL+Yeik4wITFBUWAgEgGhsAttTRINDT/zH6SDD4kiHHBfLg0gLXLCI6Chok8uDQ0z/6SNTU+kjRBcjME/pSFfpSz5AAAAACFMwTzMntVIIKYloAcvsCyM+FCPpSghDVMnbbzwuOyz/JgQCC+wAAXjVfA9DT/zH6SDD4kscF8uDV0z/6SDH6SDDIz4UI+lKCENUydtvPC47LP8mAQvsAAAbywOYD4InXJ44xNV8D0AHXCz8B0//6SDD4ksjPki3cXNYUyz8Sy//6UsnIz4UIEvpScc8LbszJgED7AODXLCAm9opE4wLXLCaGHf9U4wJsQdcsIAAAAASOFTEgi2I3RvcHVwjHBQHXSsAAsPLgz+AwxwDy4NAXGBkACC/LJqIAmjX4kiPHBfLg5wPQBNM/+kjU1woAB9cL/1B2beMEyM+QFJMeuhPLPxXL/xP6UhTME8s/EvQAycjPhYgS+lLPhBBz+gJxzwtlzMmAQPsAAIg1A9AE0z/6SNTXCgAH1wv/+JJQh23jBMjPkDdYH44Uyz8Xy/8V+lIT+lIUzBPLPxL0AMnIz4UIEvpScc8LbszJgED7AAIBIBwdAFu8fn9qJoEGukzmpo6Gn//SQYOCy2tvDqfSR9JBjpj5jqahjogWhp//0kGD+gmkACm4+C7UTQ1DHUMddM0NMHAaoC1xjRgCASAeHwAXtWMdqJofSQY/SQYQAB23sH2omh9JBj9JBjrhY/A=');
    static Errors = {
        'Errors.InvalidSignature': 202,
        'Errors.WrongSubwalletId': 203,
        'Errors.NotYetValidSignature': 204,
        'Errors.ExpiredSignature': 205,
        'Errors.NotEnoughFunds': 206,
        'Errors.WrongTopupComment': 207,
        'Errors.UnknownOp': 208,
        'Errors.InvalidSender': 224,
        'Errors.UnauthorizedAdmin': 232,
        'Errors.IncorrectWorkchain': 333,
    };
    address;
    init;
    constructor(address, init) {
        this.address = address;
        this.init = init;
    }
    static registerCustomPackUnpack(typeName, packToBuilderFn, unpackFromSliceFn) {
        if (customSerializersRegistry.has(typeName)) {
            throw new Error(`Custom pack/unpack for 'AcademyCollection.${typeName}' already registered`);
        }
        customSerializersRegistry.set(typeName, [packToBuilderFn, unpackFromSliceFn]);
    }
    static fromAddress(address) {
        return new AcademyCollection(address);
    }
    static fromStorage(emptyStorage, deployedOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? AcademyCollection.CodeCell,
            data: AcademyCollectionStorage.toCell(AcademyCollectionStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new AcademyCollection(address, initialState);
    }
    static createCellOfTopUp(body) {
        return TopUp.toCell(TopUp.create(body));
    }
    static createCellOfAskToDeployItem(body) {
        return AskToDeployItem.toCell(AskToDeployItem.create(body));
    }
    static createCellOfWithdrawCollectionBalance(body) {
        return WithdrawCollectionBalance.toCell(WithdrawCollectionBalance.create(body));
    }
    async sendDeploy(provider, via, msgValue, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
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
    async sendAskToDeployItem(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToDeployItem.toCell(AskToDeployItem.create(body)),
            ...extraOptions
        });
    }
    async sendWithdrawCollectionBalance(provider, via, msgValue, body, extraOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: WithdrawCollectionBalance.toCell(WithdrawCollectionBalance.create(body)),
            ...extraOptions
        });
    }
    async getCollectionData(provider) {
        const r = StackReader.fromGetMethod(3, await provider.get('get_collection_data', []));
        return ({
            $: 'CollectionDataReply',
            nextItemIndex: r.readBigInt(),
            collectionContent: r.readCell(),
            ownerAddress: r.readNullable((r) => r.readSlice().loadAddress()),
        });
    }
    async getNftAddressByIndex(provider, index) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_nft_address_by_index', [
            { type: 'int', value: index },
        ]));
        return r.readSlice().loadAddress();
    }
    async getNftAddressByTokenName(provider, tokenName) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_nft_address_by_token_name', [
            { type: 'slice', cell: beginCell().storeSlice(tokenName).endCell() },
        ]));
        return r.readSlice().loadAddress();
    }
    async getNftContent(provider, _index, individualNftContent) {
        const r = StackReader.fromGetMethod(1, await provider.get('get_nft_content', [
            { type: 'int', value: _index },
            { type: 'cell', cell: individualNftContent },
        ]));
        return r.readCell();
    }
    async getAcademyCollectionConfig(provider) {
        const r = StackReader.fromGetMethod(3, await provider.get('academy_collection_config', []));
        return ({
            $: 'CollectionConfigReply',
            adminAddress: r.readSlice().loadAddress(),
            backendPublicKey: r.readBigInt(),
            subwalletId: r.readBigInt(),
        });
    }
}
