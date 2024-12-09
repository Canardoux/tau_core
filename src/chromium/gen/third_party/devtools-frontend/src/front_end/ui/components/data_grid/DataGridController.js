"use strict";
import "./DataGrid.js";
import * as i18n from "../../../core/i18n/i18n.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as UI from "../../legacy/legacy.js";
import dataGridControllerStyles from "./dataGridController.css.js";
import {
  getRowEntryForColumnId,
  getStringifiedCellValues,
  SortDirection
} from "./DataGridUtils.js";
const { html } = LitHtml;
const UIStrings = {
  /**
   *@description Text announced when the column is sorted in ascending order
   *@example {title} PH1
   */
  sortInAscendingOrder: "{PH1} sorted in ascending order",
  /**
   *@description Text announced when the column is sorted in descending order
   *@example {title} PH1
   */
  sortInDescendingOrder: "{PH1} sorted in descending order",
  /**
   *@description Text announced when the column sorting canceled
   *@example {title} PH1
   */
  sortingCanceled: "{PH1} sorting canceled"
};
const str_ = i18n.i18n.registerUIStrings("ui/components/data_grid/DataGridController.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class DataGridController extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #hasRenderedAtLeastOnce = false;
  #columns = [];
  #rows = [];
  #contextMenus = void 0;
  #label = void 0;
  #showScrollbar = false;
  #striped = false;
  /**
   * Because the controller will sort data in place (e.g. mutate it) when we get
   * new data in we store the original data separately. This is so we don't
   * mutate the data we're given, but a copy of the data. If our `get data` is
   * called, we'll return the original, not the sorted data.
   */
  #originalColumns = [];
  #originalRows = [];
  #sortState = null;
  #filters = [];
  #autoScrollToBottom = true;
  #paddingRowsCount;
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [dataGridControllerStyles];
  }
  get data() {
    return {
      columns: this.#originalColumns,
      rows: this.#originalRows,
      filters: this.#filters,
      autoScrollToBottom: this.#autoScrollToBottom,
      contextMenus: this.#contextMenus,
      label: this.#label,
      paddingRowsCount: this.#paddingRowsCount,
      showScrollbar: this.#showScrollbar,
      striped: this.#striped
    };
  }
  set data(data) {
    this.#originalColumns = data.columns;
    this.#originalRows = data.rows;
    this.#contextMenus = data.contextMenus;
    this.#filters = data.filters || [];
    this.#contextMenus = data.contextMenus;
    this.#label = data.label;
    this.#showScrollbar = data.showScrollbar;
    this.#striped = data.striped;
    if (typeof data.autoScrollToBottom === "boolean") {
      this.#autoScrollToBottom = data.autoScrollToBottom;
    }
    this.#columns = [...this.#originalColumns];
    this.#rows = this.#cloneAndFilterRows(data.rows, this.#filters);
    if (!this.#hasRenderedAtLeastOnce && data.initialSort) {
      this.#sortState = data.initialSort;
    }
    if (this.#sortState) {
      this.#sortRows(this.#sortState);
    }
    this.#paddingRowsCount = data.paddingRowsCount;
    this.#render();
  }
  #testRowWithFilter(row, filter, visibleColumnIds) {
    let rowMatchesFilter = false;
    const { key, text, negative, regex } = filter;
    let dataToTest;
    if (key) {
      dataToTest = getStringifiedCellValues([getRowEntryForColumnId(row, key)]);
    } else {
      dataToTest = getStringifiedCellValues(row.cells.filter((cell) => visibleColumnIds.has(cell.columnId)));
    }
    if (regex) {
      rowMatchesFilter = regex.test(dataToTest);
    } else if (text) {
      rowMatchesFilter = dataToTest.includes(text.toLowerCase());
    }
    return negative ? !rowMatchesFilter : rowMatchesFilter;
  }
  #cloneAndFilterRows(rows, filters) {
    if (filters.length === 0) {
      return [...rows];
    }
    const visibleColumnIds = new Set(this.#columns.filter((column) => column.visible).map((column) => column.id));
    return rows.map((row) => {
      let rowShouldBeVisible = true;
      for (const filter of filters) {
        const rowMatchesFilter = this.#testRowWithFilter(row, filter, visibleColumnIds);
        if (!rowMatchesFilter) {
          rowShouldBeVisible = false;
          break;
        }
      }
      return {
        ...row,
        hidden: !rowShouldBeVisible
      };
    });
  }
  #sortRows(state) {
    const { columnId, direction } = state;
    this.#rows.sort((row1, row2) => {
      const cell1 = getRowEntryForColumnId(row1, columnId);
      const cell2 = getRowEntryForColumnId(row2, columnId);
      const value1 = typeof cell1.value === "number" ? cell1.value : String(cell1.value).toUpperCase();
      const value2 = typeof cell2.value === "number" ? cell2.value : String(cell2.value).toUpperCase();
      if (value1 < value2) {
        return direction === SortDirection.ASC ? -1 : 1;
      }
      if (value1 > value2) {
        return direction === SortDirection.ASC ? 1 : -1;
      }
      return 0;
    });
    this.#render();
  }
  #onColumnHeaderClick(event) {
    const { column } = event.data;
    if (column.sortable) {
      this.#applySortOnColumn(column);
    }
  }
  #applySortOnColumn(column) {
    if (this.#sortState && this.#sortState.columnId === column.id) {
      const { columnId, direction } = this.#sortState;
      if (direction === SortDirection.DESC) {
        this.#sortState = null;
      } else {
        this.#sortState = {
          columnId,
          direction: SortDirection.DESC
        };
      }
    } else {
      this.#sortState = {
        columnId: column.id,
        direction: SortDirection.ASC
      };
    }
    const headerName = column.title;
    if (this.#sortState) {
      this.#sortRows(this.#sortState);
      UI.ARIAUtils.alert(
        this.#sortState.direction === SortDirection.ASC ? i18nString(UIStrings.sortInAscendingOrder, { PH1: headerName || "" }) : i18nString(UIStrings.sortInDescendingOrder, { PH1: headerName || "" })
      );
    } else {
      this.#rows = this.#cloneAndFilterRows(this.#originalRows, this.#filters);
      this.#render();
      UI.ARIAUtils.alert(i18nString(UIStrings.sortingCanceled, { PH1: headerName || "" }));
    }
  }
  #onContextMenuColumnSortClick(event) {
    this.#applySortOnColumn(event.data.column);
  }
  #onContextMenuHeaderResetClick() {
    this.#sortState = null;
    this.#rows = [...this.#originalRows];
    this.#render();
  }
  #render() {
    LitHtml.render(html`
      <devtools-data-grid .data=${{
      columns: this.#columns,
      rows: this.#rows,
      activeSort: this.#sortState,
      contextMenus: this.#contextMenus,
      label: this.#label,
      paddingRowsCount: this.#paddingRowsCount,
      showScrollbar: this.#showScrollbar,
      striped: this.#striped,
      autoScrollToBottom: this.#autoScrollToBottom
    }}
        @columnheaderclick=${this.#onColumnHeaderClick}
        @contextmenucolumnsortclick=${this.#onContextMenuColumnSortClick}
        @contextmenuheaderresetclick=${this.#onContextMenuHeaderResetClick}
     ></devtools-data-grid>
    `, this.#shadow, {
      host: this
    });
    this.#hasRenderedAtLeastOnce = true;
  }
}
customElements.define("devtools-data-grid-controller", DataGridController);
//# sourceMappingURL=DataGridController.js.map
