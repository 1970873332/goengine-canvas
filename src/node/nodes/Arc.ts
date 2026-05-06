import Value from "@core/object/attribute/Value";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";

/**
 * 圆弧
 */
export default class Arc extends BaseCTXNode<IConfig, IStyle, IEvent> {
    /**
     * 是否是圆弧
     */
    public readonly isArc: boolean = true;

    constructor(config?: IConfig, style?: IStyle) {
        super();
        this.style = style ?? this.style;
        config && this.setConfig(config);
    }

    /**
     * 半径
     */
    public readonly radius = new Value<number>(0).bindCallback(this.refactor.bind(this, false));
    /**
     * 角度
     */
    public readonly angle = new Value<number>(0).bindCallback(this.refactor.bind(this, false));

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            angle,
            radius
        } = config;

        this.angle.setter(angle ?? this.angle.value);
        this.radius.setter(radius ?? this.radius.value);

        this.refactor(true);
    }

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            anchor: { x, y },
            angle: { value: angle },
            radius: { value: radius },
            style: {
                clockwise,
                offsetAngle = 0
            }
        } = this;

        path.arc(-x, -y, radius, offsetAngle, offsetAngle + angle, clockwise);
    }

    public applyStyle(ctx: CanvasRenderingContext2D): void {
        const {
            style: {
                lineWidth,
                fillStyle,
                strokeStyle
            },
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

interface IConfig extends BaseCTXNodeConfig {
    /**
     * 角度
     */
    angle?: number;
    /**
     * 半径
     */
    radius?: number;
}

interface IStyle extends BaseCTXNodeStyle, Partial<CanvasPathDrawingStyles & CanvasFillStrokeStyles> {
    /**
     * 偏移角度
     */
    offsetAngle?: number;
    /**
     * 顺时针
     */
    clockwise?: boolean;
}

interface IEvent extends BaseCTXNodeEvent { }

export { IConfig as ArcConfig, IEvent as ArcEvent, IStyle as ArcStyle };

