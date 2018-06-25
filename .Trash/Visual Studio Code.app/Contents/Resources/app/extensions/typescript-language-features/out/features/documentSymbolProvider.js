"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const PConst = require("../protocol.const");
const typeConverters = require("../utils/typeConverters");
const getSymbolKind = (kind) => {
    switch (kind) {
        case PConst.Kind.module: return vscode_1.SymbolKind.Module;
        case PConst.Kind.class: return vscode_1.SymbolKind.Class;
        case PConst.Kind.enum: return vscode_1.SymbolKind.Enum;
        case PConst.Kind.interface: return vscode_1.SymbolKind.Interface;
        case PConst.Kind.memberFunction: return vscode_1.SymbolKind.Method;
        case PConst.Kind.memberVariable: return vscode_1.SymbolKind.Property;
        case PConst.Kind.memberGetAccessor: return vscode_1.SymbolKind.Property;
        case PConst.Kind.memberSetAccessor: return vscode_1.SymbolKind.Property;
        case PConst.Kind.variable: return vscode_1.SymbolKind.Variable;
        case PConst.Kind.const: return vscode_1.SymbolKind.Variable;
        case PConst.Kind.localVariable: return vscode_1.SymbolKind.Variable;
        case PConst.Kind.variable: return vscode_1.SymbolKind.Variable;
        case PConst.Kind.function: return vscode_1.SymbolKind.Function;
        case PConst.Kind.localFunction: return vscode_1.SymbolKind.Function;
    }
    return vscode_1.SymbolKind.Variable;
};
class TypeScriptDocumentSymbolProvider {
    constructor(client) {
        this.client = client;
    }
    async provideDocumentSymbols(resource, token) {
        const filepath = this.client.normalizePath(resource.uri);
        if (!filepath) {
            return [];
        }
        const args = {
            file: filepath
        };
        try {
            if (this.client.apiVersion.has206Features()) {
                const response = await this.client.execute('navtree', args, token);
                if (response.body) {
                    // The root represents the file. Ignore this when showing in the UI
                    const tree = response.body;
                    if (tree.childItems) {
                        const result = new Array();
                        tree.childItems.forEach(item => TypeScriptDocumentSymbolProvider.convertNavTree(resource.uri, result, item));
                        return result;
                    }
                }
            }
            else {
                const response = await this.client.execute('navbar', args, token);
                if (response.body) {
                    const result = new Array();
                    const foldingMap = Object.create(null);
                    response.body.forEach(item => TypeScriptDocumentSymbolProvider.convertNavBar(resource.uri, 0, foldingMap, result, item));
                    return result;
                }
            }
            return [];
        }
        catch (e) {
            return [];
        }
    }
    static convertNavBar(resource, indent, foldingMap, bucket, item, containerLabel) {
        const realIndent = indent + item.indent;
        const key = `${realIndent}|${item.text}`;
        if (realIndent !== 0 && !foldingMap[key] && TypeScriptDocumentSymbolProvider.shouldInclueEntry(item)) {
            const result = new vscode_1.SymbolInformation(item.text, getSymbolKind(item.kind), containerLabel ? containerLabel : '', typeConverters.Location.fromTextSpan(resource, item.spans[0]));
            foldingMap[key] = result;
            bucket.push(result);
        }
        if (item.childItems && item.childItems.length > 0) {
            for (const child of item.childItems) {
                TypeScriptDocumentSymbolProvider.convertNavBar(resource, realIndent + 1, foldingMap, bucket, child, item.text);
            }
        }
    }
    static convertNavTree(resource, bucket, item) {
        const symbolInfo = new vscode_1.SymbolInformation2(item.text, '', // todo@joh detail
        getSymbolKind(item.kind), typeConverters.Range.fromTextSpan(item.spans[0]), typeConverters.Location.fromTextSpan(resource, item.spans[0]));
        const hierarchy = new vscode_1.Hierarchy(symbolInfo);
        let shouldInclude = TypeScriptDocumentSymbolProvider.shouldInclueEntry(item);
        if (item.childItems) {
            for (const child of item.childItems) {
                const includedChild = TypeScriptDocumentSymbolProvider.convertNavTree(resource, hierarchy.children, child);
                shouldInclude = shouldInclude || includedChild;
            }
        }
        if (shouldInclude) {
            bucket.push(hierarchy);
        }
        return shouldInclude;
    }
    static shouldInclueEntry(item) {
        if (item.kind === PConst.Kind.alias) {
            return false;
        }
        return !!(item.text && item.text !== '<function>' && item.text !== '<class>');
    }
}
exports.default = TypeScriptDocumentSymbolProvider;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/documentSymbolProvider.js.map
