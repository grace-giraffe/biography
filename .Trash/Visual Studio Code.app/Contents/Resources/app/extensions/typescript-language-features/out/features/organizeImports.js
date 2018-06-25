"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nls = require("vscode-nls");
const typeconverts = require("../utils/typeConverters");
const localize = nls.loadMessageBundle(__filename);
class OrganizeImportsCommand {
    constructor(client) {
        this.client = client;
        this.id = OrganizeImportsCommand.Id;
    }
    async execute(file) {
        if (!this.client.apiVersion.has280Features()) {
            return false;
        }
        const args = {
            scope: {
                type: 'file',
                args: {
                    file
                }
            }
        };
        const response = await this.client.execute('organizeImports', args);
        if (!response || !response.success) {
            return false;
        }
        const edits = typeconverts.WorkspaceEdit.fromFromFileCodeEdits(this.client, response.body);
        return await vscode.workspace.applyEdit(edits);
    }
}
OrganizeImportsCommand.Id = '_typescript.organizeImports';
class OrganizeImportsCodeActionProvider {
    constructor(client, commandManager, fileConfigManager) {
        this.client = client;
        this.fileConfigManager = fileConfigManager;
        this.metadata = {
            providedCodeActionKinds: [vscode.CodeActionKind.SourceOrganizeImports]
        };
        commandManager.register(new OrganizeImportsCommand(client));
    }
    provideCodeActions(document, _range, _context, token) {
        if (!this.client.apiVersion.has280Features()) {
            return [];
        }
        const file = this.client.normalizePath(document.uri);
        if (!file) {
            return [];
        }
        this.fileConfigManager.ensureConfigurationForDocument(document, token);
        const action = new vscode.CodeAction(localize(0, null), vscode.CodeActionKind.SourceOrganizeImports);
        action.command = { title: '', command: OrganizeImportsCommand.Id, arguments: [file] };
        return [action];
    }
}
exports.OrganizeImportsCodeActionProvider = OrganizeImportsCodeActionProvider;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/organizeImports.js.map
