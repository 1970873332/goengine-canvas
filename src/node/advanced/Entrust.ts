import Value from "@goengine/core/src/object/attribute/Value";
import AssociatedCTXNode from "../Associated";
import BaseCTXNode, {
    BaseCTXNodeAny,
    BaseCTXNodeConfig,
    BaseCTXNodeEvent,
} from "../Base";

/**
 * 委托节点
 */
export default class Entrust<
    C extends IConfig<K>,
    K extends Iteration | typeof Entrust.defaultKey = keyof C["targets"],
> extends AssociatedCTXNode<C, BaseCTXNodeEvent> {
    /**
     * 默认Key
     */
    public static readonly defaultKey = "default";

    constructor(config?: C) {
        super();

        config && this.setConfig(config);
    }

    /**
     * Key
     */
    declare public readonly key: K;
    /**
     * 目标组
     */
    public readonly targets: Partial<
        Record<K, TNode> & { [Entrust.defaultKey]: TNode }
    > = {};
    /**
     * 目标
     */
    public readonly target = new Value<TNode | undefined>(void 0).bindCallback(
        this.handleChangedTarget.bind(this),
    );

    /**
     * target改变事件
     */
    private handleChangedTarget(nv?: TNode, ov?: TNode): void {
        ov?.unbindParent();
        nv?.bindParent(this);
    }
    /**
     * 命中
     * @param key
     * @returns
     */
    public same(key: K): boolean {
        return this.key === key;
    }
    /**
     * 切换
     * @param key
     */
    public toggle(key: K): void {
        const node = this.targets[key];

        this.target.value = node;
        Object.assign(this, { key });
    }

    public get associated(): BaseCTXNodeAny | undefined {
        return this.target.value;
    }

    public setConfig(config: C): void {
        super.setConfig(config, true);

        const key = Entrust.defaultKey,
            { defaultTarget, targets = this.targets } = config;

        Object.assign(this, {
            targets,
        });

        if (!(this.targets[key] ??= defaultTarget)) {
            const first = Object.values(this.targets)[0];

            if (first instanceof BaseCTXNode) {
                this.targets[key] = first;
            }
        }

        this.toggle(key as K);
    }

    public updateWorldMatrix(): void {
        super.updateWorldMatrix();

        this.target.value?.updateWorldMatrix();
    }

    public clearRely(): void {
        Object.values(this.targets).forEach((target: TNode) =>
            target.destroy(),
        );
    }

    public destroy(depth?: boolean): void {
        depth && this.clearRely();

        this.target.clearCallback();

        Object.assign(this, {
            target: void 0,
            targets: void 0,
        });

        super.destroy();
    }
}

interface IConfig<K extends Iteration> extends BaseCTXNodeConfig {
    /**
     * 默认目标
     */
    defaultTarget?: TNode;
    /**
     * 目标组
     */
    targets?: Partial<Record<K, TNode>>;
}

type TNode = BaseCTXNodeAny;

type IAny = Entrust<any, any>;

export { IAny as EntrustAny, IConfig as EntrustConfig };
