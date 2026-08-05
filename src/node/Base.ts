import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import BaseNode, {
    BaseNodeConfig,
    BaseNodeEvent,
} from "@goengine/core/src/object/Node";

/**
 * 基础节点
 */
export default abstract class BaseCTXNode<
    C extends IConfig,
    E extends IEvent,
> extends BaseNode<C, E, IAny> {
    /**
     * 路径
     */
    public path = new Path2D();
    /**
     * 裁剪
     * @default false
     */
    public clip: boolean | CanvasFillRule = false;
    /**
     * 尺寸
     */
    public readonly size = Vector2.zero().bindCallback(
        this.updatePath2D.bind(this),
    );

    /**
     * 适配
     * @param node
     * @returns
     */
    public adapt(node: IAny): this {
        this.add(node);
        this.size.copy(node.size);
        return this;
    }
    /**
     * 更新路径
     * @returns
     */
    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            anchor: { x, y },
            size: { width, height },
        } = this;

        path.rect(-x, -y, width, height);
    }

    public setConfig(config: C, pure?: boolean): void {
        super.setConfig(config);

        const { size, clip = this.clip } = config;

        Object.assign(this, {
            clip,
        });

        size && this.size.set(size.width, size.height, true);

        !pure && this.updatePath2D();
    }

    public copy(target: this, silence?: boolean): this {
        const { path, clip, size } = target;

        Object.assign(this, {
            clip,
            path,
        });

        this.size.copy(size, true);

        return super.copy(target, silence);
    }
}

interface IConfig extends BaseNodeConfig, Partial<Pick<IAny, "clip">> {
    /**
     * 锚点
     */
    anchor?: Partial<VectorObject.Vector2>;
    /**
     * 缩放
     */
    scale?: Partial<VectorObject.Vector2>;
    /**
     * 位置
     */
    position?: Partial<VectorObject.Vector2>;
    /**
     * 旋转
     */
    rotation?: Partial<VectorObject.Vector3>;
    /**
     * 尺寸
     */
    size?: Partial<VectorObject.Vector2Size>;
}

interface IEvent extends BaseNodeEvent {}

interface IRule extends Partial<
    Pick<IConfig, "position" | "scale" | "rotation">
> {}

interface IPath extends IRule, Partial<Pick<IConfig, "anchor">> {}

type IAny = BaseCTXNode<any, any>;

export {
    IAny as BaseCTXNodeAny,
    IConfig as BaseCTXNodeConfig,
    IEvent as BaseCTXNodeEvent,
    IPath as BaseCTXNodePath,
    IRule as BaseCTXNodeRule,
};
