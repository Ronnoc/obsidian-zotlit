import { join } from "path/posix";
import type { ItemKeyGroup } from "@obzt/common";
import type { GeneralItem } from "@obzt/zotero-type";
import { BaseError } from "make-error";
import type { TFile } from "obsidian";

import { Notice } from "obsidian";
import { getItemKeyGroupID } from "../note-index/index.js";
import { ZOTERO_KEY_FIELDNAME } from "../template/defaults.js";
import type { GeneralItemExtra } from "../template/helper/item.js";
import type ZoteroPlugin from "../zt-main.js";

export class NoteExistsError extends BaseError {
  constructor(public target: string, public key: string) {
    super(`Note linked to ${key} already exists: ${target}`);
    this.name = "NoteExistsError";
  }
}

export const createNote = async (
  plugin: ZoteroPlugin,
  item: GeneralItem,
  extra: GeneralItemExtra,
): Promise<TFile> => {
  const info = plugin.noteIndex.getNoteFromItem(item);
  if (info) {
    // only throw error if the note is linked to the same zotero item
    throw new NoteExistsError(info.file, item.key);
  }

  const { vault, fileManager, metadataCache: meta } = plugin.app,
    { literatureNoteFolder: folder, template } = plugin.settings;
  const filepath = join(folder.path, template.renderFilename(item));
  const existingFile = vault.getAbstractFileByPath(filepath);
  if (existingFile) {
    const metadata = meta.getCache(existingFile.path);
    if (
      metadata?.frontmatter &&
      metadata.frontmatter[ZOTERO_KEY_FIELDNAME] ===
        getItemKeyGroupID(item, true)
    ) {
      // only throw error if the note is linked to the same zotero item
      throw new NoteExistsError(filepath, item.key);
    }
  }
  const content = template.renderNote(item, extra, {
    plugin,
    sourcePath: filepath,
  });

  // filepath with suffix if file already exists
  const note = await fileManager.createNewMarkdownFileFromLinktext(
    filepath,
    "",
  );
  await vault.modify(note, content);
  return note;
};

export const openNote = async (
  plugin: ZoteroPlugin,
  item: ItemKeyGroup,
  slience = false,
): Promise<boolean> => {
  const { workspace } = plugin.app;

  const info = plugin.noteIndex.getNoteFromItem(item);
  if (!info) {
    !slience &&
      new Notice(
        `No literature note found for zotero item with key ${item.key}`,
      );
    return false;
  }

  let linktext = info.file;
  if (info.blockId) {
    linktext += "#^" + info.blockId;
  }

  await workspace.openLinkText(linktext, "", false);
  return true;
};
