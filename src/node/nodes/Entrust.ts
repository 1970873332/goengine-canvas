import Value from "@core/object/attribute/Value";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent, BaseCTXNodeStyle } from "../Base";


export default class Entrust<C extends IConfig, E extends IEvent> extends BaseCTXNode<IStyle, C, E> {
    /**
     * 是否是委托
     */
    public static isEntrust: boolean = true;
    /**
     * 默认Key
     */
    public static defaultKey: string = "default";

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
    public targets: Record<string, Instance<typeof BaseCTXNode>> = {};
    /**
     * Key
     */
    protected key?: string;

    /**
     * 切换
     * @param key 
     */
    public toggle(key: string = Entrust.defaultKey, silent?: boolean): void {
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
    public hit(key: string = Entrust.defaultKey): boolean { return this.key === key }

    public setConfig(config: C): void {
        super.setConfig(config);

        const {
            target,
            targets
        } = config;

        this.targets = targets ?? this.targets;
        this.targets[Entrust.defaultKey] ??= target ?? Object.values(this.targets)[0];
        this.toggle(Entrust.defaultKey, true);

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
        Object.entries(this.targets).forEach(([_, item]) => item.destroy());
        this.targets = {};
    }

}

interface IConfig extends BaseCTXNodeConfig {
    /**
     * 目标
     */
    target?: Instance<typeof BaseCTXNode>;
    /**
     * 目标组
     */
    targets?: Record<string, Instance<typeof BaseCTXNode>>;
}

interface IEvent extends BaseCTXNodeEvent { }

interface IStyle extends BaseCTXNodeStyle { }