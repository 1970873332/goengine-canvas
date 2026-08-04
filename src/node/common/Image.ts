import { Vector4Array } from "@goengine/core/src/object/math/vector/Vector4";
import { ResourceUtils, SourceConfig } from "@goengine/web/src/util/Resource";
import { BaseCTXNodeEvent } from "../Base";
import DrawCTXNode, { DrawCTXNodeConfig, DrawCTXNodeRule } from "../Draw";

/**
 * 图像节点
 */
export default class Image extends DrawCTXNode<
    IConfig,
    IStyle,
    BaseCTXNodeEvent
> {
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 资源
     */
    public source?: CanvasImageSource;

    public setConfig(config: IConfig): void {
        super.setConfig(config, true);

        const { source, loadCallback } = config;

        if (source) {
            this.source = ResourceUtils.generateElement(
                source,
                ({ width, height }) => {
                    loadCallback?.({ width, height });

                    if (!source.mode) return;

                    this.size.set(width, height, true);

                    this.updatePath2D();
                },
            );
        }

        !source?.mode && this.updatePath2D();
    }

    public applyStyle(ctx: Canvas.Context2D, style?: IStyle | undefined): void {
        const { filter } = style ?? this.style;

        if (filter && filter !== ctx.filter) {
            ctx.filter = filter;
        }
    }

    public draw(ctx: Canvas.Context2D, style?: IStyle): void {
        if (!this.source || !this.size.valid()) return;

        this.applyStyle(ctx, style);

        const {
                size: { width, height },
                anchor: { x, y },
                source,
            } = this,
            options: Vector4Array = [-x, -y, width, height],
            { offset } = style ?? this.style;

        if (offset) {
            const { x, y, width, height } = offset;

            ctx.drawImage(source, x, y, width, height, ...options);
        } else ctx.drawImage(source, ...options);
    }

    public copy(target: this, silence?: boolean): this {
        const { source } = target;

        Object.assign(this, {
            source,
        });

        return super.copy(target, silence);
    }

    public clearRely(): void {
        const { source } = this;

        if (source instanceof HTMLElement) {
            if (source instanceof HTMLVideoElement) {
                source.pause();
            }

            source.remove();
        } else if (source instanceof ImageBitmap) {
            source.close();
        } else if (source instanceof VideoFrame) {
            source.close();
        } else if (source instanceof OffscreenCanvas) {
            Object.assign(source, { width: 0, height: 0 });
        }
    }

    public destroy(depth?: boolean): void {
        depth && this.clearRely();

        Object.assign(this, {
            source: void 0,
        });

        super.destroy();
    }
}

interface IConfig
    extends
        Variant.Omit<DrawCTXNodeConfig, "style">,
        Partial<Pick<Image, "style">> {
    /**
     * 资源
     */
    source?: SourceConfig;
    /**
     * 加载回调
     * @param v
     * @returns
     */
    loadCallback?: (v: VectorObject.Vector2Size) => void;
}

interface IStyle extends Partial<Pick<CanvasFilters, "filter">> {
    /**
     * 偏移
     */
    offset?: VectorObject.Vector2 & VectorObject.Vector2Size;
}

interface IRule
    extends
        Variant.Omit<DrawCTXNodeRule, "style">,
        Partial<Pick<IConfig, "style">> {}

export { IConfig as ImageConfig, IRule as ImageRule, IStyle as ImageStyle };

declare global {
    namespace Canvas {
        interface TemplateMap {
            /**
             * 图像
             */
            image: IConfig;
        }
    }
}
