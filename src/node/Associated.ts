import BaseCTXNode, {
    BaseCTXNodeAny,
    BaseCTXNodeConfig,
    BaseCTXNodeEvent,
} from "./Base";

/**
 * 伴生节点
 */
export default abstract class AssociatedCTXNode<
    C extends BaseCTXNodeConfig,
    E extends BaseCTXNodeEvent,
> extends BaseCTXNode<C, E> {
    /**
     * 伴生对象
     */
    public abstract get associated(): BaseCTXNodeAny | undefined;
}
