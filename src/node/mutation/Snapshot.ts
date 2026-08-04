import OffscreenCanvasObject from "@goengine/web/src/object/OffscreenCanvas";
import { BaseCTXNodeAny, BaseCTXNodeEvent } from "../Base";
import Image, { ImageConfig, ImageStyle } from "../common/Image";
import DrawCTXNode from "../Draw";

/**
 * 快照节点
 */
export default class Snapshot
    extends Image
    implements DrawCTXNode<IConfig, ImageStyle, BaseCTXNodeEvent>
{
    constructor(config?: IConfig) {
        super();

        this.source = this.offscreen2D.canvas;
        config && this.setConfig(config);
    }

    /**
     * 目标
     */
    public readonly target?: BaseCTXNodeAny;
    /**
     * 离屏
     */
    public readonly offscreen2D = new OffscreenCanvasObject("2d");

    /**
     * 同步尺寸
     * @param param0
     * @param silence
     */
    public syncSize({ width, height }: VectorObject.Vector2Size): void {
        const { size, offscreen2D } = this;

        size.set(width, height);

        offscreen2D.applySize(size);
    }

    public setConfig(config: IConfig): void {
        const { target } = config;

        Object.assign(this, {
            target,
        });

        super.setConfig(config);
    }

    public clearRely(): void {
        super.clearRely();

        this.target?.destroy();
    }

    public destroy(depth?: boolean): void {
        super.destroy(depth);

        this.offscreen2D.destroy();

        Object.assign(this, {
            target: void 0,
            offscreen2D: void 0,
        });
    }
}

interface IConfig
    extends
        Variant.Omit<ImageConfig, "source" | "loadCallback">,
        Partial<Pick<Snapshot, "target">> {}
