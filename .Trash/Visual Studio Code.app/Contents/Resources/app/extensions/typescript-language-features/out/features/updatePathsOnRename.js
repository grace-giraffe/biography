"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const nls = require("vscode-nls");
const languageIds = require("../utils/languageModeIds");
const typeConverters = require("../utils/typeConverters");
const localize = nls.loadMessageBundle(__filename);
const updateImportsOnFileMoveName = 'updateImportsOnFileMove.enabled';
var UpdateImportsOnFileMoveSetting;
(function (UpdateImportsOnFileMoveSetting) {
    UpdateImportsOnFileMoveSetting["Prompt"] = "prompt";
    UpdateImportsOnFileMoveSetting["Always"] = "always";
    UpdateImportsOnFileMoveSetting["Never"] = "never";
})(UpdateImportsOnFileMoveSetting || (UpdateImportsOnFileMoveSetting = {}));
class UpdateImportsOnFileRenameHandler {
    constructor(client, bufferSyncSupport, fileConfigurationManager, handles) {
        this.client = client;
        this.bufferSyncSupport = bufferSyncSupport;
        this.fileConfigurationManager = fileConfigurationManager;
        this.handles = handles;
        this._onDidRenameSub = vscode.workspace.onDidRenameResource(e => {
            this.doRename(e.oldResource, e.newResource);
        });
    }
    dispose() {
        this._onDidRenameSub.dispose();
    }
    async doRename(oldResource, newResource) {
        if (!this.client.apiVersion.has290Features()) {
            return;
        }
        if (!await this.handles(newResource)) {
            return;
        }
        const newFile = this.client.normalizePath(newResource);
        if (!newFile) {
            return;
        }
        const oldFile = this.client.normalizePath(oldResource);
        if (!oldFile) {
            return;
        }
        const document = await vscode.workspace.openTextDocument(newResource);
        const config = this.getConfiguration(document);
        const setting = config.get(updateImportsOnFileMoveName);
        if (setting === UpdateImportsOnFileMoveSetting.Never) {
            return;
        }
        // Make sure TS knows about file
        this.bufferSyncSupport.closeResource(oldResource);
        this.bufferSyncSupport.openTextDocument(document);
        const edits = await this.getEditsForFileRename(document, oldFile, newFile);
        if (!edits || !edits.size) {
            return;
        }
        if (await this.confirmActionWithUser(document)) {
            await vscode.workspace.applyEdit(edits);
        }
    }
    async confirmActionWithUser(newDocument) {
        const config = this.getConfiguration(newDocument);
        const setting = config.get(updateImportsOnFileMoveName);
        switch (setting) {
            case UpdateImportsOnFileMoveSetting.Always:
                return true;
            case UpdateImportsOnFileMoveSetting.Never:
                return false;
            case UpdateImportsOnFileMoveSetting.Prompt:
            default:
                return this.promptUser(newDocument);
        }
    }
    getConfiguration(newDocument) {
        return vscode.workspace.getConfiguration(isTypeScriptDocument(newDocument) ? 'typescript' : 'javascript', newDocument.uri);
    }
    async promptUser(newDocument) {
        let Choice;
        (function (Choice) {
            Choice[Choice["None"] = 0] = "None";
            Choice[Choice["Accept"] = 1] = "Accept";
            Choice[Choice["Reject"] = 2] = "Reject";
            Choice[Choice["Always"] = 3] = "Always";
            Choice[Choice["Never"] = 4] = "Never";
        })(Choice || (Choice = {}));
        const response = await vscode.window.showInformationMessage(localize(0, null, path.basename(newDocument.fileName)), {
            modal: true,
        }, {
            title: localize(1, null),
            choice: Choice.Reject,
            isCloseAffordance: true,
        }, {
            title: localize(2, null),
            choice: Choice.Accept,
        }, {
            title: localize(3, null),
            choice: Choice.Always,
        }, {
            title: localize(4, null),
            choice: Choice.Never,
        });
        if (!response) {
            return false;
        }
        switch (response.choice) {
            case Choice.Accept:
                {
                    return true;
                }
            case Choice.Reject:
                {
                    return false;
                }
            case Choice.Always:
                {
                    const config = this.getConfiguration(newDocument);
                    config.update(updateImportsOnFileMoveName, UpdateImportsOnFileMoveSetting.Always, vscode.ConfigurationTarget.Global);
                    return true;
                }
            case Choice.Never:
                {
                    const config = this.getConfiguration(newDocument);
                    config.update(updateImportsOnFileMoveName, UpdateImportsOnFileMoveSetting.Never, vscode.ConfigurationTarget.Global);
                    return false;
                }
        }
        return false;
    }
    async getEditsForFileRename(document, oldFile, newFile) {
        await this.fileConfigurationManager.ensureConfigurationForDocument(document, undefined);
        const args = {
            file: newFile,
            oldFilePath: oldFile,
            newFilePath: newFile,
        };
        const response = await this.client.execute('getEditsForFileRename', args);
        if (!response || !response.body) {
            return;
        }
        return typeConverters.WorkspaceEdit.fromFromFileCodeEdits(this.client, response.body);
    }
}
exports.UpdateImportsOnFileRenameHandler = UpdateImportsOnFileRenameHandler;
function isTypeScriptDocument(document) {
    return document.languageId === languageIds.typescript || document.languageId === languageIds.typescriptreact;
}
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/updatePathsOnRename.js.map
