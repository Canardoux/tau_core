"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as SDK from "../../core/sdk/sdk.js";
import * as UI from "../../ui/legacy/legacy.js";
import * as Bindings from "../bindings/bindings.js";
import * as Workspace from "../workspace/workspace.js";
import { NetworkPersistenceManager } from "./NetworkPersistenceManager.js";
import { PersistenceImpl } from "./PersistenceImpl.js";
const UIStrings = {
  /**
   *@description Text to save content as a specific file type
   */
  saveAs: "Save as...",
  /**
   *@description Context menu item for saving an image
   */
  saveImage: "Save image",
  /**
   *@description Context menu item for showing all overridden files
   */
  showOverrides: "Show all overrides",
  /**
   *@description A context menu item in the Persistence Actions of the Workspace settings in Settings
   */
  overrideContent: "Override content",
  /**
   *@description A context menu item in the Persistence Actions of the Workspace settings in Settings
   */
  openInContainingFolder: "Open in containing folder",
  /**
   *@description A message in a confirmation dialog in the Persistence Actions
   * @example {bundle.min.js} PH1
   */
  overrideSourceMappedFileWarning: "Override \u2018{PH1}\u2019 instead?",
  /**
   *@description A message in a confirmation dialog to explain why the action is failed in the Persistence Actions
   * @example {index.ts} PH1
   */
  overrideSourceMappedFileExplanation: "\u2018{PH1}\u2019 is a source mapped file and cannot be overridden.",
  /**
   * @description An error message shown in the DevTools console after the user clicked "Save as" in
   * the context menu of a WebAssembly file.
   */
  saveWasmFailed: "Unable to save WASM module to disk. Most likely the module is too large."
};
const str_ = i18n.i18n.registerUIStrings("models/persistence/PersistenceActions.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class ContextMenuProvider {
  appendApplicableItems(_event, contextMenu, contentProvider) {
    async function saveAs() {
      if (contentProvider instanceof Workspace.UISourceCode.UISourceCode) {
        contentProvider.commitWorkingCopy();
      }
      const url = contentProvider.contentURL();
      let content;
      const maybeScript = getScript(contentProvider);
      if (maybeScript?.isWasm()) {
        try {
          const byteCode = await maybeScript.getWasmBytecode();
          const base64 = await Common.Base64.encode(byteCode);
          content = { isEncoded: true, content: base64 };
        } catch (e) {
          console.error(`Unable to convert WASM byte code for ${url} to base64. Not saving to disk`, e.stack);
          Common.Console.Console.instance().error(
            i18nString(UIStrings.saveWasmFailed),
            /* show=*/
            false
          );
          return;
        }
      } else {
        content = await contentProvider.requestContent();
      }
      await Workspace.FileManager.FileManager.instance().save(url, content.content ?? "", true, content.isEncoded);
      Workspace.FileManager.FileManager.instance().close(url);
    }
    async function saveImage() {
      const targetObject = contentProvider;
      const content = (await targetObject.requestContent()).content || "";
      const link = document.createElement("a");
      link.download = targetObject.displayName;
      link.href = "data:" + targetObject.mimeType + ";base64," + content;
      link.click();
    }
    if (contentProvider.contentType().isDocumentOrScriptOrStyleSheet()) {
      contextMenu.saveSection().appendItem(i18nString(UIStrings.saveAs), saveAs, { jslogContext: "save-as" });
    } else if (contentProvider instanceof SDK.Resource.Resource && contentProvider.contentType().isImage()) {
      contextMenu.saveSection().appendItem(i18nString(UIStrings.saveImage), saveImage, { jslogContext: "save-image" });
    }
    const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(contentProvider.contentURL());
    const networkPersistenceManager = NetworkPersistenceManager.instance();
    const binding = uiSourceCode && PersistenceImpl.instance().binding(uiSourceCode);
    const fileURL = binding ? binding.fileSystem.contentURL() : contentProvider.contentURL();
    if (Common.ParsedURL.schemeIs(fileURL, "file:")) {
      const path = Common.ParsedURL.ParsedURL.urlToRawPathString(fileURL, Host.Platform.isWin());
      contextMenu.revealSection().appendItem(
        i18nString(UIStrings.openInContainingFolder),
        () => Host.InspectorFrontendHost.InspectorFrontendHostInstance.showItemInFolder(path),
        { jslogContext: "open-in-containing-folder" }
      );
    }
    if (contentProvider instanceof Workspace.UISourceCode.UISourceCode && contentProvider.project().type() === Workspace.Workspace.projectTypes.FileSystem) {
      return;
    }
    let disabled = true;
    let handler = () => {
    };
    if (uiSourceCode && networkPersistenceManager.isUISourceCodeOverridable(uiSourceCode)) {
      if (!uiSourceCode.contentType().isFromSourceMap()) {
        disabled = false;
        handler = this.handleOverrideContent.bind(this, uiSourceCode, contentProvider);
      } else {
        const deployedUiSourceCode = this.getDeployedUiSourceCode(uiSourceCode);
        if (deployedUiSourceCode) {
          disabled = false;
          handler = this.redirectOverrideToDeployedUiSourceCode.bind(this, deployedUiSourceCode, uiSourceCode);
        }
      }
    }
    contextMenu.overrideSection().appendItem(
      i18nString(UIStrings.overrideContent),
      handler,
      { disabled, jslogContext: "override-content" }
    );
    if (contentProvider instanceof SDK.NetworkRequest.NetworkRequest) {
      contextMenu.overrideSection().appendItem(i18nString(UIStrings.showOverrides), async () => {
        await UI.ViewManager.ViewManager.instance().showView("navigator-overrides");
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ShowAllOverridesFromNetworkContextMenu);
      }, { jslogContext: "show-overrides" });
    }
  }
  async handleOverrideContent(uiSourceCode, contentProvider) {
    const networkPersistenceManager = NetworkPersistenceManager.instance();
    const isSuccess = await networkPersistenceManager.setupAndStartLocalOverrides(uiSourceCode);
    if (isSuccess) {
      await Common.Revealer.reveal(uiSourceCode);
    }
    if (contentProvider instanceof SDK.NetworkRequest.NetworkRequest) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideContentFromNetworkContextMenu);
    } else if (contentProvider instanceof Workspace.UISourceCode.UISourceCode) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideContentFromSourcesContextMenu);
    }
    if (uiSourceCode.isFetchXHR()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideFetchXHR);
    } else if (contentProvider.contentType().isScript()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideScript);
    } else if (contentProvider.contentType().isDocument()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideDocument);
    } else if (contentProvider.contentType().isStyleSheet()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideStyleSheet);
    } else if (contentProvider.contentType().isImage()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideImage);
    } else if (contentProvider.contentType().isFont()) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideFont);
    }
  }
  async redirectOverrideToDeployedUiSourceCode(deployedUiSourceCode, originalUiSourceCode) {
    Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideContentContextMenuSourceMappedWarning);
    const deployedUrl = deployedUiSourceCode.url();
    const deployedName = Bindings.ResourceUtils.displayNameForURL(deployedUrl);
    const originalUrl = originalUiSourceCode.url();
    const originalName = Bindings.ResourceUtils.displayNameForURL(originalUrl);
    const warningMessage = i18nString(UIStrings.overrideSourceMappedFileWarning, { PH1: deployedName }) + "\n" + i18nString(UIStrings.overrideSourceMappedFileExplanation, { PH1: originalName });
    const shouldJumpToDeployedFile = await UI.UIUtils.ConfirmDialog.show(
      warningMessage,
      void 0,
      { jslogContext: "override-source-mapped-file-warning" }
    );
    if (shouldJumpToDeployedFile) {
      Host.userMetrics.actionTaken(Host.UserMetrics.Action.OverrideContentContextMenuRedirectToDeployed);
      await this.handleOverrideContent(deployedUiSourceCode, deployedUiSourceCode);
    }
  }
  getDeployedUiSourceCode(uiSourceCode) {
    const debuggerWorkspaceBinding = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
    for (const deployedScript of debuggerWorkspaceBinding.scriptsForUISourceCode(uiSourceCode)) {
      const deployedUiSourceCode2 = debuggerWorkspaceBinding.uiSourceCodeForScript(deployedScript);
      if (deployedUiSourceCode2) {
        return deployedUiSourceCode2;
      }
    }
    const [deployedStylesUrl] = Bindings.SASSSourceMapping.SASSSourceMapping.uiSourceOrigin(uiSourceCode);
    if (!deployedStylesUrl) {
      return null;
    }
    const deployedUiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(deployedStylesUrl) || Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(
      Common.ParsedURL.ParsedURL.urlWithoutHash(deployedStylesUrl)
    );
    return deployedUiSourceCode;
  }
}
function getScript(contentProvider) {
  if (!(contentProvider instanceof Workspace.UISourceCode.UISourceCode)) {
    return null;
  }
  const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(contentProvider);
  const model = target?.model(SDK.DebuggerModel.DebuggerModel);
  if (model) {
    const resourceFile = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptFile(contentProvider, model);
    if (resourceFile?.script) {
      return resourceFile.script;
    }
  }
  return Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptsForUISourceCode(
    contentProvider
  )[0] ?? null;
}
//# sourceMappingURL=PersistenceActions.js.map
