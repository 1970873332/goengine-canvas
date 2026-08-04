import Matrix4 from "@goengine/core/src/object/math/matrix/Matrix4";
import OffscreenCanvasObject from "@goengine/web/src/object/OffscreenCanvas";
import { TransformUtils } from "../util/Transform";

/**
 * 离屏画布对象
 */
export const OFFSCREEN_CANVAS_2D = new OffscreenCanvasObject("2d");
/**
 * 离屏画布管理器
 */
export default abstract class OffscreenCanvas2DManager {
    /**
     * 应用矩阵
     * @param matrix
     * @param callback
     * @returns
     */
    public static applyMatrix<T>(
        matrix: Matrix4,
        callback?: (ctx: OffscreenCanvasRenderingContext2D) => T,
    ): T | undefined {
        if (!OFFSCREEN_CANVAS_2D.valid()) return;

        const ctx = OFFSCREEN_CANVAS_2D.obtainCtx()!;

        TransformUtils.transformMatrix(ctx, matrix);

        return callback?.(ctx);
    }
}
