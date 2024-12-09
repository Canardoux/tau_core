"use strict";
import highlightingStyles from "./highlighting.css.js";
export class RangeWalker {
  constructor(root) {
    this.root = root;
    this.#treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    this.#eof = !this.#treeWalker.firstChild();
  }
  #offset = 0;
  #treeWalker;
  #eof;
  #next() {
    this.#offset += this.#treeWalker.currentNode.textContent?.length ?? 0;
    this.#eof = !this.#treeWalker.nextNode();
    return !this.#eof;
  }
  #goToPosition(offset) {
    if (offset < this.#offset || this.#eof) {
      return null;
    }
    while (offset > this.#offset + (this.#treeWalker.currentNode.textContent?.length ?? 0)) {
      if (!this.#next()) {
        return null;
      }
    }
    return this.#treeWalker.currentNode;
  }
  nextRange(start, length) {
    if (length <= 0 || this.#eof) {
      return null;
    }
    const startNode = this.#goToPosition(start);
    if (!startNode) {
      return null;
    }
    const offsetInStartNode = start - this.#offset;
    const endNode = this.#goToPosition(start + length);
    if (!endNode) {
      return null;
    }
    const offsetInEndNode = start + length - this.#offset;
    const range = new Range();
    range.setStart(startNode, offsetInStartNode);
    range.setEnd(endNode, offsetInEndNode);
    return range;
  }
}
export const HIGHLIGHT_REGISTRY = "search-highlight";
let highlightManagerInstance;
export class HighlightManager {
  #highlights = new Highlight();
  constructor() {
    document.adoptedStyleSheets.push(highlightingStyles);
    CSS.highlights.set(HIGHLIGHT_REGISTRY, this.#highlights);
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!highlightManagerInstance || forceNew) {
      highlightManagerInstance = new HighlightManager();
    }
    return highlightManagerInstance;
  }
  addHighlights(ranges) {
    ranges.forEach(this.addHighlight.bind(this));
  }
  removeHighlights(ranges) {
    ranges.forEach(this.removeHighlight.bind(this));
  }
  addHighlight(range) {
    this.#highlights.add(range);
  }
  removeHighlight(range) {
    this.#highlights.delete(range);
  }
  highlightOrderedTextRanges(root, sourceRanges) {
    const rangeWalker = new RangeWalker(root);
    const ranges = sourceRanges.map((range) => rangeWalker.nextRange(range.offset, range.length)).filter((r) => r !== null && !r.collapsed);
    this.addHighlights(ranges);
    return ranges;
  }
}
//# sourceMappingURL=HighlightManager.js.map
