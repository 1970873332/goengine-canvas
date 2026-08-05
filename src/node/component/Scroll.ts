import {
    HitModAny,
    HitModEvent,
    HitModNode,
} from "@goengine/canvas/src/mod/Hit";
import SlideMod, { SlideModConfig } from "@goengine/canvas/src/mod/Slide";
import { EventState } from "@goengine/core/src/supplement/Event";
import Clan, { ClanConfig, ClanEvent } from "../advanced/Clan";

/**
 * 滚动
 */
export default class Scroll extends Clan<IConfig, ClanEvent> {
    /**
     * 滚动
     * @param config 配置
     * @param hitMod 命中模块
     */
    constructor(
        public readonly hitMod: HitModAny,
        config?: IConfig,
    ) {
        super();

        hitMod.dragNodes.add(this.group);

        this.size.bindCallback(this.corrGroupSize.bind(this));
        this.group.size.bindCallback(this.corrGroupSize.bind(this));

        this.hitEventState = new EventState(
            hitMod,
            "active",
            this.handleActive.bind(this),
        ).wake();

        config && this.setConfig(config);
    }

    /**
     * 命中事件
     */
    declare public readonly hitEventState: EventState<HitModEvent>;
    /**
     * 滑动模块
     */
    public readonly slideMod = new SlideMod(this.group);

    /**
     * 处理激活
     */
    protected handleActive({
        detail: { type, node, offset },
    }: CustomEvent<HitModNode>): void {
        const { slideMod } = this;

        switch (type) {
            case "up":
                if (slideMod.actived.value) {
                    slideMod.applyMode();

                    slideMod.actived.value = false;
                }
                break;
            case "down":
                if (slideMod.manager === node) {
                    slideMod.transform(offset, node.position.toVector2());
                    slideMod.actived.value = true;
                }
                break;
            case "drag":
                if (slideMod.actived.value && slideMod.manager === node) {
                    slideMod.follow(offset);
                }
                break;
        }
    }
    /**
     * 校正组大小
     * @param param0
     */
    protected corrGroupSize(): void {
        const {
            size: { width: sw, height: sh },
            group: {
                size: { width, height },
            },
        } = this;

        this.group.size.set(Math.max(width, sw), Math.max(height, sh));
    }

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const { slide } = config;

        slide && this.slideMod.setConfig(slide);
    }

    public clearRely(): void {
        this.hitMod.destroy();
    }

    public destroy(depth?: boolean): void {
        depth && this.clearRely();

        this.hitEventState.break();

        this.slideMod.destroy();

        Object.assign(this, {
            hitMod: void 0,
            slideMod: void 0,
            hitEventState: void 0,
        });

        super.destroy();
    }
}

interface IConfig extends ClanConfig {
    /**
     * 滑动配置
     */
    slide?: SlideModConfig;
}
