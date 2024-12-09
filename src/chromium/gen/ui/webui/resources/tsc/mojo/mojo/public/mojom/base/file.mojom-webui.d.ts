import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const FileSpec: {
    $: mojo.internal.MojomType;
};
export declare const ReadOnlyFileSpec: {
    $: mojo.internal.MojomType;
};
export interface FileMojoType {
    fd: MojoHandle;
    async: boolean;
}
export type File = FileMojoType;
export interface ReadOnlyFileMojoType {
    fd: MojoHandle;
    async: boolean;
}
export type ReadOnlyFile = ReadOnlyFileMojoType;
