import { homedir } from "os";
import { join } from "path";
import { getBinaryFullPath } from "../../install-guide/version";

import Settings from "../settings-base";

interface SettingOptions {
  zoteroDataDir: string;
  citationLibrary: number;
}

export class DatabaseSettings extends Settings<SettingOptions> {
  getDefaults() {
    return {
      zoteroDataDir: join(homedir(), "Zotero"),
      citationLibrary: 1,
    };
  }

  /** cache result */
  #nativeBinding?: string;
  get nativeBinding(): string {
    if (this.#nativeBinding) return this.#nativeBinding;
    const binaryFullPath = getBinaryFullPath(this.manifest);
    if (binaryFullPath) {
      this.#nativeBinding = binaryFullPath;
      return this.#nativeBinding;
    } else throw new Error("Failed to get native binding path");
  }
  get zoteroDbPath(): string {
    return join(this.zoteroDataDir, "zotero.sqlite");
  }
  get betterBibTexDbPath(): string {
    return join(this.zoteroDataDir, "better-bibtex-search.sqlite");
  }
  get zoteroCacheDirPath(): string {
    return join(this.zoteroDataDir, "cache");
  }

  get dbConnParams() {
    return [
      this.nativeBinding,
      this.zoteroDbPath,
      this.betterBibTexDbPath,
    ] as const;
  }
}