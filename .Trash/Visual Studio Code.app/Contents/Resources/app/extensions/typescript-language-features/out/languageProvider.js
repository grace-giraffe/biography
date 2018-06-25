"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path_1 = require("path");
const bufferSyncSupport_1 = require("./features/bufferSyncSupport");
const fileConfigurationManager_1 = require("./features/fileConfigurationManager");
const languageConfigurations = require("./utils/languageConfigurations");
const diagnostics_1 = require("./features/diagnostics");
const fileSchemes = require("./utils/fileSchemes");
const baseCodeLensProvider_1 = require("./features/baseCodeLensProvider");
const memoize_1 = require("./utils/memoize");
const dispose_1 = require("./utils/dispose");
const updatePathsOnRename_1 = require("./features/updatePathsOnRename");
const validateSetting = 'validate.enable';
const suggestionSetting = 'suggestionActions.enabled';
const foldingSetting = 'typescript.experimental.syntaxFolding';
class LanguageProvider {
    constructor(client, description, commandManager, telemetryReporter, typingsStatus) {
        this.client = client;
        this.description = description;
        this.commandManager = commandManager;
        this.telemetryReporter = telemetryReporter;
        this.toUpdateOnConfigurationChanged = [];
        this._validate = true;
        this._enableSuggestionDiagnostics = true;
        this.disposables = [];
        this.versionDependentDisposables = [];
        this.foldingProviderRegistration = void 0;
        this.fileConfigurationManager = new fileConfigurationManager_1.default(client);
        this.bufferSyncSupport = new bufferSyncSupport_1.default(client, description.modeIds, {
            delete: (resource) => {
                this.diagnosticsManager.delete(resource);
            }
        }, this._validate);
        this.diagnosticsManager = new diagnostics_1.DiagnosticsManager(description.diagnosticOwner);
        vscode_1.workspace.onDidChangeConfiguration(this.configurationChanged, this, this.disposables);
        this.configurationChanged();
        client.onReady(async () => {
            await this.registerProviders(client, commandManager, typingsStatus);
            this.bufferSyncSupport.listen();
        });
        this.renameHandler = new updatePathsOnRename_1.UpdateImportsOnFileRenameHandler(this.client, this.bufferSyncSupport, this.fileConfigurationManager, async (uri) => {
            try {
                const doc = await vscode_1.workspace.openTextDocument(uri);
                return this.handles(uri, doc);
            }
            catch (_a) {
                return false;
            }
        });
    }
    dispose() {
        dispose_1.disposeAll(this.disposables);
        dispose_1.disposeAll(this.versionDependentDisposables);
        this.diagnosticsManager.dispose();
        this.bufferSyncSupport.dispose();
        this.fileConfigurationManager.dispose();
        this.renameHandler.dispose();
    }
    get documentSelector() {
        const documentSelector = [];
        for (const language of this.description.modeIds) {
            for (const scheme of fileSchemes.supportedSchemes) {
                documentSelector.push({ language, scheme });
            }
        }
        return documentSelector;
    }
    async registerProviders(client, commandManager, typingsStatus) {
        const selector = this.documentSelector;
        const config = vscode_1.workspace.getConfiguration(this.id);
        const TypeScriptCompletionItemProvider = (await Promise.resolve().then(() => require('./features/completionItemProvider'))).default;
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new TypeScriptCompletionItemProvider(client, typingsStatus, this.fileConfigurationManager, commandManager), ...TypeScriptCompletionItemProvider.triggerCharacters));
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new (await Promise.resolve().then(() => require('./features/directiveCommentCompletionProvider'))).default(client), '@'));
        const { TypeScriptFormattingProvider, FormattingProviderManager } = await Promise.resolve().then(() => require('./features/formattingProvider'));
        const formattingProvider = new TypeScriptFormattingProvider(client, this.fileConfigurationManager);
        formattingProvider.updateConfiguration(config);
        this.disposables.push(vscode_1.languages.registerOnTypeFormattingEditProvider(selector, formattingProvider, ';', '}', '\n'));
        const formattingProviderManager = new FormattingProviderManager(this.description.id, formattingProvider, selector);
        formattingProviderManager.updateConfiguration();
        this.disposables.push(formattingProviderManager);
        this.toUpdateOnConfigurationChanged.push(formattingProviderManager);
        const cachedResponse = new baseCodeLensProvider_1.CachedNavTreeResponse();
        this.disposables.push(vscode_1.languages.registerCompletionItemProvider(selector, new (await Promise.resolve().then(() => require('./features/jsDocCompletionProvider'))).default(client, commandManager), '*'));
        this.disposables.push(vscode_1.languages.registerHoverProvider(selector, new (await Promise.resolve().then(() => require('./features/hoverProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerDefinitionProvider(selector, new (await Promise.resolve().then(() => require('./features/definitionProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerDocumentHighlightProvider(selector, new (await Promise.resolve().then(() => require('./features/documentHighlightProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerReferenceProvider(selector, new (await Promise.resolve().then(() => require('./features/referenceProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerDocumentSymbolProvider(selector, new (await Promise.resolve().then(() => require('./features/documentSymbolProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerRenameProvider(selector, new (await Promise.resolve().then(() => require('./features/renameProvider'))).default(client)));
        this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, new (await Promise.resolve().then(() => require('./features/quickFixProvider'))).default(client, this.fileConfigurationManager, commandManager, this.diagnosticsManager, this.bufferSyncSupport, this.telemetryReporter)));
        const TypescriptSignatureHelpProvider = (await Promise.resolve().then(() => require('./features/signatureHelpProvider'))).default;
        this.disposables.push(vscode_1.languages.registerSignatureHelpProvider(selector, new TypescriptSignatureHelpProvider(client), ...TypescriptSignatureHelpProvider.triggerCharacters));
        const refactorProvider = new (await Promise.resolve().then(() => require('./features/refactorProvider'))).default(client, this.fileConfigurationManager, commandManager);
        this.disposables.push(vscode_1.languages.registerCodeActionsProvider(selector, refactorProvider, refactorProvider.metadata));
        await this.initFoldingProvider();
        this.disposables.push(vscode_1.workspace.onDidChangeConfiguration(c => {
            if (c.affectsConfiguration(foldingSetting)) {
                this.initFoldingProvider();
            }
        }));
        this.disposables.push({ dispose: () => this.foldingProviderRegistration && this.foldingProviderRegistration.dispose() });
        this.registerVersionDependentProviders();
        const referenceCodeLensProvider = new (await Promise.resolve().then(() => require('./features/referencesCodeLensProvider'))).default(client, this.description.id, cachedResponse);
        referenceCodeLensProvider.updateConfiguration();
        this.toUpdateOnConfigurationChanged.push(referenceCodeLensProvider);
        this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, referenceCodeLensProvider));
        const implementationCodeLensProvider = new (await Promise.resolve().then(() => require('./features/implementationsCodeLensProvider'))).default(client, this.description.id, cachedResponse);
        implementationCodeLensProvider.updateConfiguration();
        this.toUpdateOnConfigurationChanged.push(implementationCodeLensProvider);
        this.disposables.push(vscode_1.languages.registerCodeLensProvider(selector, implementationCodeLensProvider));
        this.disposables.push(vscode_1.languages.registerWorkspaceSymbolProvider(new (await Promise.resolve().then(() => require('./features/workspaceSymbolProvider'))).default(client, this.description.modeIds)));
        if (!this.description.isExternal) {
            for (const modeId of this.description.modeIds) {
                this.disposables.push(vscode_1.languages.setLanguageConfiguration(modeId, languageConfigurations.jsTsLanguageConfiguration));
            }
        }
    }
    async initFoldingProvider() {
        let enable = vscode_1.workspace.getConfiguration().get(foldingSetting, false);
        if (enable && this.client.apiVersion.has280Features()) {
            if (!this.foldingProviderRegistration) {
                this.foldingProviderRegistration = vscode_1.languages.registerFoldingRangeProvider(this.documentSelector, new (await Promise.resolve().then(() => require('./features/foldingProvider'))).default(this.client));
            }
        }
        else {
            if (this.foldingProviderRegistration) {
                this.foldingProviderRegistration.dispose();
                this.foldingProviderRegistration = void 0;
            }
        }
    }
    configurationChanged() {
        const config = vscode_1.workspace.getConfiguration(this.id, null);
        this.updateValidate(config.get(validateSetting, true));
        this.updateSuggestionDiagnostics(config.get(suggestionSetting, true));
        for (const toUpdate of this.toUpdateOnConfigurationChanged) {
            toUpdate.updateConfiguration();
        }
    }
    handles(resource, doc) {
        if (doc && this.description.modeIds.indexOf(doc.languageId) >= 0) {
            return true;
        }
        if (this.bufferSyncSupport.handles(resource)) {
            return true;
        }
        const base = path_1.basename(resource.fsPath);
        return !!base && base === this.description.configFile;
    }
    get id() {
        return this.description.id;
    }
    get diagnosticSource() {
        return this.description.diagnosticSource;
    }
    updateValidate(value) {
        if (this._validate === value) {
            return;
        }
        this._validate = value;
        this.bufferSyncSupport.validate = value;
        this.diagnosticsManager.validate = value;
        if (value) {
            this.triggerAllDiagnostics();
        }
    }
    updateSuggestionDiagnostics(value) {
        if (this._enableSuggestionDiagnostics === value) {
            return;
        }
        this._enableSuggestionDiagnostics = value;
        this.diagnosticsManager.enableSuggestions = value;
        if (value) {
            this.triggerAllDiagnostics();
        }
    }
    reInitialize() {
        this.diagnosticsManager.reInitialize();
        this.bufferSyncSupport.reOpenDocuments();
        this.bufferSyncSupport.requestAllDiagnostics();
        this.fileConfigurationManager.reset();
        this.registerVersionDependentProviders();
    }
    getErr(resources) {
        this.bufferSyncSupport.getErr(resources);
    }
    async registerVersionDependentProviders() {
        dispose_1.disposeAll(this.versionDependentDisposables);
        if (!this.client) {
            return;
        }
        const selector = this.documentSelector;
        if (this.client.apiVersion.has220Features()) {
            this.versionDependentDisposables.push(vscode_1.languages.registerImplementationProvider(selector, new (await Promise.resolve().then(() => require('./features/implementationProvider'))).default(this.client)));
        }
        if (this.client.apiVersion.has213Features()) {
            this.versionDependentDisposables.push(vscode_1.languages.registerTypeDefinitionProvider(selector, new (await Promise.resolve().then(() => require('./features/typeDefinitionProvider'))).default(this.client)));
        }
        if (this.client.apiVersion.has280Features()) {
            const organizeImportsProvider = new (await Promise.resolve().then(() => require('./features/organizeImports'))).OrganizeImportsCodeActionProvider(this.client, this.commandManager, this.fileConfigurationManager);
            this.versionDependentDisposables.push(vscode_1.languages.registerCodeActionsProvider(selector, organizeImportsProvider, organizeImportsProvider.metadata));
        }
    }
    triggerAllDiagnostics() {
        this.bufferSyncSupport.requestAllDiagnostics();
    }
    diagnosticsReceived(diagnosticsKind, file, diagnostics) {
        const config = vscode_1.workspace.getConfiguration(this.id, file);
        const reportUnnecessary = config.get('showUnused', true);
        this.diagnosticsManager.diagnosticsReceived(diagnosticsKind, file, diagnostics.filter(diag => {
            if (!reportUnnecessary) {
                diag.customTags = undefined;
                if (diag.reportUnnecessary && diag.severity === vscode_1.DiagnosticSeverity.Hint) {
                    return false;
                }
            }
            return true;
        }));
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.diagnosticsManager.configFileDiagnosticsReceived(file, diagnostics);
    }
}
__decorate([
    memoize_1.memoize
], LanguageProvider.prototype, "documentSelector", null);
exports.default = LanguageProvider;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/languageProvider.js.map
