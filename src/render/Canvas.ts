import {
    BaseCTXNodeAny,
    BaseCTXNodeRule,
} from "@goengine/canvas/src/node/Base";
import Scene from "@goengine/canvas/src/node/wrap/Scene";
import OffscreenCanvasObject from "@goengine/web/src/object/OffscreenCanvas";
import AssociatedCTXNode from "../node/Associated";
import DrawCTXNode, { DrawCTXNodeAny, DrawCTXNodeRule } from "../node/Draw";
import Batch, { BatchAny } from "../node/advanced/Batch";
import Snapshot from "../node/mutation/Snapshot";
import { TransformUtils } from "../util/Transform";

/**
 * Canvas渲染
 */
export default class CanvasRenderer {
    constructor(config: IConfig) {
        const { ctx = this.ctx } = config;

        Object.assign(this, {
            ctx,
        });
    }

    /**
     * 画布上下文
     */
    protected ctx?: Canvas.Context2D | null;
    /**
     * 离屏缓存
     */
    protected static offscreenCache = new Map<
        string,
        OffscreenCanvasObject<"2d">
    >();

    /**
     * 渲染节点
     * @param node
     */
    public static renderNode(
        ctx: Canvas.Context2D,
        node: BaseCTXNodeAny,
        options?: {
            /**
             * 绘制
             * @param ctx
             * @param node
             * @returns
             */
            draw?: (ctx: Canvas.Context2D, node: DrawCTXNodeAny) => void;
            /**
             *
             */
            direct?: boolean;
        },
    ): void {
        if (!node.visible) return;

        const { clip, path, anchor, children, worldMatrix } = node;

        // 保存
        ctx.save();
        // 应用世界矩阵
        TransformUtils.transformMatrix(ctx, worldMatrix);
        // 裁剪
        clip && ctx.clip(path, typeof clip === "string" ? clip : void 0);
        // 绘制节点
        if (node instanceof DrawCTXNode && node.drawing) {
            // 创建快照
            node instanceof Snapshot && this.generateSnapshot(node);

            const { uuid, offscreen } = node,
                { draw, direct } = options ?? {},
                { offscreenCache } = this;

            // 绘制缓存
            if (offscreen && !direct && node.size.valid()) {
                const cacheKey =
                    typeof offscreen === "boolean" ? uuid : offscreen;

                if (!offscreenCache.has(cacheKey)) {
                    const offscreen2D = new OffscreenCanvasObject("2d"),
                        ctx = offscreen2D.obtainCtx();

                    offscreen2D.applySize(node.size);

                    ctx && this.renderNode(ctx, node, { direct: true });

                    offscreenCache.set(cacheKey, offscreen2D);
                }

                const cache = offscreenCache.get(cacheKey)!,
                    { x, y } = anchor;

                cache.ensureValid() && ctx.drawImage(cache.canvas, -x, -y);
            }
            // 绘制
            else draw ? draw(ctx, node) : node.draw(ctx);
        }
        // 绘制伴生节点
        else if (node instanceof AssociatedCTXNode) {
            const { associated } = node;

            associated && this.renderNode(ctx, associated);
        }
        // 绘制批处理节点
        else if (node instanceof Batch) {
            // 渲染批处理节点
            this.renderBatch(ctx, node);
        }

        // 绘制子项
        children.forEach((item) => this.renderNode(ctx, item));

        // 恢复
        ctx.restore();
    }
    /**
     * 渲染批处理节点
     * @param ctx
     * @param param1
     */
    public static renderBatch(ctx: Canvas.Context2D, node: BatchAny): void {
        const { size, rules, sample, offset, worldMatrix } = node;

        // 检查尺寸
        if (!size.valid()) return;

        // 遍历规则
        for (const rule of rules as BaseCTXNodeRule[]) {
            const config = TransformUtils.generateByRule(
                rule,
                sample,
                worldMatrix,
            );

            // 绘制样本
            this.renderNode(ctx, sample, {
                draw: (_, item) => {
                    // 应用规则矩阵
                    TransformUtils.transform(
                        ctx,
                        TransformUtils.composeOffset(config, offset),
                    );

                    // 绘制
                    item.draw(ctx, (rule as DrawCTXNodeRule).style);
                },
            });
        }
    }
    /**
     * 生成快照
     * @param node
     */
    public static generateSnapshot(node: Snapshot): void {
        const { target, offscreen2D } = node,
            { complate } = offscreen2D;

        if (complate || !offscreen2D.valid() || !offscreen2D.validSize())
            return;

        const ctx = offscreen2D.obtainCtx()!;

        target && this.renderNode(ctx, target);

        offscreen2D.complate = true;
    }
    /**
     * 渲染场景
     * @param scene
     */
    public renderScene(scene: Scene): void {
        const { ctx } = this;

        ctx && CanvasRenderer.renderNode(ctx, scene);
    }

    /**
     * 销毁
     */
    public destroy(): void {}
}

interface IConfig {
    /**
     * 画布上下文
     */
    ctx?: Canvas.Context2D;
}
