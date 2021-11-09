import { commands, ConfigurationTarget, workspace } from "vscode";
import { DART_ENABLE_SDK_FORMATTER } from "../constant/constant";

export function getFormatConfig(): boolean | undefined {
  return workspace.getConfiguration().get(DART_ENABLE_SDK_FORMATTER);
}

export async function setFormatConfig(config: boolean) {
  await workspace.getConfiguration().update(DART_ENABLE_SDK_FORMATTER, config, ConfigurationTarget.Global, true);
}

export function formatEnabled(): boolean {
  return getFormatConfig() ? true : false;
}

export function formatAvailable(): boolean {
  return getFormatConfig() !== undefined;
}

export async function formatScope(action: Function) {
  let current = getFormatConfig();
  if (current !== undefined) {
    if (!current) await setFormatConfig(!current);
    await action();
    if (!current) await setFormatConfig(current);
  }
}

export async function formatSelection() {
  await commands.executeCommand('editor.action.formatSelection');
}