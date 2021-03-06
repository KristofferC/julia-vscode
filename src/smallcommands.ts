import * as vscode from 'vscode';
import * as settings from './settings'
import * as vslc from 'vscode-languageclient';

let g_context: vscode.ExtensionContext = null;
let g_settings: settings.ISettings = null;
let g_languageClient: vslc.LanguageClient = null;

function toggleLinter() {
    let cval = vscode.workspace.getConfiguration('julia').get('runlinter', false)
    vscode.workspace.getConfiguration('julia').update('runlinter', !cval, true)
}

function applyTextEdit(we) {
    let wse = new vscode.WorkspaceEdit()
    for (let edit of we.documentChanges[0].edits) {
        wse.replace(we.documentChanges[0].textDocument.uri, new vscode.Range(edit.range.start.line, edit.range.start.character, edit.range.end.line, edit.range.end.character), edit.newText)
    }
    vscode.workspace.applyEdit(wse)
}

function lintPackage() {
    if (g_languageClient == null) {
        vscode.window.showErrorMessage('Error: package linting only works with a running julia language server.');
    }
    else {
        try {
            g_languageClient.sendRequest("julia/lint-package");
        }
        catch (ex) {
            if (ex.message == "Language client is not ready yet") {
                vscode.window.showErrorMessage('Error: package linting only works with a running julia language server.');
            }
            else {
                throw ex;
            }
        }
    }
}

function reloadModules() {
    if (g_languageClient == null) {
        vscode.window.showErrorMessage('Error: Language server is not yet running.');
    }
    else {
        try {
            g_languageClient.sendRequest("julia/reload-modules");
        }
        catch (ex) {
            if (ex.message == "Language client is not ready yet") {
                vscode.window.showErrorMessage('Error: Language server is not yet running.');
            }
            else {
                throw ex;
            }
        }
    }
}

function toggleServerLogs() {
    if (g_languageClient == null) {
        vscode.window.showErrorMessage('Error: Lanuage server is not yet running.');
    }
    else {
        try {
            g_languageClient.sendRequest("julia/toggle-log");
        }
        catch (ex) {
            if (ex.message == "Language client is not ready yet") {
                vscode.window.showErrorMessage('Error: server is not running.');
            }
            else {
                throw ex;
            }
        }
    }
}

function toggleFileLint(arg) {
    if (g_languageClient == null) {
        vscode.window.showErrorMessage('Error: Lanuage server is not yet running.');
    }
    else {
        try {
            g_languageClient.sendRequest("julia/toggleFileLint", arg);
        }
        catch (ex) {
            5
            if (ex.message == "Language client is not ready yet") {
                vscode.window.showErrorMessage('Error: server is not running.');
            }
            else {
                throw ex;
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext, settings: settings.ISettings) {
    g_context = context;
    g_settings = settings;

    context.subscriptions.push(vscode.commands.registerCommand('language-julia.applytextedit', applyTextEdit));
    context.subscriptions.push(vscode.commands.registerCommand('language-julia.lint-package', lintPackage));
    context.subscriptions.push(vscode.commands.registerCommand('language-julia.toggleLinter', toggleLinter));
    context.subscriptions.push(vscode.commands.registerCommand('language-julia.reload-modules', reloadModules));
    context.subscriptions.push(vscode.commands.registerCommand('language-julia.toggle-log', toggleServerLogs));
    context.subscriptions.push(vscode.commands.registerCommand('language-julia.toggle-file-lint', toggleFileLint));
}

export function onDidChangeConfiguration(newSettings: settings.ISettings) {

}

export function onNewLanguageClient(newLanguageClient: vslc.LanguageClient) {
    g_languageClient = newLanguageClient;
}
