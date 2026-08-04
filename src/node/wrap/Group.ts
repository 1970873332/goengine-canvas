import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent } from "../Base";

/**
 * 组节点
 */
export default class Group extends BaseCTXNode<IConfig, IEvent> {
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }
}

interface IConfig extends BaseCTXNodeConfig {}

interface IEvent extends BaseCTXNodeEvent {}

export { IConfig as GroupConfig };
