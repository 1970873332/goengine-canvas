import { Vector2, Vector4 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";

export default class Image<T extends CanvasImageSource, C extends IConfig, E extends IEvent> extends BaseCTXNode<IStyle, C, E> {
    /**
     * 是否是图片
     */
    public static isImage: boolean = true;
    /**
     * 加载图片
     * @param image 
     * @param config 
     * @param callback 
     * @returns 
     */
    public static loadImage(image: Instance<typeof Image>, config: IImage, callback?: Func.CallBack<Vector2>): void {
        if (!(image.target instanceof HTMLImageElement)) return;

        const
            {
                target
            } = image,
            {
                src,
                mode
            } = config;

        target.src = src;

        target.onload = () => {
            const {
                width,
                height
            } = target;

            this.updateSize(image, {
                mode,
                width,
                height
            });

            callback?.(Vector2.fromArray([width, height]));
        }
    }
    /**
     * 加载视频
     * @param video 
     * @param config 
     * @param callback 
     * @returns 
     */
    public static loadVideo(video: Instance<typeof Image>, config: IVideo, callback?: Func.CallBack<Vector2>): void {
        if (!(video.target instanceof HTMLVideoElement)) return;

        const
            {
                target
            } = video,
            {
                src,
                mode,
                autoPlay
            } = config;

        target.src = src;

        target.onloadeddata = () => {
            const {
                videoWidth: width,
                videoHeight: height
            } = target;

            this.updateSize(video, {
                mode,
                width,
                height
            });

            callback?.(Vector2.fromArray([width, height]));
        }

        if (autoPlay) {
            target.muted = true;
            target.load();
            target.oncanplay = () => target.play().catch(() => { console.warn("视频播放失败") });
        }
    }
    /**
     * 更新尺寸
     * @param target 
     * @param param1 
     */
    public static updateSize(target: Instance<typeof Image>, { mode, width, height }: ISizeConfig): void {
        const
            size = target.size.clone(),
            {
                size: {
                    width: sw,
                    height: sh
                }
            } = target;

        switch (mode) {
            case "auto":
                size.set(width, height, true);
                break;
            case "cover":
                if (!size.width) {
                    size.set(width * (sh / height), sh, true);
                } else
                    if (!size.height) {
                        size.set(sw, height * (sw / width), true);
                    }
                break;
        }

        target.size.copy(size);
    }

    constructor(public target?: T, config?: C & { callback?: Func.CallBack<Image<T, C, E>> }, style?: IStyle) {
        super();
        this.style = style ?? this.style;
        config && this.setConfig(config);
        config?.callback?.(this);
    }

    /**
     * 离屏渲染
     */
    protected offscreen?: OffscreenCanvas;
    /**
     * 尺寸
     */
    public readonly size = Vector2.zero().bindCallback(this.refactor.bind(this, false));

    /**
     * 绘制图片
     * @param ctx 
     * @param target 
     */
    private drawImage(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, target: CanvasImageSource, size: Vector2 = this.size): void {
        const
            {
                style: {
                    offset
                }
            } = this,
            {
                width,
                height
            } = size;

        ctx.clearRect(0, 0, width, height);

        if (offset) {
            ctx.drawImage(target, offset.v1, offset.v2, offset.v3, offset.v4, 0, 0, width, height);
        }
        else ctx.drawImage(target, 0, 0, width, height);
    }

    public setConfig(config: C): void {
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

    public draw(ctx: CanvasRenderingContext2D): void {
        const {
            target,
            anchor: { x, y },
            size: { width, height },
        } = this;

        if (!target) return;

        if (target instanceof HTMLImageElement && target.complete) {
            if (!this.offscreen) {
                const {
                    width: tw,
                    height: th
                } = target;

                this.offscreen = new OffscreenCanvas(tw, th);

                const offscreenContext = this.offscreen.getContext("2d")!,
                    {
                        style: { filter = offscreenContext.filter }
                    } = this;

                offscreenContext.filter = filter

                this.drawImage(offscreenContext, target, Vector2.fromArray([tw, th]));
            }
            ctx.drawImage(this.offscreen, -x, -y, width, height);
        }
        else this.drawImage(ctx, target);
    }

    public destroy(): void {
        super.destroy();
        if (this.target instanceof HTMLElement) {

            if (this.target instanceof HTMLVideoElement) {
                this.target.pause();
            }

            this.target.remove();
        }
    }

}

interface IConfig extends BaseCTXNodeConfig, Partial<Pick<Image<any, any, any>, "size">> { }

interface IStyle extends BaseCTXNodeStyle, Partial<Pick<CanvasFilters, "filter">> {
    /**
     * 偏移
     */
    offset?: Vector4;
}

interface IEvent extends BaseCTXNodeEvent { }

interface IAttributes {
    /**
     * 模式
     */
    mode?: TSizeMod;
}

interface IImage extends IAttributes {
    /**
     * 图片地址
     */
    src: string;
}

interface IVideo extends IAttributes {
    /**
     * 视频地址
     */
    src: string;
    /**
     * 自动播放
     */
    autoPlay?: boolean;
}

interface ISizeConfig extends Partial<Pick<IAttributes, "mode">> {
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
}

type TSizeMod = "auto" | "cover";

export { IConfig as ImageConfig, IEvent as ImageEvent, IStyle as ImageStyle, TSizeMod as SizeMod };

