"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const markdownEngine_1 = require("../markdownEngine");
const slugify_1 = require("../slugify");
const emptyContributions = new class {
    constructor() {
        this.previewScripts = [];
        this.previewStyles = [];
        this.previewResourceRoots = [];
        this.markdownItPlugins = [];
    }
};
function createNewMarkdownEngine() {
    return new markdownEngine_1.MarkdownEngine(emptyContributions, slugify_1.githubSlugifier);
}
exports.createNewMarkdownEngine = createNewMarkdownEngine;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/extensions/markdown-language-features/out/test/engine.js.map
