"use strict";
import * as i18n from "../../../../core/i18n/i18n.js";
import * as SDK from "../../../../core/sdk/sdk.js";
import * as UI from "../../legacy.js";
const UIStrings = {
  /**
   *@description Text on the remote debugging window to indicate the connection is lost
   */
  websocketDisconnected: "WebSocket disconnected"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/components/utils/TargetDetachedDialog.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class TargetDetachedDialog extends SDK.SDKModel.SDKModel {
  static hideCrashedDialog;
  constructor(target) {
    super(target);
    target.registerInspectorDispatcher(this);
    void target.inspectorAgent().invoke_enable();
    if (target.parentTarget()?.type() === SDK.Target.Type.BROWSER && TargetDetachedDialog.hideCrashedDialog) {
      TargetDetachedDialog.hideCrashedDialog.call(null);
      TargetDetachedDialog.hideCrashedDialog = null;
    }
  }
  detached({ reason }) {
    UI.RemoteDebuggingTerminatedScreen.RemoteDebuggingTerminatedScreen.show(reason);
  }
  static webSocketConnectionLost() {
    UI.RemoteDebuggingTerminatedScreen.RemoteDebuggingTerminatedScreen.show(
      i18nString(UIStrings.websocketDisconnected)
    );
  }
  targetCrashed() {
    if (TargetDetachedDialog.hideCrashedDialog) {
      return;
    }
    const parentTarget = this.target().parentTarget();
    if (parentTarget && parentTarget.type() !== SDK.Target.Type.BROWSER) {
      return;
    }
    const dialog = new UI.Dialog.Dialog("target-crashed");
    dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.MEASURE_CONTENT);
    dialog.addCloseButton();
    dialog.setDimmed(true);
    TargetDetachedDialog.hideCrashedDialog = dialog.hide.bind(dialog);
    new UI.TargetCrashedScreen.TargetCrashedScreen(() => {
      TargetDetachedDialog.hideCrashedDialog = null;
    }).show(dialog.contentElement);
    dialog.show();
  }
  /** ;
   */
  targetReloadedAfterCrash() {
    void this.target().runtimeAgent().invoke_runIfWaitingForDebugger();
    if (TargetDetachedDialog.hideCrashedDialog) {
      TargetDetachedDialog.hideCrashedDialog.call(null);
      TargetDetachedDialog.hideCrashedDialog = null;
    }
  }
}
SDK.SDKModel.SDKModel.register(TargetDetachedDialog, { capabilities: SDK.Target.Capability.INSPECTOR, autostart: true });
//# sourceMappingURL=TargetDetachedDialog.js.map
