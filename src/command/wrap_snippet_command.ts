import { CodeAction, commands, Position, Range, Selection, SnippetString, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { formatEnabled, formatScope, formatSelection } from "../util/format";
import { compensateForVsCodeIndenting } from "../util/util";

export class WrapSnippetCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand('dart_sharp.wrapSnippet', this.wrapSnippet),
    );
  }

  public async wrapSnippet(targetRange: Range, wrapSnippet: string, wrapFlag = '${WIDGET}') {
    if (!targetRange || !wrapSnippet) return;
    const editor = window.activeTextEditor;
    if (editor) {
      const targetText = editor.document.getText(targetRange);
      // insertSnippet会执行文本中的$表达式, 这里先转义, 等执行时负负得正抵消掉转义
      const wrapedText = wrapSnippet.replace(wrapFlag, targetText.replace(/\$/g, '\\$'));
      const enabledFormat = formatEnabled();
      const insertText = enabledFormat ? wrapedText : compensateForVsCodeIndenting(wrapedText, editor.document.lineAt(targetRange.start.line).firstNonWhitespaceCharacterIndex);
      await editor.insertSnippet(new SnippetString(insertText), targetRange);

      // 插入未引入的符号 尝试进行引入
      const codeActions = await (commands.executeCommand("vscode.executeCodeActionProvider", editor.document.uri, targetRange) as Thenable<CodeAction[]>);
      let quickfixImport = codeActions.find((e) => e.kind?.value.startsWith('quickfix.import'));
      let importOffset = 0;
      if (quickfixImport && quickfixImport.edit) {
        if (await workspace.applyEdit(quickfixImport.edit))
          importOffset = quickfixImport.edit.get(editor.document.uri)[0].newText.split('\n').length - 1;
      }

      if (!enabledFormat) return;

      // 以上无需修正插入字符串缩进格式 直接局部格式化即可
      let lineCount = wrapedText.split('\n').length;
      let startPosition = targetRange.start.translate(importOffset);
      editor.selection = new Selection(startPosition, new Position(startPosition.line + lineCount, 0));
      await formatScope(async () => await formatSelection());
      editor.selection = new Selection(new Position(0, 0), new Position(0, 0));
    }
  }
}