import { CancellationToken, DefinitionProvider, DocumentLink, DocumentLinkProvider, Hover, HoverProvider, LocationLink, Position, Range, TextDocument } from "vscode";
import { getRange } from "../util/util";

export abstract class RegExpProvider implements DocumentLinkProvider, DefinitionProvider, HoverProvider {

  readonly regExp: RegExp;

  constructor(regExp: RegExp) {
    this.regExp = regExp;
  }

  // DocumentLinkProvider
  public async provideDocumentLinks(document: TextDocument, token: CancellationToken): Promise<DocumentLink[] | undefined> {
    let links: DocumentLink[] = [];
    let text = document.getText();
    let match: RegExpExecArray | null;
    
    this.regExp.lastIndex = -1;
    while(match = this.regExp.exec(text)) {
      let range = getRange(document, match.index, match[0].length);
      let documentLink = await this.provideDocumentLinkByRegExpRange(document, range, document.getText(range));
      if (documentLink) {
        links.push(documentLink);
      }
    }
    return links;
  }

  public async provideDocumentLinkByRegExpRange(document: TextDocument, range: Range, rangeText: string): Promise<DocumentLink | undefined> {
    return undefined;
  }

  // DefinitionProvider
  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<LocationLink[] | undefined> {
    let wordRange: Range | undefined;
    let word = this.getWordAtPosition(document, position, this.regExp, wordRange);
    if (word && wordRange) {
      return this.provideLocationLinksByRegExpWord(document, wordRange, word);
    }
  }

  public async provideLocationLinksByRegExpWord(document: TextDocument, range: Range, word: string): Promise<LocationLink[] | undefined> {
    return undefined;
  }

  // HoverProvider
  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let word = this.getWordAtPosition(document, position);
    if (word) {
      return this.provideHoverByRegExpWord(document, position, word);
    }
  }

  public async provideHoverByRegExpWord(document: TextDocument, position: Position, word: string): Promise<Hover | undefined> {
    return undefined;
  }

  public getWordAtPosition(document: TextDocument, position: Position,regex = this.regExp, wordRange?: Range): string | undefined {
    wordRange = document.getWordRangeAtPosition(position, this.regExp);
    if (wordRange) {
      return document.getText(wordRange);
    }
  }
}