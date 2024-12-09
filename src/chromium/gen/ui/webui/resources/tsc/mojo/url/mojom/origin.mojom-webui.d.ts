import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { UnguessableToken as mojoBase_mojom_UnguessableToken } from '../../mojo/public/mojom/base/unguessable_token.mojom-webui.js';
export declare const OriginSpec: {
    $: mojo.internal.MojomType;
};
export interface OriginMojoType {
    scheme: string;
    host: string;
    port: number;
    nonceIfOpaque: (mojoBase_mojom_UnguessableToken | null);
}
export type Origin = OriginMojoType;
