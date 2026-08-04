import Value from "@goengine/core/src/object/attribute/Value";
import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import { BaseCTXNodeEvent, BaseCTXNodePath } from "../Base";
import DrawCTXNode, { DrawCTXNodeConfig, DrawCTXNodeRule } from "../Draw";

/**
 * 圆弧节点
 */
export default class Arc extends DrawCTXNode<
    IConfig,
    IStyle,
    BaseCTXNodeEvent
> {
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * @deprecated
     */
    declare public size: Vector2;
    /**
     * 角度
     */
    public readonly angle = new Value<number>(0).bindCallback(
        this.updatePath2D.bind(this),
    );
    /**
     * 半径
     */
    public readonly radius = new Value<number>(0).bindCallback(
        this.updatePath2D.bind(this),
    );

    public setConfig(config: IConfig): void {
        super.setConfig(config, true);

        const { angle = this.angle.value, radius = this.angle.value } = config;

        this.angle.setter(angle);
        this.radius.setter(radius);

        this.updatePath2D();
    }

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            anchor: { x, y },
            angle: { value: angle },
            radius: { value: radius },
            style: { counterclockwise, offsetAngle = 0 },
        } = this;

        path.arc(
            -x,
            -y,
            radius,
            offsetAngle,
            offsetAngle + angle,
            counterclockwise,
        );
    }

    public applyStyle(ctx: Canvas.Context2D, style?: IStyle | undefined): void {
        const {
            lineWidth = ctx.lineWidth,
            fillStyle = ctx.fillStyle,
            strokeStyle = ctx.strokeStyle,
        } = style ?? this.style;

        ctx.lineWidth = lineWidth;
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
    }

    public draw(ctx: Canvas.Context2D, style?: IStyle): void {
        this.applyStyle(ctx, style);

        const { path } = this,
            { fillStyle, strokeStyle } = style ?? this.style;

        fillStyle && ctx.fill(path);
        strokeStyle && ctx.stroke(path);
    }

    public copy(target: this, silence?: boolean): this {
        const { angle, radius } = target;

        this.angle.setter(angle.value);
        this.radius.setter(radius.value);

        return super.copy(target, silence);
    }

    public destroy(): void {
        this.angle.clearCallback();
        this.radius.clearCallback();

        Object.assign(this, {
            angle: void 0,
            radius: void 0,
        });

        super.destroy();
    }
}

interface IConfig
    extends
        Variant.Omit<DrawCTXNodeConfig, "style" | "size">,
        Partial<Pick<Arc, "style">> {
    /**
     * 角度
     */
    angle?: number;
    /**
     * 半径
     */
    radius?: number;
}

interface IStyle extends Partial<
    CanvasPathDrawingStyles & CanvasFillStrokeStyles
> {
    /**
     * 偏移角度
     */
    offsetAngle?: number;
    /**
     * 逆时针
     */
    counterclockwise?: boolean;
}

interface IRule
    extends
        Variant.Omit<DrawCTXNodeRule, "style">,
        Partial<Pick<IConfig, "style">> {}

interface IPath
    extends BaseCTXNodePath, Partial<Pick<IConfig, "angle" | "radius">> {
    /**
     * 样式
     */
    style?: Partial<Pick<IStyle, "offsetAngle" | "counterclockwise">>;
}

export {
    IConfig as ArcConfig,
    IPath as ArcPath,
    IRule as ArcRule,
    IStyle as ArcStyle,
};

declare global {
    namespace Canvas {
        interface TemplateMap {
            /**
             * 圆弧
             */
            arc: IConfig;
        }

        interface PathMap {
            /**
             * 圆弧
             */
            arc: IPath;
        }
    }
}
