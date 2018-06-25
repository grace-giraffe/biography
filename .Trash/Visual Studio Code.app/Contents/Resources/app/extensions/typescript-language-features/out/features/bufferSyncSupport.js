"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode_1 = require("vscode");
const async_1 = require("../utils/async");
const dispose_1 = require("../utils/dispose");
const languageModeIds = require("../utils/languageModeIds");
function mode2ScriptKind(mode) {
    switch (mode) {
        case languageModeIds.typescript: return 'TS';
        case languageModeIds.typescriptreact: return 'TSX';
        case languageModeIds.javascript: return 'JS';
        case languageModeIds.javascriptreact: return 'JSX';
    }
    return undefined;
}
class SyncedBuffer {
    constructor(document, filepath, diagnosticRequestor, client) {
        this.document = document;
        this.filepath = filepath;
        this.diagnosticRequestor = diagnosticRequestor;
        this.client = client;
    }
    open() {
        const args = {
            file: this.filepath,
            fileContent: this.document.getText(),
        };
        if (this.client.apiVersion.has203Features()) {
            const scriptKind = mode2ScriptKind(this.document.languageId);
            if (scriptKind) {
                args.scriptKindName = scriptKind;
            }
        }
        if (this.client.apiVersion.has230Features()) {
            args.projectRootPath = this.client.getWorkspaceRootForResource(this.document.uri);
        }
        if (this.client.apiVersion.has240Features()) {
            const tsPluginsForDocument = this.client.plugins
                .filter(x => x.languages.indexOf(this.document.languageId) >= 0);
            if (tsPluginsForDocument.length) {
                args.plugins = tsPluginsForDocument.map(plugin => plugin.name);
            }
        }
        this.client.execute('open', args, false);
    }
    get lineCount() {
        return this.document.lineCount;
    }
    close() {
        const args = {
            file: this.filepath
        };
        this.client.execute('close', args, false);
    }
    onContentChanged(events) {
        const filePath = this.client.normalizePath(this.document.uri);
        if (!filePath) {
            return;
        }
        for (const { range, text } of events) {
            const args = {
                file: filePath,
                line: range.start.line + 1,
                offset: range.start.character + 1,
                endLine: range.end.line + 1,
                endOffset: range.end.character + 1,
                insertString: text
            };
            this.client.execute('change', args, false);
        }
        this.diagnosticRequestor.requestDiagnostic(this.document.uri);
    }
}
class SyncedBufferMap {
    constructor(_normalizePath) {
        this._normalizePath = _normalizePath;
        this._map = new Map();
    }
    has(resource) {
        const file = this._normalizePath(resource);
        return !!file && this._map.has(file);
    }
    get(resource) {
        const file = this._normalizePath(resource);
        return file ? this._map.get(file) : undefined;
    }
    set(resource, buffer) {
        const file = this._normalizePath(resource);
        if (file) {
            this._map.set(file, buffer);
        }
    }
    delete(resource) {
        const file = this._normalizePath(resource);
        if (file) {
            this._map.delete(file);
        }
    }
    get allBuffers() {
        return this._map.values();
    }
    get allResources() {
        return this._map.keys();
    }
}
class BufferSyncSupport {
    constructor(client, modeIds, diagnostics, validate) {
        this.disposables = [];
        this.pendingDiagnostics = new Map();
        this.client = client;
        this.modeIds = new Set(modeIds);
        this.diagnostics = diagnostics;
        this._validate = validate;
        this.diagnosticDelayer = new async_1.Delayer(300);
        this.syncedBuffers = new SyncedBufferMap(path => this.client.normalizePath(path));
    }
    listen() {
        vscode_1.workspace.onDidOpenTextDocument(this.openTextDocument, this, this.disposables);
        vscode_1.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, this.disposables);
        vscode_1.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, this.disposables);
        vscode_1.workspace.textDocuments.forEach(this.openTextDocument, this);
    }
    set validate(value) {
        this._validate = value;
    }
    handles(resource) {
        return this.syncedBuffers.has(resource);
    }
    reOpenDocuments() {
        for (const buffer of this.syncedBuffers.allBuffers) {
            buffer.open();
        }
    }
    dispose() {
        dispose_1.disposeAll(this.disposables);
    }
    openTextDocument(document) {
        if (!this.modeIds.has(document.languageId)) {
            return;
        }
        const resource = document.uri;
        const filepath = this.client.normalizePath(resource);
        if (!filepath) {
            return;
        }
        if (this.syncedBuffers.has(resource)) {
            return;
        }
        const syncedBuffer = new SyncedBuffer(document, filepath, this, this.client);
        this.syncedBuffers.set(resource, syncedBuffer);
        syncedBuffer.open();
        this.requestDiagnostic(resource);
    }
    closeResource(resource) {
        const syncedBuffer = this.syncedBuffers.get(resource);
        if (!syncedBuffer) {
            return;
        }
        this.syncedBuffers.delete(resource);
        syncedBuffer.close();
        if (!fs.existsSync(resource.fsPath)) {
            this.diagnostics.delete(resource);
            this.requestAllDiagnostics();
        }
    }
    onDidCloseTextDocument(document) {
        this.closeResource(document.uri);
    }
    onDidChangeTextDocument(e) {
        const syncedBuffer = this.syncedBuffers.get(e.document.uri);
        if (syncedBuffer) {
            syncedBuffer.onContentChanged(e.contentChanges);
            if (this.pendingGetErr) {
                this.pendingGetErr.token.cancel();
                this.pendingGetErr = undefined;
            }
        }
    }
    requestAllDiagnostics() {
        if (!this._validate) {
            return;
        }
        for (const filePath of this.syncedBuffers.allResources) {
            this.pendingDiagnostics.set(filePath, Date.now());
        }
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, 200);
    }
    getErr(resources) {
        const handledResources = resources.filter(resource => this.handles(resource));
        if (!handledResources.length) {
            return;
        }
        for (const resource of handledResources) {
            const file = this.client.normalizePath(resource);
            if (file) {
                this.pendingDiagnostics.set(file, Date.now());
            }
        }
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, 200);
    }
    requestDiagnostic(resource) {
        if (!this._validate) {
            return;
        }
        const file = this.client.normalizePath(resource);
        if (!file) {
            return;
        }
        this.pendingDiagnostics.set(file, Date.now());
        const buffer = this.syncedBuffers.get(resource);
        let delay = 300;
        if (buffer) {
            const lineCount = buffer.lineCount;
            delay = Math.min(Math.max(Math.ceil(lineCount / 20), 300), 800);
        }
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, delay);
    }
    hasPendingDiagnostics(resource) {
        const file = this.client.normalizePath(resource);
        return !file || this.pendingDiagnostics.has(file);
    }
    sendPendingDiagnostics() {
        if (!this._validate) {
            return;
        }
        const files = new Set(Array.from(this.pendingDiagnostics.entries())
            .sort((a, b) => a[1] - b[1])
            .map(entry => entry[0]));
        // Add all open TS buffers to the geterr request. They might be visible
        for (const file of this.syncedBuffers.allResources) {
            if (!this.pendingDiagnostics.get(file)) {
                files.add(file);
            }
        }
        if (this.pendingGetErr) {
            for (const file of this.pendingGetErr.files) {
                files.add(file);
            }
        }
        if (files.size) {
            const fileList = Array.from(files);
            const args = {
                delay: 0,
                files: fileList
            };
            const token = new vscode_1.CancellationTokenSource();
            const getErr = this.pendingGetErr = {
                request: this.client.executeAsync('geterr', args, token.token)
                    .then(undefined, () => { })
                    .then(() => {
                    if (this.pendingGetErr === getErr) {
                        this.pendingGetErr = undefined;
                    }
                }),
                files: fileList,
                token
            };
        }
        this.pendingDiagnostics.clear();
    }
}
exports.default = BufferSyncSupport;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/bufferSyncSupport.js.map
