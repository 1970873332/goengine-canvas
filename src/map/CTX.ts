import { Scene } from "@canvas/node/Index";
import CanvasRenderer from "@canvas/render/Canvas";
import CanvasComponent, { CanvasComponentEvent } from "@core/component/draw/Canvas";

/**
 * 2D画布场景
 */
export default abstract class CTXMap extends CanvasComponent<IEvent> {
    /**
     * 画布渲染器
     */
    public declare canvasRenderer: CanvasRenderer;
    /**
     * 场景根节点
     */
    public scene = new Scene();
}

interface IEvent extends CanvasComponentEvent { }
