import * as vscode from 'vscode';
import { ToggleFormatCommand } from './command/toggle_format_command';

export function activate(context: vscode.ExtensionContext) {

	/// Command
	context.subscriptions.push(new ToggleFormatCommand());
}

export function deactivate() {}
