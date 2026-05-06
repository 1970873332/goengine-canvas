import { Vector2 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig } from "../Base";

/**
 * 组
 */
export default class Group<C extends IConfig> extends BaseCTXNode<{}, C, {}> {
    /**
     * 是否是组
     */
    public readonly isGroup: boolean = true;

    /**
     * 尺寸
     */
    public readonly size = Vector2.zero().bindCallback(this.refactor.bind(this, false));

    constructor(config?: C) {
        super();
        config && this.setConfig(config);
    }

    public setConfig(config: C): void {
        super.setConfig(config);

        const {
            size
        } = config;

        size && this.size.copy(size, true);

        this.refactor(true);
    }
}

interface IConfig extends BaseCTXNodeConfig, Partial<Pick<Group<any>, "size">> { }