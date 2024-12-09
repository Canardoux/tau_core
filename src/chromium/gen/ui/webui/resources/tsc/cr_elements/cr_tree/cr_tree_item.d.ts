import { CrTreeBaseElement } from './cr_tree_base.js';
/**
 * @fileoverview cr-tree-item represents a node in a tree structure. Child items
 * can be added or removed using the add/addAt/removeItem methods. A parent can
 * be set using the setParent() method; the parent may be a cr-tree or
 * cr-tree-item. Adding items declaratively is not currently supported, as this
 * class is primarily intended to replace cr.ui.TreeItem, which is used for
 * cases of creating trees at runtime (e.g. from backend data).
 */
export declare const SELECTED_ATTR: string;
export declare const MAY_HAVE_CHILDREN_ATTR: string;
export declare class CrTreeItemElement extends CrTreeBaseElement {
    static get template(): string | TrustedHTML;
    static get observedAttributes(): string[];
    private label_;
    private extraAriaLabel_;
    private depth_;
    private rowElement_;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    forceHoverStyle(hover: boolean): void;
    private onSelectedChange_;
    private onExpandedChange_;
    get depth(): number;
    set depth(depth: number);
    get itemsRoot(): DocumentFragment | HTMLElement;
    removeTreeItem(child: CrTreeItemElement): void;
    /**
     * Whether the tree item has children.
     */
    setHasChildren(hasChildren: boolean): void;
    set selectedItem(_item: CrTreeBaseElement | null);
    get selectedItem(): CrTreeBaseElement | null;
    private handleMouseDown_;
    private handleExpandMouseDown_;
    /**
     * Handles double click events on the tree item.
     */
    private handleDblClick_;
    /**
     * Called when the user clicks on a tree item's expand icon.
     */
    private handleExpandClick_;
    /**
     * Called when the user clicks on a tree item.
     */
    private handleClick_;
    /**
     * Expands all parent items.
     */
    reveal(): void;
    /**
     * The element containing the label text.
     */
    get labelElement(): HTMLElement;
    get rowElement(): HTMLElement;
    /**
     * The label text.
     */
    get label(): string;
    set label(s: string);
    setExtraAriaLabel(s: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-tree-item': CrTreeItemElement;
    }
}
