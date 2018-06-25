"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Previewer = require("../utils/previewer");
const typeConverters = require("../utils/typeConverters");
class TypeScriptSignatureHelpProvider {
    constructor(client) {
        this.client = client;
    }
    async provideSignatureHelp(document, position, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return undefined;
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
        let info = undefined;
        try {
            const response = await this.client.execute('signatureHelp', args, token);
            info = response.body;
            if (!info) {
                return undefined;
            }
        }
        catch (_a) {
            return undefined;
        }
        const result = new vscode.SignatureHelp();
        result.activeSignature = info.selectedItemIndex;
        result.activeParameter = this.getActiveParmeter(info);
        result.signatures = info.items.map(signature => this.convertSignature(signature));
        return result;
    }
    getActiveParmeter(info) {
        const activeSignature = info.items[info.selectedItemIndex];
        if (activeSignature && activeSignature.isVariadic) {
            return Math.min(info.argumentIndex, activeSignature.parameters.length - 1);
        }
        return info.argumentIndex;
    }
    convertSignature(item) {
        const signature = new vscode.SignatureInformation(Previewer.plain(item.prefixDisplayParts), Previewer.markdownDocumentation(item.documentation, item.tags.filter(x => x.name !== 'param')));
        signature.parameters = item.parameters.map(p => new vscode.ParameterInformation(Previewer.plain(p.displayParts), Previewer.markdownDocumentation(p.documentation, [])));
        signature.label += signature.parameters.map(parameter => parameter.label).join(Previewer.plain(item.separatorDisplayParts));
        signature.label += Previewer.plain(item.suffixDisplayParts);
        return signature;
    }
}
TypeScriptSignatureHelpProvider.triggerCharacters = ['(', ',', '<'];
exports.default = TypeScriptSignatureHelpProvider;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/signatureHelpProvider.js.map
