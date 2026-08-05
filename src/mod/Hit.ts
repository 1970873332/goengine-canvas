import { BaseCTXNodeAny } from "@goengine/canvas/src/node/Base";
import ModComponent, {
    ModComponentConfig,
    ModComponentEvent,
} from "@goengine/core/src/component/fussy/Mod";
import Value from "@goengine/core/src/object/attribute/Value";
import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import { EventState } from "@goengine/core/src/supplement/Event";
import {
    InteractionAny,
    InteractionEvent,
} from "@goengine/web/src/control/Interaction";
import { ElementUtils } from "@goengine/web/src/util/Element";
import { CheckUtils } from "../util/Check";

/**
 * 命中模块
 */
export default class HitMod<M extends InteractionAny> extends ModComponent<
    M,
    ModComponentConfig,
    IEvent
> {
    constructor(manger: M, config?: ModComponentConfig) {
        super(manger);

        config && this.setConfig(config);
    }

    /**
     * 抬起事件
     */
    declare protected upEventState: EventState<InteractionEvent>;
    /**
     * 按下事件
     */
    declare protected downEventState: EventState<InteractionEvent>;
    /**
     * 移动事件
     */
    declare protected moveEventState: EventState<InteractionEvent>;
    /**
     * 节点集合
     */
    public readonly nodes = new Set<Required<INode>["node"]>();
    /**
     * 抬起节点集合
     */
    public readonly upNodes = new Set<Required<INode>["node"]>();
    /**
     * 按下节点集合
     */
    public readonly downNodes = new Set<Required<INode>["node"]>();
    /**
     * 移动节点集合
     */
    public readonly moveNodes = new Set<Required<INode>["node"]>();
    /**
     * 点击节点集合
     */
    public readonly clickNodes = new Set<Required<INode>["node"]>();
    /**
     * 拖拽节点集合
     */
    public readonly dragNodes = new Set<Required<INode>["node"]>();
    /**
     * 出节点集合
     */
    public readonly outNodes = new Set<Required<INode>["node"]>();
    /**
     * 入节点集合
     */
    public readonly inNodes = new Set<Required<INode>["node"]>();
    /**
     * 节点
     */
    protected readonly node = new Value<INode["node"]>(void 0).bindCallback(
        this.dispatchNode.bind(this),
    );
    /**
     * 点击节点
     */
    protected readonly clickNode = new Value<INode["node"]>(
        void 0,
    ).bindCallback(this.handleClickChanged.bind(this));
    /**
     * 拖拽节点
     */
    protected readonly dragNode = new Value<INode["node"]>(void 0).bindCallback(
        this.handleDragChanged.bind(this),
    );
    /**
     * 改变节点
     */
    protected readonly changeNode = new Value<INode["node"]>(
        void 0,
    ).bindCallback(this.handleChangeChanged.bind(this));
    /**
     * 类型
     */
    protected readonly type = new Value<TType>("up").bindCallback(
        this.dispatchNode.bind(this),
    );
    /**
     * 偏移量
     */
    protected readonly offset = new Value<Vector2>(Vector2.zero()).bindCallback(
        this.dispatchNode.bind(this),
    );

    /**
     * 处理抬起
     */
    protected handleUp({ detail }: CustomEvent<MouseEvent>): void {
        const point: Vector2 = this.obtainPoint(detail),
            [hitNode] = CheckUtils.obtainHitNodes(
                point,
                new Set([...this.nodes, ...this.upNodes, ...this.clickNodes]),
            );

        this.offset.setter(point);
        this.node.setter(hitNode);
        this.type.set("up");

        this.clickNode.liveset(hitNode);
        this.dragNode.liveset(void 0);
    }
    /**
     * 处理按下
     */
    protected handleDown({ detail }: CustomEvent<MouseEvent>): void {
        const point: Vector2 = this.obtainPoint(detail),
            [hitNode] = CheckUtils.obtainHitNodes(
                point,
                new Set([
                    ...this.nodes,
                    ...this.downNodes,
                    ...this.clickNodes,
                    ...this.dragNodes,
                ]),
            );

        this.offset.setter(point);
        this.node.setter(hitNode);
        this.type.set("down");

        this.clickNode.liveset(hitNode);
        this.dragNode.liveset(hitNode);
    }
    /**
     * 处理移动
     */
    protected handleMove({ detail }: CustomEvent<MouseEvent>): void {
        const point: Vector2 = this.obtainPoint(detail),
            [hitNode] = CheckUtils.obtainHitNodes(
                point,
                new Set([
                    ...this.nodes,
                    ...this.moveNodes,
                    ...this.outNodes,
                    ...this.inNodes,
                ]),
            ),
            dragHitNodes = this.dragNode.value
                ? CheckUtils.obtainHitNodes(
                      point,
                      new Set([this.dragNode.value]),
                  )
                : void 0;

        this.offset.setter(point);
        this.node.setter(hitNode);
        this.type.liveset("move");

        this.changeNode.set(hitNode);

        dragHitNodes && this.dragNode.liveset(dragHitNodes[0]);
    }
    /**
     * 处理点击改变
     * @param nv
     * @param ov
     */
    protected handleClickChanged(nv: INode["node"], ov: INode["node"]): void {
        nv === ov && this.type.value === "up" && this.dispatchClickNode();
    }
    /**
     * 处理拖拽改变
     * @param nv
     * @param ov
     */
    protected handleDragChanged(nv: INode["node"], ov: INode["node"]): void {
        nv === ov && this.type.value === "move" && this.dispatchDragNode();
    }
    /**
     * 处理改变节点
     * @param nv
     * @param ov
     */
    protected handleChangeChanged(nv: INode["node"], ov: INode["node"]): void {
        ov && this.dispatchChangeNode("out", ov);
        nv && this.dispatchChangeNode("in", nv);
    }
    /**
     * 获取点
     * @returns
     */
    protected obtainPoint({ clientX, clientY }: MouseEvent): Vector2 {
        return Vector2.fromObject(
            ElementUtils.sceneTolocalPoint(this.manager.element, {
                x: clientX,
                y: clientY,
            }),
        );
    }
    /**
     * 派发节点
     */
    protected dispatchNode(): void {
        const {
            type: { value: type },
            node: { value: node },
            offset: { value: offset },
        } = this;

        this.dispatchCustomEvent("active", { type, node, offset });
    }
    /**
     * 派发点击节点
     */
    protected dispatchClickNode(): void {
        const {
            clickNode: { value: node },
            offset: { value: offset },
        } = this;

        this.dispatchCustomEvent("active", { type: "click", node, offset });
    }
    /**
     * 派发拖拽节点
     */
    protected dispatchDragNode(): void {
        const {
            dragNode: { value: node },
            offset: { value: offset },
        } = this;

        this.dispatchCustomEvent("active", { type: "drag", node, offset });
    }
    /**
     * 派发改变节点
     * @param type
     * @param node
     */
    protected dispatchChangeNode(type: TChangeType, node: INode["node"]): void {
        const {
            offset: { value: offset },
        } = this;

        this.dispatchCustomEvent("active", { type, node, offset });
    }

    protected setConfig(config: ModComponentConfig): void {
        super.setConfig(config);
    }

    protected addEvents(): void {
        this.upEventState = new EventState(
            this.manager,
            "leftUp",
            this.handleUp.bind(this),
        ).wake();
        this.downEventState = new EventState(
            this.manager,
            "leftDown",
            this.handleDown.bind(this),
        ).wake();
        this.moveEventState = new EventState(
            this.manager,
            "mouseMove",
            this.handleMove.bind(this),
        ).wake();
    }

    public destroy(): void {
        this.upEventState?.break();
        this.downEventState?.break();
        this.moveEventState?.break();

        super.destroy();
    }
}

interface IEvent extends ModComponentEvent {
    /**
     * 激活节点
     */
    active: INode;
}

interface INode {
    /**
     * 类型
     */
    type: TAllType;
    /**
     * 偏移量
     */
    offset: Vector2;
    /**
     * 节点
     */
    node?: BaseCTXNodeAny;
}

type TType = "up" | "down" | "move";
type TChangeType = "out" | "in";
type TAllType = TType | TChangeType | "click" | "drag";

type IAny = HitMod<InteractionAny>;

export { IAny as HitModAny, IEvent as HitModEvent, INode as HitModNode };
