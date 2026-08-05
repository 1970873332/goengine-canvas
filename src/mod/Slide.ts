import { BaseCTXNodeAny } from "@goengine/canvas/src/node/Base";
import ModComponent from "@goengine/core/src/component/fussy/Mod";
import { TaskComponentEvent } from "@goengine/core/src/component/Task";
import Value from "@goengine/core/src/object/attribute/Value";
import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import Vector4 from "@goengine/core/src/object/math/vector/Vector4";
import { MathUtils } from "@goengine/core/src/util/Math";

/**
 * 滑动模块
 */
export default class SlideMod<M extends BaseCTXNodeAny> extends ModComponent<
    M,
    IConfig,
    TaskComponentEvent
> {
    constructor(manager: M, config?: IConfig) {
        super(manager);

        config && this.setConfig(config);
    }

    /**
     * 模式
     */
    public mode?: TMode;
    /**
     * 约束
     */
    public constraint?: Vector4;
    /**
     * 持续时间
     */
    public duration: number = 2000;
    /**
     * 方向
     */
    public readonly direction = Vector2.one();
    /**
     * 阻尼
     */
    public readonly damping = Vector2.zero();

    /**
     * 开始时间
     */
    protected startTime = 0;
    /**
     * 索引
     */
    public readonly index = Vector2.zero().bindCallback(
        this.updateStep.bind(this),
    );
    /**
     * 偏移
     */
    protected readonly offset = Vector2.zero();
    /**
     * 轨迹
     */
    protected readonly trajectory: ITrack[] = [];
    /**
     * 目标位置
     */
    protected readonly targetPosition = Vector3.zero().bindCallback(
        this.updateTime.bind(this),
    );
    /**
     * 是否激活
     */
    public readonly actived = new Value<boolean>(false).bindCallback(
        this.handleChangedActived.bind(this),
    );

    /**
     * 变换
     * @param point
     * @param position
     */
    public transform(point: Vector2, position: Vector2): void {
        this.offset.copy(point.clone().sub(position));
    }
    /**
     * 跟随
     * @param x
     * @param y
     */
    public follow(point: Vector2): void {
        const {
                offset,
                constraint,
                trajectory,
                manager: { position },
            } = this,
            { x, y } = point.clone().sub(offset).multiply(this.direction);

        if (constraint) {
            const { x: minX, y: minY, x1: maxX, y1: maxY } = constraint,
                { x: dx, y: dy } = this.damping;

            position.set(
                MathUtils.clamp(x, minX - dx, maxX + dx),
                MathUtils.clamp(y, minY - dy, maxY + dy),
            );
        } else position.set(x, y);

        if (this.actived.value) {
            trajectory.push({
                time: performance.now(),
                position: point.clone().multiply(this.direction).toVector3(),
            });
            trajectory.length > 10 && trajectory.shift();
        }
    }
    /**
     * 应用模式
     */
    public applyMode(): void {
        switch (this.mode) {
            case "step":
                this.applyStep();
                break;
            case "inertia":
                this.applyInertia();
                break;
        }
    }
    /**
     * 应用惯性
     * @param inertia 惯性
     */
    public applyInertia(inertia: number = 1): void {
        const {
                constraint,
                targetPosition,
                manager: { position },
            } = this,
            coe: number = 100 * inertia,
            velocity: Vector2 = this.obtainVelocity(),
            direction: Vector3 = this.obtainDirection(),
            extend: Vector3 = velocity
                .toVector3()
                .format((item) => Math.min(coe * 5, Math.abs(item) * coe)),
            result: Vector3 = position.clone().sub(direction.multiply(extend));

        if (constraint) {
            const { x: minX, y: minY, x1: maxX, y1: maxY } = constraint,
                { x: dx, y: dy } = this.damping,
                { x, y } = result;

            targetPosition.liveset(
                MathUtils.clamp(x, minX - dx, maxX + dx),
                MathUtils.clamp(y, minY - dy, maxY + dy),
            );
        } else targetPosition.liveCopy(result);

        this.trajectory.length = 0;
    }
    /**
     * 应用步进
     */
    public applyStep(): void {
        if (!this.manager.parent) return;

        const {
                index,
                targetPosition,
                manager: {
                    position,
                    size: { width, height },
                    parent: {
                        size: { width: pw, height: ph },
                    },
                },
            } = this,
            velocity: Vector2 = this.obtainVelocity(),
            direction: Vector3 = this.obtainDirection(true),
            slowX: boolean = velocity.x < 0.5 && velocity.x > 0.05,
            slowY: boolean = velocity.y < 0.5 && velocity.y > 0.05,
            nextX: number = index.x + direction.x,
            nextY: number = index.y + direction.y,
            distance: Vector3 = targetPosition
                .clone()
                .sub(position)
                .format(Math.abs);

        index.set(
            slowX && distance.x < pw / 4
                ? index.x
                : MathUtils.clamp(nextX, 0, Math.ceil(width / pw) - 1),
            slowY && distance.y < ph / 4
                ? index.y
                : MathUtils.clamp(nextY, 0, Math.ceil(height / ph) - 1),
        );
    }
    /**
     * 激活改变
     */
    protected handleChangedActived(active: boolean): void {
        active && this.init();
    }
    /**
     * 更新时间
     */
    protected updateTime(): void {
        this.startTime = performance.now();
    }
    /**
     * 更新步进
     */
    protected updateStep(): void {
        if (!this.manager.parent) return;

        const {
                index,
                constraint,
                targetPosition,
                manager: {
                    parent: {
                        size: { width: pw, height: ph },
                    },
                },
            } = this,
            { x, y } = index,
            result = new Vector3(-pw * x, -ph * y);

        if (constraint) {
            const { x: minX, y: minY, x1: maxX, y1: maxY } = constraint,
                { x: dx, y: dy } = this.damping,
                { x, y } = result;

            targetPosition.liveset(
                MathUtils.clamp(x, minX - dx, maxX + dx),
                MathUtils.clamp(y, minY - dy, maxY + dy),
            );
        } else targetPosition.liveCopy(result);
    }
    /**
     * 获取速度
     */
    protected obtainVelocity(): Vector2 {
        const { trajectory } = this,
            { length: len } = trajectory;

        if (len > 1) {
            const {
                    time: lt,
                    position: { x: lx, y: ly },
                } = trajectory[len - 1],
                {
                    time: ft,
                    position: { x: fx, y: fy },
                } = trajectory[0];

            return new Vector2(
                Math.abs(lx - fx),
                Math.abs(ly - fy),
            ).divideScalar(lt - ft);
        }

        return Vector2.zero();
    }
    /**
     * 获取轨迹向量
     * @param unit 是否单位化
     */
    protected obtainDirection(unit?: boolean): Vector3 {
        const { trajectory } = this,
            { length: len } = trajectory;
        if (len > 1) {
            const { position: lp } = trajectory[len - 1],
                { position: fp } = trajectory[len - 2],
                result = fp.clone().sub(lp);

            if (unit) {
                return result.format((item) =>
                    !!item ? (item > 0 ? 1 : -1) : item,
                );
            }

            return result;
        }
        return Vector3.zero();
    }
    /**
     * 获取约束
     */
    protected obtainConstraint(constraint: TConstraint): Vector4 | undefined {
        const {
            manager: { size, parent },
        } = this;

        if (!parent) return;

        switch (constraint) {
            case "bound":
                const {
                        size: { width: pw, height: ph },
                    } = parent,
                    { width, height } = size,
                    rect = new Vector2(
                        Math.max(pw, width),
                        Math.max(ph, height),
                    );

                return parent?.size.clone().sub(rect).toVector4();
        }
    }

    public setConfig(config: IConfig): void {
        const {
            mode = this.mode,
            damping = this.damping,
            duration = this.duration,
            direction = this.direction,
            constraint = this.constraint,
        } = config;

        let constraintResult: Vector4 | undefined;
        switch (typeof constraint) {
            case "function":
                constraintResult = constraint(this.manager);
                break;
            case "string":
                constraintResult = this.obtainConstraint(constraint);
                this.manager.size.bindCallback(
                    () => (this.constraint = this.obtainConstraint(constraint)),
                );
                this.manager.parent?.size.bindCallback(
                    () => (this.constraint = this.obtainConstraint(constraint)),
                );
                break;
            default:
                constraintResult = constraint;
        }

        Object.assign(this, {
            mode,
            duration,
            constraint: constraintResult,
        });

        damping && this.damping.copy(damping, true);
        direction && this.direction.copy(direction, true);
    }

    protected init(): void {
        this.trajectory.length = 0;
    }

    protected update(time: DOMHighResTimeStamp): void {
        super.update(time);

        if (this.actived.value || !this.mode) return;

        const {
                duration,
                startTime,
                constraint,
                targetPosition,
                manager: { position },
            } = this,
            elapsed: number = time - startTime,
            progress: number = Math.min(elapsed / duration, 1);

        position.add(
            targetPosition.clone().sub(position).multiplyScalar(progress),
        );

        if (constraint && position.equals(targetPosition)) {
            const { x, y } = position,
                { x: minX, y: minY, x1: maxX, y1: maxY } = constraint;

            targetPosition.liveset(
                MathUtils.clamp(x, minX, maxX),
                MathUtils.clamp(y, minY, maxY),
            );
        }
    }
}

interface IConfig extends Partial<
    Pick<IAny, "duration" | "direction" | "damping" | "mode">
> {
    /**
     * 约束
     */
    constraint?:
        Poly.resolveFunc<IAny["constraint"], [BaseCTXNodeAny]> | TConstraint;
}

interface ITrack {
    /**
     * 时间
     */
    time: number;
    /**
     * 位置
     */
    position: Vector3;
}

/**
 * 约束类型
 * bound: 边界约束
 */
type TConstraint = "bound";
/**
 * 模式类型
 * @enum "step": 步进模式
 * @enum "inertia": 惯性模式
 */
type TMode = "step" | "inertia";

type IAny = SlideMod<BaseCTXNodeAny>;

export { IAny as SlideModAny, IConfig as SlideModConfig };
