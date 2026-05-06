import Value from "@core/object/attribute/Value";
import { Vector4 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";

export default class Text extends BaseCTXNode<IConfig, IStyle, IEvent> {
    /**
     * 是否是文本
     */
    public static isText: boolean = true;

    constructor(config?: IConfig, style?: IStyle, protected ctx?: CanvasRenderingContext2D) {
        super();
        this.style = style ?? this.style;
        config && this.setConfig(config);
    }

    /**
     * 文本
     */
    public readonly text = new Value<string>("").bindCallback(this.refactor.bind(this, false));
    /**
     * 边界
     */
    public readonly bound: Vector4 = Vector4.zero();

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            text,
        } = config;

        this.text.setter(text ?? this.text.value);

        this.refactor(true);
    }

    public updatePath2D(): void {
        if (!this.ctx || !this.text) return;

        this.path = new Path2D();

        this.applyStyle(this.ctx);

        const {
            path,
            anchor: { x, y },
            text: { value: text },
            style: {
                maxWidth,
                textAlign,
                textBaseline
            }
        } = this,
            measure = this.ctx.measureText(text),
            {
                actualBoundingBoxLeft,
                actualBoundingBoxRight,
                actualBoundingBoxAscent,
                actualBoundingBoxDescent,
            } = measure,
            aw: number = actualBoundingBoxLeft + actualBoundingBoxRight,
            width: number = Math.min(maxWidth ?? aw, aw),
            height: number = actualBoundingBoxAscent + actualBoundingBoxDescent,
            bound = Vector4.fromArray([0, 0, width, height]);

        switch (textAlign) {
            case "start":
            case "left":
            default:
                bound.x = actualBoundingBoxLeft;
                break;
            case "end":
            case "right":
                bound.x = actualBoundingBoxRight;
                break;
            case "center":
                bound.x = -actualBoundingBoxLeft;
                break;
        }

        switch (textBaseline) {
            case "top":
                bound.y = 0;
                break;
            case "bottom":
            default:
                bound.y = -height;
                break;
            case "middle":
            case "alphabetic":
            case "ideographic":
                bound.y = -actualBoundingBoxAscent;
                break;
            case "hanging":
                bound.y = -actualBoundingBoxAscent * 0.2;
                break;
        }

        this.bound.copy(bound.sub(new Vector4(x, y, x, y)));
        path.rect(bound.v1, bound.v2, bound.v3, bound.v4);
    }

    public applyStyle(ctx: CanvasRenderingContext2D): void {
        if (!this.text) return;

        const {
            style: {
                font,
                textAlign,
                textBaseline,

                fillStyle,
                strokeStyle,
            }
        } = this;

        ctx.font = font ?? ctx.font;
        ctx.textAlign = textAlign ?? ctx.textAlign;
        ctx.textBaseline = textBaseline ?? ctx.textBaseline;

        ctx.fillStyle = fillStyle ?? ctx.fillStyle;
        ctx.strokeStyle = strokeStyle ?? ctx.strokeStyle;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.text) return;

        const {
            anchor: { x, y },
            text: { value: text },
            style: {
                maxWidth,
                fillStyle,
                strokeStyle
            }
        } = this;

        fillStyle && ctx.fillText(text, -x, -y, maxWidth);
        strokeStyle && ctx.strokeText(text, -x, -y, maxWidth);
    }

}

interface IConfig extends BaseCTXNodeConfig {
    /**
     * 文本
     */
    text?: string;
}

interface IStyle extends BaseCTXNodeStyle, Partial<CanvasTextDrawingStyles & CanvasFillStrokeStyles> {
    /**
     * 最大宽度
     */
    maxWidth?: number;
}

interface IEvent extends BaseCTXNodeEvent { }