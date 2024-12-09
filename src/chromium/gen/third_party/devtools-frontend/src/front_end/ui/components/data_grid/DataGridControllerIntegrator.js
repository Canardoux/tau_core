"use strict";
import * as Common from "../../../core/common/common.js";
import * as UI from "../../legacy/legacy.js";
import { DataGridController } from "./DataGridController.js";
export class DataGridControllerIntegrator extends UI.Widget.VBox {
  dataGrid;
  #updateThrottler;
  // The `data` here mirrors the data of the DataGridController because
  // the users of this class expects the `data` to be up to date after `update` calls.
  // However, the `update` calls below are debounced for setting `dataGrid`s data
  // for performance reasons.
  #data;
  constructor(data) {
    super(true, true);
    this.dataGrid = new DataGridController();
    this.dataGrid.data = data;
    this.#data = data;
    this.contentElement.appendChild(this.dataGrid);
    this.#updateThrottler = new Common.Throttler.Throttler(0);
  }
  data() {
    return this.#data;
  }
  update(data) {
    if (!data) {
      return;
    }
    this.#data = data;
    void this.#updateThrottler.schedule(async () => {
      this.dataGrid.data = data;
    });
  }
}
//# sourceMappingURL=DataGridControllerIntegrator.js.map
