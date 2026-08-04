import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import BaseCTXNode, { BaseCTXNodeConfig, BaseCTXNodeEvent } from "../Base";
import { DrawCTXNodeAny, DrawCTXNodeRule } from "../Draw";

/**
 * 批处理节点
 */
export default class Batch<
    T extends DrawCTXNodeAny,
    R extends DrawCTXNodeRule,
> extends BaseCTXNode<IConfig<T, R>, BaseCTXNodeEvent> {
    constructor(config?: IConfig<T, R>) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 样本
     */
    declare public readonly sample: T;
    /**
     * 规则
     */
    public readonly rules: R[] = [];
    /**
     * 偏移
     */
    public readonly offset = Vector2.zero();

    public setConfig(config: IConfig<T, R>): void {
        super.setConfig(config);

        const { offset, rules = this.rules, sample = this.sample } = config;

        Object.assign(this, {
            rules,
            sample,
        });

        offset && this.offset.set(offset.x, offset.y, true);
    }

    public copy(target: this, silence?: boolean): this {
        const { rules, sample, offset } = target;

        Object.assign(this, {
            rules,
            sample,
        });

        this.offset.copy(offset, true);

        return super.copy(target, silence);
    }

    public clearRely(): void {
        this.sample.destroy();
    }

    public destroy(depth?: boolean): void {
        depth && this.clearRely();

        this.offset.clearCallback();

        Object.assign(this, {
            rules: void 0,
            sample: void 0,
            offset: void 0,
        });

        super.destroy();
    }
}

interface IConfig<T extends DrawCTXNodeAny, R extends DrawCTXNodeRule>
    extends BaseCTXNodeConfig, Partial<Pick<Batch<T, R>, "sample" | "rules">> {
    /**
     * 偏移
     */
    offset?: Partial<VectorObject.Vector2>;
}

interface IRule<R extends DrawCTXNodeRule>
    extends DrawCTXNodeRule, Partial<Pick<Batch<any, R>, "rules">> {}

type IAny = Batch<DrawCTXNodeAny, DrawCTXNodeRule>;

export { IAny as BatchAny, IRule as BatchRule };
