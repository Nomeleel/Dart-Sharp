/*
This code is in reference: https://github.com/Dart-Code/Dart-Code/blob/master/src/extension/decorations/flutter_color_decorations.ts
*/

import * as fs from "fs";
import * as path from "path";
import { CancellationToken, Color, ColorInformation, ColorPresentation, Disposable, DocumentColorProvider, languages, ProviderResult, Range, TextDocument, TextEdit, TextEditor, TextEditorDecorationType, Uri, window, workspace } from "vscode";
import { DART_MODE } from "../../constant/constant";
import { ColorDecorationConfig } from "./color_decoration_config";
import { ColorRangeComputer } from "./color_range_computer";
import { isAnalyzable, mkDirRecursive } from "./util";

export class ColorDecoration implements Disposable, DocumentColorProvider {
	private readonly subscriptions: Disposable[] = [];
	private readonly computer: ColorRangeComputer;
	private activeEditor?: TextEditor;
	private updateTimeout?: NodeJS.Timeout;
	private readonly decorationTypes: { [key: string]: TextEditorDecorationType } = {};

	constructor(private readonly imageStoragePath: string, private readonly config: ColorDecorationConfig) {
		this.computer = new ColorRangeComputer(config.colorRangeComputerProvider);
		this.subscriptions.push(workspace.onDidChangeTextDocument((e) => {
			if (this.activeEditor && e.document === this.activeEditor.document) {
				// Delay this so if we're getting lots of updates we don't flicker.
				if (this.updateTimeout) { clearTimeout(this.updateTimeout); }
				this.updateTimeout = setTimeout(() => this.update(), 1000);
			}
		}));
		this.subscriptions.push(window.onDidChangeActiveTextEditor((e) => {
			this.setTrackingFile(e);
			this.update();
		}));
		if (window.activeTextEditor) {
			this.setTrackingFile(window.activeTextEditor);
			this.update();
		}

		languages.registerColorProvider(DART_MODE, this);
	}

	private update() {
		if (!this.activeEditor) { return; }

		const results = this.computer.compute(this.activeEditor.document);

		// Each color needs to be its own decoration, so here we update our main list
		// with any new ones we hadn't previously created.
		for (const colorHex of Object.keys(results)) {
			const filePath = this.createImageFile(colorHex);
			if (filePath && !this.decorationTypes[colorHex]) {
				this.decorationTypes[colorHex] = window.createTextEditorDecorationType({
					gutterIconPath: Uri.file(filePath),
					gutterIconSize: "50%",
				});
			}
		}

		for (const colorHex of Object.keys(this.decorationTypes)) {
			this.activeEditor.setDecorations(
				this.decorationTypes[colorHex],
				results[colorHex] || [],
			);
		}
	}

	private setTrackingFile(editor: TextEditor | undefined) {
		if (editor && isAnalyzable(editor.document, this.config.analyzableLanguages, this.config.analyzableFileExtensions)) {
			this.activeEditor = editor;
		} else { this.activeEditor = undefined; }
	}

	private createImageFile(hex: string): string | undefined {
		// Add a version number to the folder in case we need to change these
		// and invalidate the old ones.
		const imageFolder = path.join(this.imageStoragePath, "v1");
		mkDirRecursive(imageFolder);
		const file = path.join(imageFolder, `${hex}.svg`);
		if (fs.existsSync(file)) { return file; }

		try {
			const hex6 = hex.substr(2);
			const opacity = parseInt(hex.substr(0, 2), 16) / 255;
			const imageContents = svgContents
				.replace("{HEX-6}", hex6)
				.replace("{OPACITY}", opacity.toString());
			fs.writeFileSync(file, imageContents);
			return file;
		} catch (e) {
			// log
		}
	}

	public provideDocumentColors(document: TextDocument, token: CancellationToken): ProviderResult<ColorInformation[]> {
		const results = this.computer.compute(document);

		let colorInfos: ColorInformation[] = [];
		for (const colorHex of Object.keys(results)) {
			const color = this.parseColor(colorHex);
			results[colorHex].forEach((range) => {
				let reRange = document.getWordRangeAtPosition(range.start);
				colorInfos.push(new ColorInformation(reRange ?? range, color));
			});
		}

		return colorInfos;
	}

	public provideColorPresentations(color: Color, context: { document: TextDocument; range: Range; }, token: CancellationToken): ProviderResult<ColorPresentation[]> {
    let colorPresentation = new ColorPresentation(context.document.getText(context.range));
    // TODO(Nomeleel): Imp
    colorPresentation.textEdit = TextEdit.replace(context.range, '');
		return [colorPresentation];
	}

	private parseColor(colorHex: string): Color {
		let parse = (index: number) => parseInt(colorHex.substring(index * 2, index * 2 + 2), 16) / 255;
		return new Color(parse(1), parse(2), parse(3), parse(0));
	}

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach(e => e.dispose());
	}
}

const svgContents = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
	<rect fill="#{HEX-6}" x="0" y="0" width="16" height="16" fill-opacity="{OPACITY}" />
</svg>
`;