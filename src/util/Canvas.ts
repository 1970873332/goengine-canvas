import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import Vector4 from "@goengine/core/src/object/math/vector/Vector4";
import { OFFSCREEN_CANVAS_2D } from "../manager/OffscreenCanvas";

/**
 * 画布工具类
 */
export abstract class CanvasUtils {
    /**
     * 图像数据转URL
     * @param imageData
     * @returns
     */
    public static async imageDataToURL(imageData: ImageData): Promise<string> {
        const { width, height } = imageData,
            { canvas } = OFFSCREEN_CANVAS_2D,
            ctx = OFFSCREEN_CANVAS_2D.obtainCtx();

        OFFSCREEN_CANVAS_2D.applySize({ width, height });

        ctx?.clearRect(0, 0, width, height);
        ctx?.putImageData(imageData, 0, 0);

        return URL.createObjectURL(
            await canvas.convertToBlob({ type: "image/png" }),
        );
    }
    /**
     * 线段转顶点
     * @param segments
     * @param closure
     * @returns
     */
    public static segmentsToVertices(
        segments: Vector4[],
        closure?: boolean,
    ): Vector2[] {
        if (!segments.length) return [];
        const vertices: Vector2[] = segments.map((segment) => segment.ahead);
        closure && vertices.push(segments[segments.length - 1].behind);
        return vertices;
    }
    /**
     * 顶点转线段
     * @param vertices
     * @returns
     */
    public static verticesToSegments(
        vertices: Vector2[],
        closure?: boolean,
    ): Vector4[] {
        if (vertices.length < 2) return [];
        const segments: Vector4[] = vertices
            .slice(0, -1)
            .map((vertex: Vector2, index: number) =>
                Vector4.mergeVector2(vertex, vertices[index + 1]),
            );
        closure &&
            segments.push(
                Vector4.mergeVector2(
                    vertices[vertices.length - 1],
                    vertices[0],
                ),
            );
        return segments;
    }
}
