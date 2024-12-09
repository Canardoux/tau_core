import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { FilePath as mojoBase_mojom_FilePath } from './file_path.mojom-webui.js';
export declare const SafeBaseNameSpec: {
    $: mojo.internal.MojomType;
};
export interface SafeBaseNameMojoType {
    path: mojoBase_mojom_FilePath;
}
export type SafeBaseName = SafeBaseNameMojoType;
