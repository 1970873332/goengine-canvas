import Value from "@core/object/attribute/Value";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";


export default class Entrust<C extends IConfig<K>, K extends string | number | symbol = keyof C["targets"]> extends BaseCTXNode<C, IStyle, IEvent> {
    /**
     * 是否是委托
     */
    public static isEntrust: boolean = true;
    /**
     * 默认Key
     */
    public static defaultKey = "default";

    constructor(config?: C, style?: IStyle) {
        super();
        this.style = style ?? this.style;
        config && this.setConfig(config);
    }

    /**
     * 目标
     */
    public target = new Value<Instance<typeof BaseCTXNode> | undefined>(void 0).bindCallback(this.refactor.bind(this, false));
    /**
     * 目标组
     */
    public targets: Partial<Record<K, Instance<typeof BaseCTXNode>>> = {};
    /**
     * Key
     */
    protected key?: K;

    /**
     * 切换
     * @param key
     */
    public toggle(key: K = Entrust.defaultKey as K, silent?: boolean): void {
        const node = this.targets[key];
        if (node) {
            this.key = key;
            node.bindParent(this);
            if (silent) {
                this.target.setter(node)
            } else this.target.value = node;
        }
    }
    /**
     * 命中
     * @param key
     * @returns
     */
    public hit(key: K = Entrust.defaultKey as K): boolean { return this.key === key }

    public setConfig(config: C): void {
        super.setConfig(config);

        const
            key = Entrust.defaultKey as K,
            {
                targets,
                defaultTarget
            } = config;

        this.targets = targets ?? this.targets;
        this.targets[key] ??= defaultTarget;

        if (!this.targets[key]) {
            const first = Object.values(this.targets)[0];
            if (first instanceof BaseCTXNode) {
                this.targets[key] = first;
            }
        }
        this.toggle(key, true);

        this.refactor(true);
    }

    public applyStyle(ctx: CanvasRenderingContext2D): void {
        this.target.value?.applyStyle(ctx);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.target.value?.draw(ctx);
    }

    public drawBorder(ctx: CanvasRenderingContext2D): void {
        this.target.value?.drawBorder(ctx);
    }

    public updatePath2D(): void {
        const {
            value
        } = this.target;

        this.path = value?.path ?? new Path2D();
    }

    public destroy(): void {
        super.destroy();
        this.target.value?.unbindParent();
        Object.entries(this.targets).forEach(([_, item]) => item instanceof BaseCTXNode && item.destroy());
        this.targets = {};
    }

}

interface IConfig<K extends string | number | symbol> extends BaseCTXNodeConfig {
    /**
     * 默认目标
     */
    defaultTarget?: Instance<typeof BaseCTXNode>;
    /**
     * 目标组
     */
    targets?: Partial<Record<K, Instance<typeof BaseCTXNode>>>;
}

interface IEvent extends BaseCTXNodeEvent { }

interface IStyle extends BaseCTXNodeStyle { }