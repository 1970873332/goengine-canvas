import BaseCTXNode, {
    BaseCTXNodeConfig,
    BaseCTXNodeEvent,
    BaseCTXNodeRule,
} from "./Base";

/**
 * 绘制节点
 */
export default abstract class DrawCTXNode<
    C extends IConfig,
    S extends IStyle,
    E extends BaseCTXNodeEvent,
> extends BaseCTXNode<C, E> {
    /**
     * 样式
     */
    public style: Partial<S> = {};
    /**
     * 绘制
     * @default true
     */
    public drawing: boolean = true;
    /**
     * 离屏
     * @default false
     */
    public offscreen: boolean | string = false;

    /**
     * 应用样式
     * @param ctx
     */
    public abstract applyStyle(ctx: Canvas.Context2D, style?: S): void;
    /**
     * 绘制
     */
    public abstract draw(ctx: Canvas.Context2D, style?: S): void;

    public setConfig(config: C, pure?: boolean): void {
        super.setConfig(config, pure);

        const {
            style = this.style,
            drawing = this.drawing,
            offscreen = this.offscreen,
        } = config;

        Object.assign(this, {
            style,
            drawing,
            offscreen,
        });
    }

    public copy(target: this, silence?: boolean): this {
        const { style, drawing } = target;

        Object.assign(this, {
            style,
            drawing,
        });

        return super.copy(target, silence);
    }

    public destroy(): void {
        Object.assign(this, {
            style: void 0,
        });

        super.destroy();
    }
}

interface IConfig
    extends
        BaseCTXNodeConfig,
        Partial<Pick<IAny, "style" | "drawing" | "offscreen">> {}

interface IStyle {}

interface IRule
    extends BaseCTXNodeRule, Partial<Pick<IConfig, "style" | "drawing">> {}

type IAny = DrawCTXNode<any, any, any>;

export {
    IAny as DrawCTXNodeAny,
    IConfig as DrawCTXNodeConfig,
    IRule as DrawCTXNodeRule,
    IStyle as DrawCTXNodeStyle,
};
