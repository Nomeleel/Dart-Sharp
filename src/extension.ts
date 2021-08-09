import * as vscode from 'vscode';
import { ToggleFormatCommand } from './command/toggle_format_command';
import { WrapSnippetCommand } from './command/wrap_snippet_command';
import { AssetProvider } from './provider/asset_provider';
import { DatWrapCodeActionProvider } from './provider/dart_wrap_code_action_provider';

export function activate(context: vscode.ExtensionContext) {

	/// Command
	context.subscriptions.push(new ToggleFormatCommand());
	context.subscriptions.push(new WrapSnippetCommand());

	/// Provider
	context.subscriptions.push(new DatWrapCodeActionProvider());
	context.subscriptions.push(new AssetProvider());
}

export function deactivate() {}
