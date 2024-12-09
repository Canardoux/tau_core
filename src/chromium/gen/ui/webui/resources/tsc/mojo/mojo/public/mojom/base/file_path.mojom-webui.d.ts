import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const FilePathSpec: {
    $: mojo.internal.MojomType;
};
export declare const RelativeFilePathSpec: {
    $: mojo.internal.MojomType;
};
export interface FilePathMojoType {
    path: string;
}
export type FilePath = FilePathMojoType;
export interface RelativeFilePathMojoType {
    path: string;
}
export type RelativeFilePath = RelativeFilePathMojoType;
