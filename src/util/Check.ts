import OffscreenCanvas2DManager, {
    OFFSCREEN_CANVAS_2D,
} from "../manager/OffscreenCanvas";
import { BaseCTXNodeAny } from "../node/Base";
import { TransformConfig, TransformUtils } from "./Transform";

/**
 * 检查工具类
 */
export abstract class CheckUtils {
    /**
     * 获取命中节点
     * @param param0
     * @param nodes
     * @param config
     * @returns
     */
    public static obtainHitNodes(
        { x, y }: VectorObject.Vector2,
        nodes: Set<BaseCTXNodeAny>,
        config?: IHitConfig,
    ): BaseCTXNodeAny[] {
        if (!OFFSCREEN_CANVAS_2D.ensureValid()) return [];

        const {
                single = true,
                reverse = true,
                checkAncestorsClip = true,
                filterUnControlled = true,

                specified,
            } = config ?? {},
            list: BaseCTXNodeAny[] = [];

        for (let node of reverse ? Array.from(nodes).reverse() : nodes) {
            if (filterUnControlled && !node.controlled) continue;

            node = specified?.() ?? node;

            const { path, worldMatrix } = node,
                hit: boolean = !!OffscreenCanvas2DManager.applyMatrix(
                    worldMatrix,
                    (ctx) => ctx?.isPointInPath(path, x, y),
                );

            if (hit) {
                // 检查祖先节点的 clip 区域
                if (
                    checkAncestorsClip &&
                    !this.checkAncestorsClip({ x, y }, node)
                ) {
                    continue;
                }

                list.push(node);

                if (single) break;
            }
        }

        return list;
    }
    /**
     * 检查祖先节点的裁剪区域
     * @param param0 视图坐标
     * @param param1
     * @returns
     */
    public static checkAncestorsClip(
        { x, y }: VectorObject.Vector2,
        node: BaseCTXNodeAny,
    ): boolean {
        if (!OFFSCREEN_CANVAS_2D.ensureValid()) return false;

        let current = node.parent;

        while (current) {
            const { clip, path, parent, worldMatrix } = current;

            if (clip) {
                const clipHit: boolean = !!OffscreenCanvas2DManager.applyMatrix(
                    worldMatrix,
                    (ctx) => ctx?.isPointInPath(path, x, y),
                );

                if (!clipHit) {
                    return false;
                }
            }

            current = parent;
        }

        return true;
    }
    /**
     * 检查命中路径
     * @param param0
     * @param path
     * @param config
     * @returns
     */
    public static checkHitPath2D(
        { x, y }: VectorObject.Vector2,
        path: Path2D,
        config?: TransformConfig,
    ): boolean {
        if (!OFFSCREEN_CANVAS_2D.ensureValid()) return false;

        const ctx = OFFSCREEN_CANVAS_2D.obtainCtx()!;

        config && TransformUtils.transform(ctx, config);

        return ctx.isPointInPath(path, x, y);
    }
}

interface IHitConfig {
    /**
     * 是否反向遍历
     * @default true
     */
    reverse?: boolean;
    /**
     * 是否单个命中
     * @default true
     */
    single?: boolean;
    /**
     * 是否检查祖先节点的裁剪区域
     * @default true
     */
    checkAncestorsClip?: boolean;
    /**
     * 是否过滤非受控节点
     * @default true
     */
    filterUnControlled?: boolean;
    /**
     * 指定节点
     * @returns
     */
    specified?: () => BaseCTXNodeAny;
}
