import Scene from "@goengine/canvas/src/node/wrap/Scene";
import CanvasRenderer from "@goengine/canvas/src/render/Canvas";
import CanvasComponent, {
    CanvasComponentEvent,
} from "@goengine/core/src/component/draw/Canvas";

/**
 * 2D画布场景
 */
export default abstract class CTXMap extends CanvasComponent<CanvasComponentEvent> {
    constructor(
        canvas: HTMLCanvasElement,
        config?: CanvasRenderingContext2DSettings,
    ) {
        super(canvas, "2d", {
            alpha: true,
            antialias: true,
            ...config,
        });
    }
    /**
     * 画布渲染器
     */
    public canvasRenderer = new CanvasRenderer({ ctx: this.ctx });
    /**
     * 场景根节点
     */
    public scene = new Scene();

    protected update(time: DOMHighResTimeStamp): void {
        super.update(time);
        this.clear();
        this.canvasRenderer.renderScene(this.scene);
    }

    public destroy(): void {
        this.scene.destroy();
        this.canvasRenderer.destroy();

        super.destroy();
    }
}
