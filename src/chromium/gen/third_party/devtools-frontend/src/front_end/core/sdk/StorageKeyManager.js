"use strict";
import { Capability } from "./Target.js";
import { SDKModel } from "./SDKModel.js";
import * as Common from "../common/common.js";
export class StorageKeyManager extends SDKModel {
  #mainStorageKeyInternal;
  #storageKeysInternal;
  constructor(target) {
    super(target);
    this.#mainStorageKeyInternal = "";
    this.#storageKeysInternal = /* @__PURE__ */ new Set();
  }
  updateStorageKeys(storageKeys) {
    const oldStorageKeys = this.#storageKeysInternal;
    this.#storageKeysInternal = storageKeys;
    for (const storageKey of oldStorageKeys) {
      if (!this.#storageKeysInternal.has(storageKey)) {
        this.dispatchEventToListeners("StorageKeyRemoved" /* STORAGE_KEY_REMOVED */, storageKey);
      }
    }
    for (const storageKey of this.#storageKeysInternal) {
      if (!oldStorageKeys.has(storageKey)) {
        this.dispatchEventToListeners("StorageKeyAdded" /* STORAGE_KEY_ADDED */, storageKey);
      }
    }
  }
  storageKeys() {
    return [...this.#storageKeysInternal];
  }
  mainStorageKey() {
    return this.#mainStorageKeyInternal;
  }
  setMainStorageKey(storageKey) {
    this.#mainStorageKeyInternal = storageKey;
    this.dispatchEventToListeners("MainStorageKeyChanged" /* MAIN_STORAGE_KEY_CHANGED */, {
      mainStorageKey: this.#mainStorageKeyInternal
    });
  }
}
export function parseStorageKey(storageKeyString) {
  const components = storageKeyString.split("^");
  const origin = Common.ParsedURL.ParsedURL.extractOrigin(components[0]);
  const storageKey = { origin, components: /* @__PURE__ */ new Map() };
  for (let i = 1; i < components.length; ++i) {
    storageKey.components.set(components[i].charAt(0), components[i].substring(1));
  }
  return storageKey;
}
export var StorageKeyComponent = /* @__PURE__ */ ((StorageKeyComponent2) => {
  StorageKeyComponent2["TOP_LEVEL_SITE"] = "0";
  StorageKeyComponent2["NONCE_HIGH"] = "1";
  StorageKeyComponent2["NONCE_LOW"] = "2";
  StorageKeyComponent2["ANCESTOR_CHAIN_BIT"] = "3";
  StorageKeyComponent2["TOP_LEVEL_SITE_OPAQUE_NONCE_HIGH"] = "4";
  StorageKeyComponent2["TOP_LEVEL_SITE_OPAQUE_NONCE_LOW"] = "5";
  StorageKeyComponent2["TOP_LEVEL_SITE_OPAQUE_NONCE_PRECURSOR"] = "6";
  return StorageKeyComponent2;
})(StorageKeyComponent || {});
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["STORAGE_KEY_ADDED"] = "StorageKeyAdded";
  Events2["STORAGE_KEY_REMOVED"] = "StorageKeyRemoved";
  Events2["MAIN_STORAGE_KEY_CHANGED"] = "MainStorageKeyChanged";
  return Events2;
})(Events || {});
SDKModel.register(StorageKeyManager, { capabilities: Capability.NONE, autostart: false });
//# sourceMappingURL=StorageKeyManager.js.map
