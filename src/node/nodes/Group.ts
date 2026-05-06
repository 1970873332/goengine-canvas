import { Vector2 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent } from "../Base";

/**
 * 组
 */
export default class Group extends BaseCTXNode<IConfig, {}, IEvent> {
    /**
     * 是否是组
     */
    public readonly isGroup: boolean = true;

    /**
     * 尺寸
     */
    public readonly size = Vector2.zero().bindCallback(this.refactor.bind(this, false));

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            size
        } = config;

        size && this.size.copy(size, true);

        this.refactor(true);
    }
}

interface IConfig extends BaseCTXNodeConfig, Partial<Pick<Group, "size">> { }

interface IEvent extends BaseCTXNodeEvent { }