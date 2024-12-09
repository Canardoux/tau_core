"use strict";
import * as TextUtils from "../../../../models/text_utils/text_utils.js";
import * as LinearMemoryInspectorComponents from "../../../../panels/linear_memory_inspector/components/components.js";
import * as UI from "../../legacy.js";
const MEMORY_TRANSFER_MIN_CHUNK_SIZE = 1e3;
class LinearMemoryInspectorView extends UI.Widget.VBox {
  #memory = new Uint8Array([0]);
  #address = 0;
  #inspector = new LinearMemoryInspectorComponents.LinearMemoryInspector.LinearMemoryInspector();
  constructor() {
    super(false);
    this.#inspector.addEventListener(
      LinearMemoryInspectorComponents.LinearMemoryInspector.MemoryRequestEvent.eventName,
      this.#memoryRequested.bind(this)
    );
    this.#inspector.addEventListener(
      LinearMemoryInspectorComponents.LinearMemoryInspector.AddressChangedEvent.eventName,
      (event) => {
        this.#address = event.data;
      }
    );
    this.contentElement.appendChild(this.#inspector);
  }
  wasShown() {
    this.refreshData();
  }
  setMemory(memory) {
    this.#memory = memory;
    this.refreshData();
  }
  refreshData() {
    const memoryChunkStart = Math.max(0, this.#address - MEMORY_TRANSFER_MIN_CHUNK_SIZE / 2);
    const memoryChunkEnd = memoryChunkStart + MEMORY_TRANSFER_MIN_CHUNK_SIZE;
    const memory = this.#memory.slice(memoryChunkStart, memoryChunkEnd);
    this.#inspector.data = {
      memory,
      address: this.#address,
      memoryOffset: memoryChunkStart,
      outerMemoryLength: this.#memory.length,
      hideValueInspector: true
    };
  }
  #memoryRequested(event) {
    const { start, end, address } = event.data;
    if (address < start || address >= end) {
      throw new Error("Requested address is out of bounds.");
    }
    if (start < 0 || start > end || start >= this.#memory.length) {
      throw new Error("Requested range is out of bounds.");
    }
    const chunkEnd = Math.max(end, start + MEMORY_TRANSFER_MIN_CHUNK_SIZE);
    const memory = this.#memory.slice(start, chunkEnd);
    this.#inspector.data = {
      memory,
      address,
      memoryOffset: start,
      outerMemoryLength: this.#memory.length,
      hideValueInspector: true
    };
  }
}
export class StreamingContentHexView extends LinearMemoryInspectorView {
  #streamingContentData;
  constructor(streamingContentData) {
    super();
    this.#streamingContentData = streamingContentData;
  }
  wasShown() {
    this.#updateMemoryFromContentData();
    this.#streamingContentData.addEventListener(
      TextUtils.StreamingContentData.Events.CHUNK_ADDED,
      this.#updateMemoryFromContentData,
      this
    );
  }
  willHide() {
    super.willHide();
    this.#streamingContentData.removeEventListener(
      TextUtils.StreamingContentData.Events.CHUNK_ADDED,
      this.#updateMemoryFromContentData,
      this
    );
  }
  #updateMemoryFromContentData() {
    const binaryString = window.atob(this.#streamingContentData.content().base64);
    const memory = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
    this.setMemory(memory);
  }
}
//# sourceMappingURL=StreamingContentHexView.js.map
