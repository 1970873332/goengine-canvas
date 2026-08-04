import { OFFSCREEN_CANVAS_2D } from "@goengine/canvas/src/manager/OffscreenCanvas";
import Value from "@goengine/core/src/object/attribute/Value";
import Vector4 from "@goengine/core/src/object/math/vector/Vector4";
import { BaseCTXNodeEvent } from "../Base";
import DrawCTXNode, { DrawCTXNodeConfig, DrawCTXNodeRule } from "../Draw";

/**
 * 文本节点
 */
export default class Text extends DrawCTXNode<
    IConfig,
    IStyle,
    BaseCTXNodeEvent
> {
    /**
     * 测量文本
     * @param target
     * @returns
     */
    public static measure(target: Text): Vector4 | void {
        if (!OFFSCREEN_CANVAS_2D.ensureValid()) return;

        const {
                text: { value: textValue },
                style: { maxWidth, textAlign, textBaseline },
            } = target,
            ctx = OFFSCREEN_CANVAS_2D.obtainCtx()!;

        // 重置
        ctx.reset();
        // 应用样式
        target.applyStyle(ctx);

        // 测量文本
        const measure = ctx.measureText(textValue),
            {
                actualBoundingBoxLeft,
                actualBoundingBoxRight,
                actualBoundingBoxAscent,
                actualBoundingBoxDescent,
            } = measure,
            aw: number = actualBoundingBoxLeft + actualBoundingBoxRight,
            width: number = Math.min(maxWidth ?? aw, aw),
            height: number = actualBoundingBoxAscent + actualBoundingBoxDescent,
            result = new Vector4(0, 0, width, height);

        switch (textAlign) {
            case "start":
            case "left":
            default:
                result.x = actualBoundingBoxLeft;
                break;
            case "end":
            case "right":
                result.x = -(actualBoundingBoxLeft + actualBoundingBoxRight);
                break;
            case "center":
                result.x = -actualBoundingBoxLeft;
                break;
        }

        switch (textBaseline) {
            case "top":
                result.y = 0;
                break;
            case "bottom":
            default:
                result.y = -height;
                break;
            case "middle":
            case "alphabetic":
            case "ideographic":
                result.y = -actualBoundingBoxAscent;
                break;
            case "hanging":
                result.y = -actualBoundingBoxAscent * 0.2;
                break;
        }

        return result;
    }

    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 文本
     */
    public readonly text = new Value<string>("").bindCallback(
        this.updateBound.bind(this),
    );
    /**
     * 边界
     */
    public readonly bound = Vector4.zero().bindCallback(
        this.updatePath2D.bind(this),
    );

    /**
     * 更新边界
     */
    public updateBound(): void {
        const { bound } = this,
            measure = Text.measure(this);

        measure && bound.copy(measure);
    }

    public setConfig(config: IConfig): void {
        super.setConfig(config, true);

        const { text = this.text.value } = config;

        this.text.setter(text);

        this.updateBound();
    }

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            bound: {
                ahead: { x, y },
                behind: { width, height },
            },
        } = this;

        path.rect(x, y, width, height);
    }

    public applyStyle(ctx: Canvas.Context2D, style?: IStyle | undefined): void {
        const {
            font = ctx.font,
            textAlign = ctx.textAlign,
            textBaseline = ctx.textBaseline,

            fillStyle = ctx.fillStyle,
            strokeStyle = ctx.strokeStyle,
        } = style ?? this.style;

        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
    }

    public draw(ctx: Canvas.Context2D, style?: IStyle): void {
        this.applyStyle(ctx, style);

        const {
                anchor: { x, y },
                text: { value: textValue },
                style: { maxWidth, fillStyle, strokeStyle },
            } = this,
            options = [textValue, -x, -y, maxWidth] as const;

        fillStyle && ctx.fillText(...options);
        strokeStyle && ctx.strokeText(...options);
    }

    public copy(target: this, silence?: boolean): this {
        const { text, bound } = target;

        this.text.setter(text.value);
        this.bound.copy(bound, true);

        return super.copy(target, silence);
    }

    public destroy(): void {
        this.text.clearCallback();
        this.bound.clearCallback();

        Object.assign(this, {
            text: void 0,
            bound: void 0,
        });

        super.destroy();
    }
}

interface IConfig
    extends
        Variant.Omit<DrawCTXNodeConfig, "size" | "style">,
        Partial<Pick<Text, "style">> {
    /**
     * 文本
     */
    text?: string;
}

interface IStyle extends Partial<
    CanvasTextDrawingStyles & CanvasFillStrokeStyles
> {
    /**
     * 最大宽度
     */
    maxWidth?: number;
}

interface IRule
    extends
        Variant.Omit<DrawCTXNodeRule, "style">,
        Partial<Pick<IConfig, "style">> {}

export { IConfig as TextConfig, IRule as TextRule, IStyle as TextStyle };

declare global {
    namespace Canvas {
        interface TemplateMap {
            /**
             * 文本
             */
            text: IConfig;
        }
    }
}
