import { CancellationToken, commands, Location, Progress, ProgressLocation, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { REFERENCE_CHECK_COMMAND, REFERENCE_CHECK_REG_EXP } from "../constant/constant";
import { VSCODE_EXECUTE_REFERENCE_PROVIDER } from "../constant/vscode";
import { getConfiguration, getRange } from "../util/util";

export class ReferenceCheckCommand extends DisposableBase {
  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(REFERENCE_CHECK_COMMAND, referenceCheck),
    );
  }
}

function referenceCheck() {
  window.withProgress({
    location: ProgressLocation.Notification,
    title: 'Reference Check',
    cancellable: true,
  }, referenceCheckWithProgress,
  );
}

async function referenceCheckWithProgress(progress: Progress<{ message?: string | undefined; increment?: number | undefined; }>, token: CancellationToken) {
  let document = window.activeTextEditor?.document;
  if (!document) return;

  let config = getConfiguration<string | undefined>(REFERENCE_CHECK_REG_EXP);
  if (!config) return;

  let text = document.getText();
  let regExp = RegExp(config, 'gmi');
  let match: RegExpExecArray | null;

  regExp.lastIndex = -1;
  let line = 0;
  while (match = regExp.exec(text)) {
    if (token.isCancellationRequested) return;

    let range = getRange(document, match.index, match[0].length);

    progress.report({
      message: document.getText(range),
      increment: (range.start.line - line) / document.lineCount * 100
    });
    line = range.start.line;

    let locations = await commands.executeCommand<Array<Location>>(VSCODE_EXECUTE_REFERENCE_PROVIDER, document.uri, range.start);
    if (!locations?.some(e => !(e.range.isEqual(range) && e.uri.fsPath == document!.uri.fsPath))) {
      window.activeTextEditor?.setDecorations(
        window.createTextEditorDecorationType({
          fontStyle: 'oblique',
          textDecoration: 'line-through orange',
          cursor: 'pointer'
        }),
        [range],
      );
    }
  }
}