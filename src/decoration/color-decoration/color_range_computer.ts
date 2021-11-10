import * as vs from "vscode";
import { Range, TextDocument } from "vscode";
import { ColorRangeComputerProvider } from "./color_range_computer_provider";

export class ColorRangeComputer {
  private allColorsPattern: RegExp;
  constructor(private readonly provider: ColorRangeComputerProvider){
    this.allColorsPattern = new RegExp(`^.*?(?<range>${this.provider.colorPatterns.join("|")})`, "gm");
  };

  public compute(document: vs.TextDocument): { [key: string]: vs.Range[] } {
    const text = document.getText();

    const decs: { [key: string]: vs.Range[] } = {};

    let result: RegExpExecArray | null;
    this.allColorsPattern.lastIndex = -1;

    while (result = this.allColorsPattern.exec(text)) {
      if (!result.groups) {
        continue;
      }

      let colorHex = this.provider.resolve(result.groups);

      if (colorHex) {
        if (!decs[colorHex]) {
          decs[colorHex] = [];
        }

        const index = result.index + result[0].length - result.groups!.range.length;

        decs[colorHex].push(toRange(document, index, result.groups!.range.length));
      }
    }

    return decs;
  }
}


export function asHexColor({ r, g, b, a }: { r: number, g: number, b: number, a: number }): string {
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);
  a = clamp(a, 0, 255);

  return `${asHex(a)}${asHex(r)}${asHex(g)}${asHex(b)}`.toLowerCase();
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(min, v), max);
}

export function asHex(v: number) {
  return Math.round(v).toString(16).padStart(2, "0");
}

export function toRange(document: TextDocument, offset: number, length: number): Range {
  return new Range(document.positionAt(offset), document.positionAt(offset + length));
}