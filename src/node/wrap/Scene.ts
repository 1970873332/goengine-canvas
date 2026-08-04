import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent } from "../Base";

/**
 * 场景节点
 */
export default class Scene extends BaseCTXNode<IConfig, IEvent> {
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }
}

interface IConfig extends BaseCTXNodeConfig {}

interface IEvent extends BaseCTXNodeEvent {}
