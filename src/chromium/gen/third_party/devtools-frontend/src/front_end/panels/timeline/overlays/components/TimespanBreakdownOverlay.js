"use strict";
import * as i18n from "../../../../core/i18n/i18n.js";
import * as LitHtml from "../../../../ui/lit-html/lit-html.js";
import styles from "./timespanBreakdownOverlay.css.js";
const { html } = LitHtml;
export class TimespanBreakdownOverlay extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #canvasRect = null;
  #sections = null;
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [styles];
  }
  set isBelowEntry(isBelow) {
    this.classList.toggle("is-below", isBelow);
  }
  set canvasRect(rect) {
    if (this.#canvasRect && rect && this.#canvasRect.width === rect.width && this.#canvasRect.height === rect.height) {
      return;
    }
    this.#canvasRect = rect;
    this.#render();
  }
  set sections(sections) {
    if (sections === this.#sections) {
      return;
    }
    this.#sections = sections;
    this.#render();
  }
  /**
   * We use this method after the overlay has been positioned in order to move
   * the section label as required to keep it on screen.
   * If the label is off to the left or right, we fix it to that corner and
   * align the text so the label is visible as long as possible.
   */
  checkSectionLabelPositioning() {
    const sections = this.#shadow.querySelectorAll(".timespan-breakdown-overlay-section");
    if (!sections) {
      return;
    }
    if (!this.#canvasRect) {
      return;
    }
    const paddingForScrollbar = 9;
    const sectionLayoutData = /* @__PURE__ */ new Map();
    for (const section of sections) {
      const label = section.querySelector(".timespan-breakdown-overlay-label");
      if (!label) {
        continue;
      }
      const sectionRect = section.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      sectionLayoutData.set(section, { sectionRect, labelRect, label });
    }
    const minSectionWidthToShowAnyLabel = 30;
    for (const section of sections) {
      const layoutData = sectionLayoutData.get(section);
      if (!layoutData) {
        break;
      }
      const { labelRect, sectionRect, label } = layoutData;
      const labelHidden = sectionRect.width < minSectionWidthToShowAnyLabel;
      const labelTruncated = sectionRect.width - 5 <= labelRect.width;
      label.classList.toggle("labelHidden", labelHidden);
      label.classList.toggle("labelTruncated", labelTruncated);
      if (labelHidden || labelTruncated) {
        continue;
      }
      const labelLeftMarginToCenter = (sectionRect.width - labelRect.width) / 2;
      const newLabelX = sectionRect.x + labelLeftMarginToCenter;
      const labelOffLeftOfScreen = newLabelX < this.#canvasRect.x;
      label.classList.toggle("offScreenLeft", labelOffLeftOfScreen);
      const rightBound = this.#canvasRect.x + this.#canvasRect.width;
      const labelRightEdge = sectionRect.x + labelLeftMarginToCenter + labelRect.width;
      const labelOffRightOfScreen = labelRightEdge > rightBound;
      label.classList.toggle("offScreenRight", labelOffRightOfScreen);
      if (labelOffLeftOfScreen) {
        label.style.marginLeft = `${Math.abs(this.#canvasRect.x - sectionRect.x) + paddingForScrollbar}px`;
      } else if (labelOffRightOfScreen) {
        const leftMargin = rightBound - labelRect.width - sectionRect.x;
        label.style.marginLeft = `${leftMargin}px`;
      } else {
        label.style.marginLeft = `${labelLeftMarginToCenter}px`;
      }
    }
  }
  renderedSections() {
    return Array.from(this.#shadow.querySelectorAll(".timespan-breakdown-overlay-section"));
  }
  #renderSection(section) {
    return html`
      <div class="timespan-breakdown-overlay-section">
        <div class="timespan-breakdown-overlay-label">
        ${section.showDuration ? html`
            <span class="duration-text">${i18n.TimeUtilities.formatMicroSecondsAsMillisFixed(section.bounds.range)}</span>
          ` : LitHtml.nothing}
          <span class="section-label-text">
            ${section.label}
          </span>
        </div>
      </div>`;
  }
  #render() {
    if (this.#sections) {
      this.classList.toggle("odd-number-of-sections", this.#sections.length % 2 === 1);
      this.classList.toggle("even-number-of-sections", this.#sections.length % 2 === 0);
    }
    LitHtml.render(html`${this.#sections?.map(this.#renderSection)}`, this.#shadow, { host: this });
    this.checkSectionLabelPositioning();
  }
}
customElements.define("devtools-timespan-breakdown-overlay", TimespanBreakdownOverlay);
//# sourceMappingURL=TimespanBreakdownOverlay.js.map
