import * as vscode from 'vscode';
import { JumpToEditorCommand } from './command/jump_to_editor_command';
import { ToggleFormatCommand } from './command/toggle_format_command';
import { WrapSnippetCommand } from './command/wrap_snippet_command';
import { DartColorDecoration } from './decoration/dart_color_decoration';
import { AssetProvider } from './provider/asset_provider';
import { CommentaryCodeLensProvider } from './provider/commentary_code_lens_provider';
import { DatWrapCodeActionProvider } from './provider/dart_wrap_code_action_provider';
import { PubspecViewProvider } from './provider/pubspec_view_provider';
import { FormatStatusBar } from './statusbar/format_status_bar';

export function activate(context: vscode.ExtensionContext) {

	/// Command
	context.subscriptions.push(new ToggleFormatCommand());
	context.subscriptions.push(new WrapSnippetCommand());
	context.subscriptions.push(new JumpToEditorCommand());

	/// Provider
	context.subscriptions.push(new DatWrapCodeActionProvider());
	context.subscriptions.push(new AssetProvider());
	context.subscriptions.push(new PubspecViewProvider());
	context.subscriptions.push(new CommentaryCodeLensProvider());

  /// Decoration
  context.subscriptions.push(new DartColorDecoration());

  /// Status Bar
  context.subscriptions.push(new FormatStatusBar);
}

export function deactivate() {}
