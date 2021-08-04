import { Disposable } from "vscode";

export class DisposableBase implements Disposable {
	public disposables: Disposable[] = [];

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}