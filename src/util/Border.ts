import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import Vector4 from "@goengine/core/src/object/math/vector/Vector4";

/**
 * 边框工具类
 */
export abstract class BorderUtils {
    /**
     * 等矩形边框
     * @param param0
     * @returns
     */
    public static equalRectBorder({
        size,
        dash,
        lineWidth,
        strokeStyle,
        offset = Vector2.zero(),
    }: EqualRectBorder): Border[] {
        const { width, height } = size,
            { x, y } = offset,
            points: Vector4[] = [
                new Vector4(x, y, width + x, y),
                new Vector4(width + x, y, width + x, height + y),
                new Vector4(width + x, height + y, x, height + y),
                new Vector4(x, height + y, x, y),
            ],
            border: Border[] = [];

        points.forEach(({ ahead, behind }) => {
            const len: number = ahead.distance(behind),
                rounded: number = Math.ceil(len / dash / dash) * dash,
                result: number = len / rounded;

            border.push({
                paths: [ahead, behind],
                lineWidth,
                strokeStyle,
                lineDash: [result, result],
            });
        });

        return border;
    }
    /**
     * 绘制
     * @param ctx
     */
    public static draw(
        ctx: Canvas.Context2D,
        border: Border[],
        offset?: VectorObject.Vector2,
    ): void {
        const { x = 0, y = 0 } = offset ?? {};

        // 应用锚点
        ctx.translate(-x, -y);
        // 绘制边框
        border.forEach(
            ({
                paths,
                lineDash,
                lineWidth = ctx.lineWidth,
                strokeStyle = ctx.strokeStyle,
            }) => {
                // 重置路径
                ctx.beginPath();

                // 应用样式
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = strokeStyle;

                // 应用虚线
                if (Array.isArray(lineDash)) {
                    ctx.setLineDash(
                        lineDash.filter(Boolean) as Iterable<number>,
                    );
                }

                // 绘制路径
                const [{ x, y }, ...Rest] = paths;
                // 移动到起点
                ctx.moveTo(x, y);
                // 连接剩余点
                Rest.forEach(({ x, y }) => ctx.lineTo(x, y));
                // 描边
                ctx.stroke();
            },
        );
    }
}

export interface Border
    extends
        Partial<Pick<CanvasPathDrawingStyles, "lineWidth">>,
        Partial<Pick<CanvasFillStrokeStyles, "strokeStyle">> {
    /**
     * 路径
     */
    paths: VectorObject.Vector2[];
    /**
     * 虚线
     */
    lineDash?: [number, number?];
}

export interface EqualRectBorder extends Pick<
    Border,
    "lineWidth" | "strokeStyle"
> {
    /**
     * 虚线
     */
    dash: number;
    /**
     * 尺寸
     */
    size: VectorObject.Vector2Size;
    /**
     * 偏移
     */
    offset?: VectorObject.Vector2;
}
