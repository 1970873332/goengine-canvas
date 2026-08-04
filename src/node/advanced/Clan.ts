import AssociatedCTXNode from "../Associated";
import { BaseCTXNodeAny, BaseCTXNodeConfig, BaseCTXNodeEvent } from "../Base";
import Group, { GroupConfig } from "../wrap/Group";

/**
 * 族节点
 */
export default class Clan<
    C extends IConfig,
    E extends IEvent,
> extends AssociatedCTXNode<C, E> {
    constructor(config?: C) {
        super();

        this.group.bindParent(this);

        config && this.setConfig(config);
    }

    /**
     * 组
     */
    public readonly group = new Group();

    public get associated(): BaseCTXNodeAny {
        return this.group;
    }

    public setConfig(config: C): void {
        super.setConfig(config);

        const { group } = config;

        group && this.group.setConfig(group);
    }

    public updateWorldMatrix(): void {
        super.updateWorldMatrix();

        this.group.updateWorldMatrix();
    }

    public destroy(): void {
        this.group.destroy();

        Object.assign(this, {
            group: void 0,
        });

        super.destroy();
    }
}

interface IConfig extends BaseCTXNodeConfig {
    /**
     * 组
     */
    group?: GroupConfig;
}

interface IEvent extends BaseCTXNodeEvent {}

type IAny = Clan<any, any>;

export { IAny as ClanAny, IConfig as ClanConfig, IEvent as ClanEvent };
