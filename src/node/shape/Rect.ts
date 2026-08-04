import { BaseCTXNodeEvent, BaseCTXNodePath } from "../Base";
import DrawCTXNode, {
    DrawCTXNodeConfig,
    DrawCTXNodeRule,
    DrawCTXNodeStyle,
} from "../Draw";
/**
 * 矩形节点
 */
export default class Rect extends DrawCTXNode<
    IConfig,
    IStyle,
    BaseCTXNodeEvent
> {
    /**
     * 自定义圆角矩形构建（确保是单一连续路径）
     */
    public static buildRoundRect(
        path: Path2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number,
    ): void {
        const r2 = Math.min(r, w / 2, h / 2);

        path.moveTo(x + r2, y);
        path.arcTo(x + w, y, x + w, y + h, r2);
        path.arcTo(x + w, y + h, x, y + h, r2);
        path.arcTo(x, y + h, x, y, r2);
        path.arcTo(x, y, x + w, y, r2);
        path.closePath();
    }

    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 圆角
     */
    public radii?: number | DOMPointInit | Iterable<number | DOMPointInit>;

    public setConfig(config: IConfig): void {
        super.setConfig(config, true);

        const { radii = this.radii } = config;

        Object.assign(this, {
            radii,
        });

        this.updatePath2D();
    }

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
                path,
                radii,
                anchor: { x, y },
                size: { width, height },
            } = this,
            options = [-x, -y, width, height] as const;

        if (radii) {
            switch (typeof radii) {
                case "number":
                    Rect.buildRoundRect(path, ...options, radii);
                    break;
                default:
                    path.roundRect(...options);
                    break;
            }
        } else path.rect(...options);
    }

    public applyStyle(ctx: Canvas.Context2D, style?: IStyle): void {
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
        const { radii } = target;

        Object.assign(this, {
            radii,
        });

        return super.copy(target, silence);
    }
}

interface IConfig
    extends
        Variant.Omit<DrawCTXNodeConfig, "style">,
        Partial<Pick<Rect, "style" | "radii">> {}

interface IStyle
    extends
        DrawCTXNodeStyle,
        Partial<CanvasPathDrawingStyles & CanvasFillStrokeStyles> {}

interface IRule
    extends
        Variant.Omit<DrawCTXNodeRule, "style">,
        Partial<Pick<IConfig, "style">> {}

interface IPath
    extends BaseCTXNodePath, Partial<Pick<IConfig, "size" | "radii">> {}

export {
    IConfig as RectConfig,
    IPath as RectPath,
    IRule as RectRule,
    IStyle as RectStyle,
};

declare global {
    namespace Canvas {
        interface TemplateMap {
            /**
             * 矩形
             */
            rect: IConfig;
        }

        interface PathMap {
            /**
             * 矩形
             */
            rect: IPath;
        }
    }
}
