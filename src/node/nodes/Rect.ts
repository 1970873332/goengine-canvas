import { Vector2 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";
/**
 * 矩形
 */
export default class Rect extends BaseCTXNode<IConfig, IStyle, IEvent> {
    /**
     * 是否是矩形
     */
    public readonly isRect: boolean = true;

    constructor(config?: IConfig, style?: IStyle) {
        super();
        this.style = style ?? this.style;
        config && this.setConfig(config);
    }

    /**
     * 尺寸
     */
    public readonly size = Vector2.zero().bindCallback(this.refactor.bind(this, false));

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            size
        } = config;

        size && this.size.copy(size, true);

        this.refactor(true);
    }

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            anchor: { x, y },
            size: { width, height }
        } = this;

        path.rect(-x, -y, width, height);
    }

    public applyStyle(ctx: CanvasRenderingContext2D): void {
        const {
            style: {
                lineWidth,
                fillStyle,
                strokeStyle
            }
        } = this;

        ctx.lineWidth = lineWidth ?? ctx.lineWidth;
        ctx.fillStyle = fillStyle ?? ctx.fillStyle;
        ctx.strokeStyle = strokeStyle ?? ctx.strokeStyle;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {
            path,
            style: {
                fillStyle,
                strokeStyle
            }
        } = this;

        fillStyle && ctx.fill(path);
        strokeStyle && ctx.stroke(path);
    }

}

interface IConfig extends BaseCTXNodeConfig, Partial<Pick<Rect, "size">> { }

interface IStyle extends BaseCTXNodeStyle, Partial<CanvasPathDrawingStyles & CanvasFillStrokeStyles> { }

interface IEvent extends BaseCTXNodeEvent { }

export { IConfig as RectConfig, IEvent as RectEvent, IStyle as RectStyle };

