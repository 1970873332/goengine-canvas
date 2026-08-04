import Matrix4 from "@goengine/core/src/object/math/matrix/Matrix4";
import { BaseCTXNodeAny, BaseCTXNodeRule } from "../node/Base";

/**
 * 变换工具类
 */
export abstract class TransformUtils {
    /**
     * 合并变换
     * @param param0 变换
     * @returns
     */
    public static compose({
        tx,
        ty,
        sx,
        sy,
        rotation,
        matrix,
    }: IConfig): TTransform {
        const cos = Math.cos(rotation),
            sin = Math.sin(rotation),
            // 旋转矩阵 (单位向量)
            localRot = {
                x1: cos,
                y1: sin,
                x2: -sin,
                y2: cos,
            },
            // 缩放矩阵
            localScale = {
                x: sx,
                y: sy,
            };

        // 如果没有矩阵，返回局部变换 (R * S) + 平移
        if (!matrix) {
            return [
                localRot.x1 * localScale.x,
                localRot.y1 * localScale.x,
                localRot.x2 * localScale.y,
                localRot.y2 * localScale.y,
                tx,
                ty,
            ];
        }

        // 组合矩阵和局部变换
        // Canvas 变换顺序: T(平移) → R(旋转) → S(缩放)
        // 完整变换: W * T * R * S
        const { x1, x2, x4, y1, y2, y4 } = matrix,
            // R * S 的 x 轴: (cos * sx, sin * sx)
            // R * S 的 y 轴: (-sin * sy, cos * sy)
            // T * R * S 展开:
            // x' = (cos*sx)*x + (-sin*sy)*y + tx
            // y' = (sin*sx)*x + (cos*sy)*y + ty
            // 所以 T 在最后应用（Canvas 是右乘）
            r11 = localRot.x1 * localScale.x,
            r12 = localRot.y1 * localScale.x,
            r21 = localRot.x2 * localScale.y,
            r22 = localRot.y2 * localScale.y;

        return [
            x1 * r11 + x2 * r12, // m11 = W.row1 · (r11, r12)
            y1 * r11 + y2 * r12, // m12 = W.row2 · (r11, r12)
            x1 * r21 + x2 * r22, // m21 = W.row1 · (r21, r22)
            y1 * r21 + y2 * r22, // m22 = W.row2 · (r21, r22)
            x1 * tx + x2 * ty + x4, // dx = W * (tx, ty, 1)
            y1 * tx + y2 * ty + y4, // dy = W * (tx, ty, 1)
        ];
    }
    /**
     * 分解变换矩阵为平移、旋转、缩放
     * @param transform [a, b, c, d, e, f] 变换数组
     * @returns 分解后的变换值
     */
    public static decomposeTransform(
        transform: TTransform,
    ): Pick<IConfig, "tx" | "ty" | "sx" | "sy" | "rotation"> {
        const [a, b, c, d, tx, ty] = transform,
            // 缩放 (从矩阵行列式和模长计算)
            sx = Math.sqrt(a * a + b * b),
            sy = Math.sqrt(c * c + d * d),
            // 旋转 - 需要归一化向量后再计算角度，避免非均匀缩放影响
            rotation = Math.atan2(b / sx, a / sx);

        return { tx, ty, sx, sy, rotation };
    }
    /**
     * 合并偏移
     * @param transform
     * @param anchor
     */
    public static composeOffset(
        config: IConfig,
        anchor: VectorObject.Vector2,
    ): IConfig {
        const { tx, ty } = config,
            { x, y } = anchor;

        return { ...config, tx: tx + x, ty: ty + y };
    }
    /**
     * 根据规则生成变换配置
     * @param rule 规则
     * @param sample 样本
     * @param matrix 矩阵
     * @returns
     */
    public static generateByRule(
        rule: BaseCTXNodeRule,
        sample: BaseCTXNodeAny,
        matrix?: Matrix4,
    ): IConfig {
        const { scale, position, rotation } = rule,
            {
                scale: { x: sx, y: sy },
                position: { x: tx, y: ty },
                rotation: { z: rz },
            } = sample;

        return {
            tx: position?.x ?? tx,
            ty: position?.y ?? ty,
            sx: scale?.x ?? sx,
            sy: scale?.y ?? sy,
            rotation: rotation?.z ?? rz,
            matrix,
        };
    }
    /**
     * 应用矩阵
     * @param ctx 上下文
     * @param matrix 矩阵
     */
    public static transformMatrix(
        ctx: Canvas.Context2D,
        matrix: Matrix4,
        options?: IOptions,
    ): void {
        const { x1, x2, x4, y1, y2, y4 } = matrix,
            { append } = options ?? {},
            transform = [x1, y1, x2, y2, x4, y4] as const;

        append ? ctx.transform(...transform) : ctx.setTransform(...transform);
    }
    /**
     * 应用变换
     * @param ctx 上下文
     * @param param1 变换矩阵
     * @returns
     */
    public static transform(
        ctx: Canvas.Context2D,
        config: IConfig,
        options?: IOptions,
    ): void {
        const { append } = options ?? {},
            result = this.compose(config);

        append ? ctx.transform(...result) : ctx.setTransform(...result);
    }
    /**
     * 应用变换
     * @param ctx
     * @param configs
     */
    public static transfroms(ctx: Canvas.Context2D, configs: IConfig[]): void {
        configs.forEach((config, index) => {
            const transfrom = this.compose(config);
            index === 0
                ? ctx.setTransform(...transfrom)
                : ctx.transform(...transfrom);
        });
    }
    /**
     * 获取矩阵
     * @param config 变换配置
     * @returns Matrix4矩阵
     */
    public static obtainMatrix(config: IConfig): Matrix4 {
        const [a, b, c, d, tx, ty] = this.compose(config);

        return new Matrix4().set([
            a,
            b,
            0,
            0,
            c,
            d,
            0,
            0,
            0,
            0,
            1,
            0,
            tx,
            ty,
            0,
            1,
        ]);
    }
    /**
     * 应用变换到节点
     * @param node 节点
     * @param transform 变换
     * @param silence 静默
     */
    public static applyToNode(
        node: BaseCTXNodeAny,
        config: IConfig,
        silence?: boolean,
    ): void {
        const { tx, ty, sx, sy, rotation } = config.matrix
            ? // 组合矩阵与变换并分解
              this.decomposeTransform(this.compose(config))
            : config;

        // 更新节点属性
        node.position.rx.setter(tx);
        node.position.ry.setter(ty);

        node.scale.rx.setter(sx);
        node.scale.ry.setter(sy);

        node.rotation.rz.setter(rotation);

        node.quaternion.fromEuler(node.rotation, true);

        node.updateMatrix();

        !silence && node.trigger();
    }
}

interface IConfig {
    /**
     * x轴平移
     */
    tx: number;
    /**
     * y轴平移
     */
    ty: number;
    /**
     * x轴缩放
     */
    sx: number;
    /**
     * y轴缩放
     */
    sy: number;
    /**
     * 旋转角度，单位为弧度
     */
    rotation: number;
    /**
     * 矩阵
     */
    matrix?: Matrix4;
}

interface IOptions {
    /**
     * 追加
     */
    append?: boolean;
}

type TTransform = [number, number, number, number, number, number];

export { IConfig as TransformConfig, TTransform as TransformType };
