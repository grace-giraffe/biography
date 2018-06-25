/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";function assign(e,n){return Object.keys(n).reduce(function(e,t){return e[t]=n[t],e},e)}function parseURLQueryArgs(){return(window.location.search||"").split(/[?&]/).filter(function(e){return!!e}).map(function(e){return e.split("=")}).filter(function(e){return 2===e.length}).reduce(function(e,n){return e[n[0]]=decodeURIComponent(n[1]),e},{})}function uriFromPath(e){var n=path.resolve(e).replace(/\\/g,"/");return n.length>0&&"/"!==n.charAt(0)&&(n="/"+n),encodeURI("file://"+n)}function readFile(e){return new Promise(function(n,t){fs.readFile(e,"utf8",function(e,r){e?t(e):n(r)})})}function main(){const e=parseURLQueryArgs(),n=JSON.parse(e.config||"{}")||{};assign(process.env,n.userEnv),function(){const e=require("path"),t=require("module");let r=e.join(n.appRoot,"node_modules");/[a-z]\:/.test(r)&&(r=r.charAt(0).toUpperCase()+r.substr(1));const o=r+".asar",a=t._resolveLookupPaths;t._resolveLookupPaths=function(e,n,t){const i=a(e,n,t),s=t?i:i[1];for(let e=0,n=s.length;e<n;e++)if(s[e]===r){
s.splice(e,0,o);break}return i}}();const t="darwin"===process.platform?"meta-alt-73":"ctrl-shift-73",r="darwin"===process.platform?"meta-82":"ctrl-82";window.addEventListener("keydown",function(e){const n=function(e){return[e.ctrlKey?"ctrl-":"",e.metaKey?"meta-":"",e.altKey?"alt-":"",e.shiftKey?"shift-":"",e.keyCode].join("")}(e);n===t?remote.getCurrentWebContents().toggleDevTools():n===r&&remote.getCurrentWindow().reload()});const o=uriFromPath(n.appRoot)+"/out";var a={availableLanguages:{}};const i=process.env.VSCODE_NLS_CONFIG;if(i){process.env.VSCODE_NLS_CONFIG=i;try{a=JSON.parse(i)}catch(e){}}if(a._resolvedLanguagePackCoreLocation){let e=Object.create(null);a.loadBundle=function(n,t,r){let o=e[n];if(o)return void r(void 0,o);readFile(path.join(a._resolvedLanguagePackCoreLocation,n.replace(/\//g,"!")+".nls.json")).then(function(t){let o=JSON.parse(t);e[n]=o,r(void 0,o)}).catch(r)}}var s=a.availableLanguages["*"]||"en";"zh-tw"===s?s="zh-Hant":"zh-cn"===s&&(s="zh-Hans"),
window.document.documentElement.setAttribute("lang",s);const u=n.appRoot+"/out/vs/loader.js",c=fs.readFileSync(u);require("vm").runInThisContext(c,{filename:u});var l=global.define;global.define=void 0,window.nodeRequire=require.__$__nodeRequire,l("fs",["original-fs"],function(e){return e}),window.MonacoEnvironment={},require.config({baseUrl:o,"vs/nls":a,nodeCachedDataDir:n.nodeCachedDataDir,nodeModules:[]}),a.pseudo&&require(["vs/nls"],function(e){e.setPseudoTranslation(a.pseudo)}),require(["vs/code/electron-browser/issue/issueReporterMain"],e=>{e.startup(n)})}const path=require("path"),fs=require("fs"),remote=require("electron").remote;main();
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/core/vs/code/electron-browser/issue/issueReporter.js.map
