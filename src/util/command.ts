import { Command, Range, Uri } from "vscode";
import { JUMP_TO_EDITOR_COMMAND } from "../constant/constant";

export function jumpToCommand(path: string | Uri, range?: Range): Command {
  return {
    command: JUMP_TO_EDITOR_COMMAND,
    arguments: [
      path,
      range,
      range,
    ],
    title: "Jump To",
  };
}