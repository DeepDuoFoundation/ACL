export interface LayoutData {
    format: "gdsii" | "oasis";
    layers: Map<number, Polygon[]>;
    cells: Cell[];
    topCell: Cell;
    boundingBox: BBox;
    metadata: LayoutMetadata;
}
export interface Polygon {
    layer: number;
    datatype: number;
    points: Point2D[];
}
export interface Point2D {
    x: number;
    y: number;
}
export interface Cell {
    name: string;
    polygons: Polygon[];
    references: CellReference[];
}
export interface CellReference {
    cellName: string;
    x: number;
    y: number;
    rotation?: number;
    scale?: number;
}
export interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export interface LayoutMetadata {
    sourcePath: string;
    fileSizeBytes: number;
    parseTimeMs: number;
    totalPolygons: number;
    totalCells: number;
}
//# sourceMappingURL=layout.d.ts.map