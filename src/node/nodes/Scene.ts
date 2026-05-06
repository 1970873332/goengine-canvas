import { Vector2 } from "@core/object/math/Index";
import BaseCTXNode, { BaseCTXNodeConfig } from "../Base";

/**
 * 场景
 */
export default class Scene extends BaseCTXNode<{}, IConfig, {}> {
    /**
     * 是否是场景
     */
    public readonly isScene: boolean = true;

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

    public updatePath2D(): void {
        this.path = new Path2D();

        const {
            path,
            anchor: { x, y },
            size: { width, height }
        } = this;

        path.rect(-x, -y, width, height);
    }
}

interface IConfig extends BaseCTXNodeConfig, Partial<Pick<Scene, "size">> { }