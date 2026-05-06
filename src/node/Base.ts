import { Vector2, Vector4 } from "@core/object/math/Index";
import BaseNode, { BaseNodeConfig, BaseNodeEvent } from "@core/object/Node";

/**
 * 基础ctx节点
 */
export default abstract class BaseCTXNode<
    C extends IConfig,
    S extends IStyle,
    E extends IEvent,
> extends BaseNode<C, E, BaseCTXNode<any, any, any>> {
    /**
     * 相等边框
     * @param size 
     */
    public static equalEdge({ size, line, dash, color, offset = Vector2.zero() }: IEqualEdge): IBorder[] {
        const
            { width, height } = size,
            { x, y } = offset,
            points: Vector4[] = [
                Vector4.fromArray([x, y, width + x, y]),
                Vector4.fromArray([width + x, y, width + x, height + y]),
                Vector4.fromArray([width + x, height + y, x, height + y]),
                Vector4.fromArray([x, height + y, x, y])
            ],
            edges: IBorder[] = [];

        points.forEach(({ ahead, behind }) => {
            const
                len: number = ahead.distance(behind),
                rounded: number = Math.ceil(len / dash / dash) * dash,
                result: number = len / rounded;
            edges.push({
                paths: [ahead, behind],
                lineWidth: line,
                strokeStyle: color,
                lineDash: [result, result]
            });
        });

        return edges;
    }

    /**
     * 是否是ctx节点
     */
    public readonly isCTXNode: boolean = true;

    /**
     * 样式
     */
    public style: S = {} as S;
    /**
     * 边框
     */
    public edges?: IBorder[];
    /**
     * 路径
     */
    public declare path: Path2D;

    /**
     * 更新路径
     * @returns 
     */
    public updatePath2D(): void { }
    /**
     * 应用样式
     * @param ctx 
     */
    public applyStyle(ctx: CanvasRenderingContext2D): void { }
    /**
     * 绘制
     */
    public draw(ctx: CanvasRenderingContext2D): void { }
    /**
     * 绘制边框
     * @param ctx 
     */
    public drawBorder(ctx: CanvasRenderingContext2D): void {
        if (!this.edges) return;

        ctx.save();

        this.edges.forEach(({ paths, lineWidth = ctx.lineWidth, strokeStyle = ctx.strokeStyle, lineDash }) => {
            ctx.beginPath();

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;

            Array.isArray(lineDash) && ctx.setLineDash(lineDash as number[]);

            if (paths instanceof Path2D) {
                ctx.stroke(paths);
            } else {
                const [{ x, y }, ...Rest] = paths;

                ctx.moveTo(x, y);

                Rest.forEach(({ x, y }) => ctx.lineTo(x, y));

                ctx.stroke();
            }
        });

        ctx.restore();
    }

    /**
     * 重构
     * @param silent 
     */
    public refactor(silent?: boolean): void {
        this.updatePath2D();
        !silent && this.trigger();
    }
}

interface IStyle { }

interface IConfig extends BaseNodeConfig { }

interface IEvent extends BaseNodeEvent { }

interface IBorder extends Partial<Pick<CanvasPathDrawingStyles, "lineWidth">>, Partial<Pick<CanvasFillStrokeStyles, "strokeStyle">> {
    /**
     * 路径
     */
    paths: Vector2[] | Path2D;
    /**
     * 虚线
     */
    lineDash?: [number, number?];
}

interface IEqualEdge {
    /**
     * 尺寸
     */
    size: Vector2;
    /**
     * 偏移
     */
    offset?: Vector2;
    /**
     * 线宽
     */
    line?: number;
    /**
     * 虚线
     */
    dash: number;
    /**
     * 颜色
     */
    color?: string;
}

export { IBorder as BaseCTXNodeBorder, IConfig as BaseCTXNodeConfig, IEvent as BaseCTXNodeEvent, IStyle as BaseCTXNodeStyle };

