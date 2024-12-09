import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const PointSpec: {
    $: mojo.internal.MojomType;
};
export declare const PointFSpec: {
    $: mojo.internal.MojomType;
};
export declare const Point3FSpec: {
    $: mojo.internal.MojomType;
};
export declare const SizeSpec: {
    $: mojo.internal.MojomType;
};
export declare const SizeFSpec: {
    $: mojo.internal.MojomType;
};
export declare const RectSpec: {
    $: mojo.internal.MojomType;
};
export declare const RectFSpec: {
    $: mojo.internal.MojomType;
};
export declare const InsetsSpec: {
    $: mojo.internal.MojomType;
};
export declare const InsetsFSpec: {
    $: mojo.internal.MojomType;
};
export declare const Vector2dSpec: {
    $: mojo.internal.MojomType;
};
export declare const Vector2dFSpec: {
    $: mojo.internal.MojomType;
};
export declare const Vector3dFSpec: {
    $: mojo.internal.MojomType;
};
export declare const QuaternionSpec: {
    $: mojo.internal.MojomType;
};
export declare const QuadFSpec: {
    $: mojo.internal.MojomType;
};
export interface PointMojoType {
    x: number;
    y: number;
}
export type Point = PointMojoType;
export interface PointFMojoType {
    x: number;
    y: number;
}
export type PointF = PointFMojoType;
export interface Point3FMojoType {
    x: number;
    y: number;
    z: number;
}
export type Point3F = Point3FMojoType;
export interface SizeMojoType {
    width: number;
    height: number;
}
export type Size = SizeMojoType;
export interface SizeFMojoType {
    width: number;
    height: number;
}
export type SizeF = SizeFMojoType;
export interface RectMojoType {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type Rect = RectMojoType;
export interface RectFMojoType {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type RectF = RectFMojoType;
export interface InsetsMojoType {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
export type Insets = InsetsMojoType;
export interface InsetsFMojoType {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
export type InsetsF = InsetsFMojoType;
export interface Vector2dMojoType {
    x: number;
    y: number;
}
export type Vector2d = Vector2dMojoType;
export interface Vector2dFMojoType {
    x: number;
    y: number;
}
export type Vector2dF = Vector2dFMojoType;
export interface Vector3dFMojoType {
    x: number;
    y: number;
    z: number;
}
export type Vector3dF = Vector3dFMojoType;
export interface QuaternionMojoType {
    x: number;
    y: number;
    z: number;
    w: number;
}
export type Quaternion = QuaternionMojoType;
export interface QuadFMojoType {
    p1: PointF;
    p2: PointF;
    p3: PointF;
    p4: PointF;
}
export type QuadF = QuadFMojoType;
