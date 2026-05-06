import BaseCTXNode from "@canvas/node/Base";
import { Scene } from "@canvas/node/Index";
import { Vector2 } from "@core/object/math/Index";

export default class CanvasRenderer {
    /**
     * 变换
     * @param ctx 
     * @param node 
     * @param join 
     */
    public static transform<T>(ctx: CanvasRenderingContext2D, node: Instance<typeof BaseCTXNode>, join: () => T): T {
        const
            {
                worldPosition: { x, y },
                worldRotation: { z: rz },
                worldScale: { x: sx, y: sy },
            } = node;

        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(rz);

        ctx.scale(sx, sy);

        const result: T = join();

        ctx.restore();

        return result;
    }

    /**
     * 画布上下文
     */
    protected declare ctx_source: CanvasRenderingContext2D;
    public get ctx(): CanvasRenderingContext2D {
        return this.ctx_source;
    }

    constructor(config: IConfig) {
        const {
            ctx
        } = config;

        this.ctx_source = ctx;
    }

    /**
     * 渲染节点
     * @param node 
     */
    public renderNode(node: Instance<typeof BaseCTXNode>): void {
        const {
            ctx
        } = this;

        CanvasRenderer.transform(ctx, node, () => {
            node.applyStyle(ctx);

            node.draw(ctx);

            node.drawBorder(ctx);
        });
    }
    /**
     * 渲染场景
     * @param scene 
     */
    public renderScene(scene: Scene): void {
        scene.traverse(node => { node instanceof BaseCTXNode && this.renderNode(node) })
    }
    /**
     * 是否在路径中
     * @param node 
     * @param param1 
     * @returns 
     */
    public isPointInPath(node: Instance<typeof BaseCTXNode>, { x, y }: Vector2): boolean {
        const { path } = node;

        if (!path) return false;

        const {
            ctx
        } = this;

        return CanvasRenderer.transform(ctx, node, () => ctx.isPointInPath(path, x, y));
    }

}

interface IConfig {
    /**
     * 画布上下文
     */
    ctx: CanvasRenderingContext2D;
}