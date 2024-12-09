import { CrTreeBaseElement } from './cr_tree_base.js';
export declare class CrTreeElement extends CrTreeBaseElement {
    static get template(): string | TrustedHTML;
    private selectedItem_;
    /**
     * Initializes the element.
     */
    connectedCallback(): void;
    /**
     * The depth of the node. This is 0 for the tree itself.
     */
    get depth(): number;
    get itemsRoot(): DocumentFragment | HTMLElement;
    set depth(_depth: number);
    setParent(_parent: CrTreeBaseElement): void;
    /**
     * The selected tree item or null if none.
     */
    get selectedItem(): CrTreeBaseElement | null;
    set selectedItem(item: CrTreeBaseElement | null);
    addAt(child: CrTreeBaseElement, index: number): void;
    /**
     * Handles keydown events on the tree and updates selection and exanding
     * of tree items.
     */
    handleKeyDown(e: KeyboardEvent): void;
    setIconVisibility(visibility: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-tree': CrTreeElement;
    }
}
