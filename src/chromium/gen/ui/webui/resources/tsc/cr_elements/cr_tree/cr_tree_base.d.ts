import { CustomElement } from '//resources/js/custom_element.js';
export declare const EXPANDED_ATTR: string;
export declare abstract class CrTreeBaseElement extends CustomElement {
    static get template(): string | TrustedHTML;
    static get observedAttributes(): string[];
    detail: object;
    private parent_;
    attributeChangedCallback(name: string, _oldValue: string, newValue: string): void;
    setParent(parent: CrTreeBaseElement): void;
    get items(): CrTreeBaseElement[];
    abstract get depth(): number;
    abstract set depth(depth: number);
    abstract get itemsRoot(): DocumentFragment | HTMLElement;
    abstract get selectedItem(): CrTreeBaseElement | null;
    abstract set selectedItem(item: CrTreeBaseElement | null);
    /**
     * Adds a tree item as a child.
     */
    add(child: CrTreeBaseElement): void;
    /**
     * Adds a tree item as a child at a given index.
     */
    addAt(child: CrTreeBaseElement, index: number): void;
    removeTreeItem(child: CrTreeBaseElement): void;
    get parentItem(): CrTreeBaseElement | null;
    /**
     * The tree that the tree item belongs to or null of no added to a tree.
     */
    get tree(): CrTreeBaseElement | null;
    get hasChildren(): boolean;
    setHasChildren(b: boolean): void;
    get expanded(): boolean;
    set expanded(expanded: boolean);
}
