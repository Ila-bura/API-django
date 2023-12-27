"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Advisor = void 0;
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConversion_1 = require("../omnisharp/typeConversion");
const vscode = require("vscode");
const CompositeDisposable_1 = require("../CompositeDisposable");
const virtualDocumentTracker_1 = require("./virtualDocumentTracker");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const protocol_1 = require("../omnisharp/protocol");
class Advisor {
    constructor(server, optionProvider) {
        this.optionProvider = optionProvider;
        this._packageRestoreCounter = 0;
        this._projectSourceFileCounts = Object.create(null);
        this._server = server;
        let d1 = server.onProjectChange(this._onProjectChange, this);
        let d2 = server.onProjectAdded(this._onProjectAdded, this);
        let d3 = server.onProjectRemoved(this._onProjectRemoved, this);
        let d4 = server.onBeforePackageRestore(this._onBeforePackageRestore, this);
        let d5 = server.onPackageRestore(this._onPackageRestore, this);
        this._disposable = new CompositeDisposable_1.default(d1, d2, d3, d4, d5);
    }
    dispose() {
        this._disposable.dispose();
    }
    shouldValidateFiles() {
        return this._isServerStarted()
            && !this._isRestoringPackages();
    }
    shouldValidateAll() {
        return this._isServerStarted()
            && !this._isRestoringPackages()
            && !this._isOverFileLimit();
    }
    _updateProjectFileCount(path, fileCount) {
        this._projectSourceFileCounts[path] = fileCount;
    }
    _addOrUpdateProjectFileCount(info) {
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            this._updateProjectFileCount(info.MsBuildProject.Path, info.MsBuildProject.SourceFiles.length);
        }
    }
    _removeProjectFileCount(info) {
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            delete this._projectSourceFileCounts[info.MsBuildProject.Path];
        }
    }
    _onProjectAdded(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onProjectRemoved(info) {
        this._removeProjectFileCount(info);
    }
    _onProjectChange(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onBeforePackageRestore() {
        this._packageRestoreCounter += 1;
    }
    _onPackageRestore() {
        this._packageRestoreCounter -= 1;
    }
    _isRestoringPackages() {
        return this._packageRestoreCounter > 0;
    }
    _isServerStarted() {
        return this._server.isRunning();
    }
    _isOverFileLimit() {
        let opts = this.optionProvider.GetLatestOptions();
        let fileLimit = opts.maxProjectFileCountForDiagnosticAnalysis;
        if (fileLimit > 0) {
            let sourceFileCount = 0;
            for (let key in this._projectSourceFileCounts) {
                sourceFileCount += this._projectSourceFileCounts[key];
                if (sourceFileCount > fileLimit) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.Advisor = Advisor;
function reportDiagnostics(server, advisor, languageMiddlewareFeature) {
    return new DiagnosticsProvider(server, advisor, languageMiddlewareFeature);
}
exports.default = reportDiagnostics;
class DiagnosticsProvider extends abstractProvider_1.default {
    constructor(server, validationAdvisor, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this._validateCurrentDocumentPipe = new rxjs_1.Subject();
        this._validateAllPipe = new rxjs_1.Subject();
        this._subscriptions = [];
        this.dispose = () => {
            this._validateAllPipe.complete();
            this._validateCurrentDocumentPipe.complete();
            this._subscriptions.forEach(x => x.unsubscribe());
            this._disposable.dispose();
        };
        this._analyzersEnabled = vscode.workspace.getConfiguration('omnisharp').get('enableRoslynAnalyzers', false);
        this._validationAdvisor = validationAdvisor;
        this._diagnostics = vscode.languages.createDiagnosticCollection('csharp');
        this._suppressHiddenDiagnostics = vscode.workspace.getConfiguration('csharp').get('suppressHiddenDiagnostics', true);
        this._subscriptions.push(this._validateCurrentDocumentPipe
            .asObservable()
            .pipe(operators_1.throttleTime(750))
            .subscribe((x) => __awaiter(this, void 0, void 0, function* () { return yield this._validateDocument(x); })));
        this._subscriptions.push(this._validateAllPipe
            .asObservable()
            .pipe(operators_1.throttleTime(3000))
            .subscribe(() => __awaiter(this, void 0, void 0, function* () {
            if (this._validationAdvisor.shouldValidateAll()) {
                yield this._validateEntireWorkspace();
            }
            else if (this._validationAdvisor.shouldValidateFiles()) {
                yield this._validateOpenDocuments();
            }
        })));
        this._disposable = new CompositeDisposable_1.default(this._diagnostics, this._server.onPackageRestore(() => this._validateAllPipe.next(), this), this._server.onProjectChange(() => this._validateAllPipe.next(), this), this._server.onProjectDiagnosticStatus(this._onProjectAnalysis, this), vscode.workspace.onDidOpenTextDocument(event => this._onDocumentOpenOrChange(event), this), vscode.workspace.onDidChangeTextDocument(event => this._onDocumentOpenOrChange(event.document), this), vscode.workspace.onDidCloseTextDocument(this._onDocumentClose, this), vscode.window.onDidChangeActiveTextEditor(event => this._onDidChangeActiveTextEditor(event), this), vscode.window.onDidChangeWindowState(event => this._OnDidChangeWindowState(event), this));
    }
    shouldIgnoreDocument(document) {
        if (document.languageId !== 'csharp') {
            return true;
        }
        if (document.uri.scheme !== 'file' &&
            !virtualDocumentTracker_1.isVirtualCSharpDocument(document)) {
            return true;
        }
        return false;
    }
    _OnDidChangeWindowState(windowState) {
        if (windowState.focused === true) {
            this._onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
        }
    }
    _onDidChangeActiveTextEditor(textEditor) {
        // active text editor can be undefined.
        if (textEditor != undefined && textEditor.document != null) {
            this._onDocumentOpenOrChange(textEditor.document);
        }
    }
    _onDocumentOpenOrChange(document) {
        if (this.shouldIgnoreDocument(document)) {
            return;
        }
        this._validateCurrentDocumentPipe.next(document);
        // This check is just small perf optimization to reduce queries
        // for omnisharp with analyzers (which has event to notify about updates.)
        if (!this._analyzersEnabled) {
            this._validateAllPipe.next();
        }
    }
    _onProjectAnalysis(event) {
        if (event.Status == protocol_1.DiagnosticStatus.Ready) {
            this._validateAllPipe.next();
        }
    }
    _onDocumentClose(document) {
        if (this._diagnostics.has(document.uri) && !this._validationAdvisor.shouldValidateAll()) {
            this._diagnostics.delete(document.uri);
        }
    }
    _validateDocument(document) {
        if (!this._validationAdvisor.shouldValidateFiles()) {
            return;
        }
        return setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let source = new vscode.CancellationTokenSource();
            try {
                let value = yield serverUtils.codeCheck(this._server, { FileName: document.fileName }, source.token);
                let quickFixes = value.QuickFixes;
                // Easy case: If there are no diagnostics in the file, we can clear it quickly.
                if (quickFixes.length === 0) {
                    if (this._diagnostics.has(document.uri)) {
                        this._diagnostics.delete(document.uri);
                    }
                    return;
                }
                // No problems published for virtual files
                if (virtualDocumentTracker_1.isVirtualCSharpDocument(document)) {
                    return;
                }
                // (re)set new diagnostics for this document
                let diagnosticsInFile = this._mapQuickFixesAsDiagnosticsInFile(quickFixes);
                this._diagnostics.set(document.uri, diagnosticsInFile.map(x => x.diagnostic));
            }
            catch (error) {
                return;
            }
        }), 2000);
    }
    // On large workspaces (if maxProjectFileCountForDiagnosticAnalysis) is less than workspace size,
    // diagnostic fallback to mode where only open documents are analyzed.
    _validateOpenDocuments() {
        return setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            for (let editor of vscode.window.visibleTextEditors) {
                let document = editor.document;
                if (this.shouldIgnoreDocument(document)) {
                    continue;
                }
                yield this._validateDocument(document);
            }
        }), 3000);
    }
    _mapQuickFixesAsDiagnosticsInFile(quickFixes) {
        return quickFixes
            .map(quickFix => this._asDiagnosticInFileIfAny(quickFix))
            .filter(diagnosticInFile => diagnosticInFile !== undefined);
    }
    _validateEntireWorkspace() {
        return setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let value = yield serverUtils.codeCheck(this._server, { FileName: null }, new vscode.CancellationTokenSource().token);
            let quickFixes = value.QuickFixes
                .sort((a, b) => a.FileName.localeCompare(b.FileName));
            let entries = [];
            let lastEntry;
            for (let diagnosticInFile of this._mapQuickFixesAsDiagnosticsInFile(quickFixes)) {
                let uri = vscode.Uri.file(diagnosticInFile.fileName);
                if (lastEntry && lastEntry[0].toString() === uri.toString()) {
                    lastEntry[1].push(diagnosticInFile.diagnostic);
                }
                else {
                    // We're replacing all diagnostics in this file. Pushing an entry with undefined for
                    // the diagnostics first ensures that the previous diagnostics for this file are
                    // cleared. Otherwise, new entries will be merged with the old ones.
                    entries.push([uri, undefined]);
                    lastEntry = [uri, [diagnosticInFile.diagnostic]];
                    entries.push(lastEntry);
                }
            }
            // Clear diagnostics for files that no longer have any diagnostics.
            this._diagnostics.forEach((uri) => {
                if (!entries.find(tuple => tuple[0].toString() === uri.toString())) {
                    this._diagnostics.delete(uri);
                }
            });
            // replace all entries
            this._diagnostics.set(entries);
        }), 3000);
    }
    _asDiagnosticInFileIfAny(quickFix) {
        let display = this._getDiagnosticDisplay(quickFix, this._asDiagnosticSeverity(quickFix));
        if (display.severity === "hidden") {
            return undefined;
        }
        let message = `${quickFix.Text} [${quickFix.Projects.map(n => this._asProjectLabel(n)).join(', ')}]`;
        let diagnostic = new vscode.Diagnostic(typeConversion_1.toRange(quickFix), message, display.severity);
        diagnostic.source = 'csharp';
        diagnostic.code = quickFix.Id;
        if (display.isFadeout) {
            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
        }
        return { diagnostic: diagnostic, fileName: quickFix.FileName };
    }
    _getDiagnosticDisplay(quickFix, severity) {
        // These hard coded values bring the goodness of fading even when analyzers are disabled.
        let isFadeout = (quickFix.Tags && !!quickFix.Tags.find(x => x.toLowerCase() == 'unnecessary'))
            || quickFix.Id == "CS0162" // CS0162: Unreachable code
            || quickFix.Id == "CS0219" // CS0219: Unused variable
            || quickFix.Id == "CS8019"; // CS8019: Unnecessary using
        if (isFadeout && quickFix.LogLevel.toLowerCase() === 'hidden' || quickFix.LogLevel.toLowerCase() === 'none') {
            // Theres no such thing as hidden severity in VSCode,
            // however roslyn uses commonly analyzer with hidden to fade out things.
            // Without this any of those doesn't fade anything in vscode.
            return { severity: vscode.DiagnosticSeverity.Hint, isFadeout };
        }
        return { severity: severity, isFadeout };
    }
    _asDiagnosticSeverity(quickFix) {
        switch (quickFix.LogLevel.toLowerCase()) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            case 'hidden':
                if (this._suppressHiddenDiagnostics) {
                    return "hidden";
                }
                return vscode.DiagnosticSeverity.Hint;
            default:
                return "hidden";
        }
    }
    _asProjectLabel(projectName) {
        const idx = projectName.indexOf('+');
        return projectName.substr(idx + 1);
    }
}
//# sourceMappingURL=diagnosticsProvider.js.map