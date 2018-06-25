"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class DiagnosticSet {
    constructor() {
        this._map = Object.create(null);
    }
    set(file, diagnostics) {
        this._map[this.key(file)] = diagnostics;
    }
    get(file) {
        return this._map[this.key(file)] || [];
    }
    clear() {
        this._map = Object.create(null);
    }
    key(file) {
        return file.toString(true);
    }
}
exports.DiagnosticSet = DiagnosticSet;
var DiagnosticKind;
(function (DiagnosticKind) {
    DiagnosticKind[DiagnosticKind["Syntax"] = 0] = "Syntax";
    DiagnosticKind[DiagnosticKind["Semantic"] = 1] = "Semantic";
    DiagnosticKind[DiagnosticKind["Suggestion"] = 2] = "Suggestion";
})(DiagnosticKind = exports.DiagnosticKind || (exports.DiagnosticKind = {}));
const allDiagnosticKinds = [DiagnosticKind.Syntax, DiagnosticKind.Semantic, DiagnosticKind.Suggestion];
class DiagnosticsManager {
    constructor(owner) {
        this._diagnostics = new Map();
        this._pendingUpdates = Object.create(null);
        this._validate = true;
        this._enableSuggestions = true;
        this.updateDelay = 50;
        for (const kind of allDiagnosticKinds) {
            this._diagnostics.set(kind, new DiagnosticSet());
        }
        this._currentDiagnostics = vscode.languages.createDiagnosticCollection(owner);
    }
    dispose() {
        this._currentDiagnostics.dispose();
        for (const key of Object.keys(this._pendingUpdates)) {
            clearTimeout(this._pendingUpdates[key]);
            delete this._pendingUpdates[key];
        }
    }
    reInitialize() {
        this._currentDiagnostics.clear();
        for (const diagnosticSet of this._diagnostics.values()) {
            diagnosticSet.clear();
        }
    }
    set validate(value) {
        if (this._validate === value) {
            return;
        }
        this._validate = value;
        if (!value) {
            this._currentDiagnostics.clear();
        }
    }
    set enableSuggestions(value) {
        if (this._enableSuggestions === value) {
            return;
        }
        this._enableSuggestions = value;
        if (!value) {
            this._currentDiagnostics.clear();
        }
    }
    diagnosticsReceived(kind, file, diagnostics) {
        const collection = this._diagnostics.get(kind);
        if (!collection) {
            return;
        }
        if (diagnostics.length === 0) {
            const existing = collection.get(file);
            if (existing.length === 0) {
                // No need to update
                return;
            }
        }
        collection.set(file, diagnostics);
        this.scheduleDiagnosticsUpdate(file);
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this._currentDiagnostics.set(file, diagnostics);
    }
    delete(resource) {
        this._currentDiagnostics.delete(resource);
    }
    getDiagnostics(file) {
        return this._currentDiagnostics.get(file) || [];
    }
    scheduleDiagnosticsUpdate(file) {
        const key = file.fsPath;
        if (!this._pendingUpdates[key]) {
            this._pendingUpdates[key] = setTimeout(() => this.updateCurrentDiagnostics(file), this.updateDelay);
        }
    }
    updateCurrentDiagnostics(file) {
        if (this._pendingUpdates[file.fsPath]) {
            clearTimeout(this._pendingUpdates[file.fsPath]);
            delete this._pendingUpdates[file.fsPath];
        }
        if (!this._validate) {
            return;
        }
        const allDiagnostics = [
            ...this._diagnostics.get(DiagnosticKind.Syntax).get(file),
            ...this._diagnostics.get(DiagnosticKind.Semantic).get(file),
            ...this.getSuggestionDiagnostics(file),
        ];
        this._currentDiagnostics.set(file, allDiagnostics);
    }
    getSuggestionDiagnostics(file) {
        return this._diagnostics.get(DiagnosticKind.Suggestion).get(file).filter(x => {
            if (!this._enableSuggestions) {
                // Still show unused
                return x.customTags && x.customTags.indexOf(vscode.DiagnosticTag.Unnecessary) !== -1;
            }
            return true;
        });
    }
}
exports.DiagnosticsManager = DiagnosticsManager;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/features/diagnostics.js.map
