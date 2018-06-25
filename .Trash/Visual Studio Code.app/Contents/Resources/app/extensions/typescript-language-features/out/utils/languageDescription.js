"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const languageModeIds = require("./languageModeIds");
exports.standardLanguageDescriptions = [
    {
        id: 'typescript',
        diagnosticSource: 'ts',
        diagnosticOwner: 'typescript',
        modeIds: [languageModeIds.typescript, languageModeIds.typescriptreact],
        configFile: 'tsconfig.json'
    }, {
        id: 'javascript',
        diagnosticSource: 'ts',
        diagnosticOwner: 'typescript',
        modeIds: [languageModeIds.javascript, languageModeIds.javascriptreact],
        configFile: 'jsconfig.json'
    }
];
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/typescript-language-features/out/utils/languageDescription.js.map
