import * as fs from "fs";
import { join } from "path";
import { Uri } from "vscode";

export function dependencyPackages(projectDir: string): Package[] | undefined {
  let packageConfigPath = join(projectDir, '.dart_tool', 'package_config.json');
  if (fs.existsSync(packageConfigPath)) {
    let content = fs.readFileSync(packageConfigPath, 'utf-8');
    let packages = JSON.parse(content).packages as Package[];
    packages?.forEach((pkg) => {
      if (isRemotePackage(pkg)) {
        pkg.absolutePath = Uri.parse(pkg.rootUri).path;
      } else if (isLocalPackage(pkg)) {
        pkg.absolutePath = Uri.joinPath(Uri.file(projectDir), 'lib', pkg.rootUri).path;
      }
    });
    return packages;
  }
}

export function dependencyRemotePackages(projectDir: string): Package[] | undefined {
  return dependencyPackages(projectDir)?.filter(isRemotePackage);
}

function isRemotePackage(pkg: Package): boolean {
  return pkg.rootUri.startsWith('file://');
}

function isLocalPackage(pkg: Package): boolean {
  return pkg.rootUri.startsWith('../');
}

export class Package {
  public name: string;
  public rootUri: string;
  public packageUri: string;
  public languageVersion: string;
  public absolutePath: string;

  constructor(name: string, rootUri: string, packageUri: string, languageVersion: string) {
    this.name = name;
    this.rootUri = rootUri;
    this.packageUri = packageUri;
    this.languageVersion = languageVersion;
    this.absolutePath = rootUri;
  }
}