import { TransformUtils } from "@goengine/canvas/src/util/Transform";
import BaseCTXNode, {
    BaseCTXNodeAny,
    BaseCTXNodeConfig,
    BaseCTXNodeEvent,
} from "../Base";

const TEMPLATE_NODE_MAP: Map<
    NTemplate.Key,
    Instance<BaseCTXNodeAny>
> = new Map();
/**
 * 模板节点
 */
export default class Template extends BaseCTXNode<IConfig, BaseCTXNodeEvent> {
    /**
     * 注册
     * @param type
     * @param node
     * @param replace
     * @returns
     */
    public static register(
        type: NTemplate.Key,
        node: Instance<BaseCTXNodeAny>,
        replace?: boolean,
    ): void {
        if (!replace && TEMPLATE_NODE_MAP.has(type)) return;
        TEMPLATE_NODE_MAP.set(type, node);
    }

    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 获取模板
     * @param type
     * @returns
     */
    protected obtainTemplate(
        type: NTemplate.Key,
    ): Instance<BaseCTXNodeAny> | void {
        if (!TEMPLATE_NODE_MAP.has(type)) {
            console.warn(`${type} 类型未注册`);
            return;
        }

        const temp = TEMPLATE_NODE_MAP.get(type)!;

        if (!(temp.prototype instanceof BaseCTXNode)) {
            console.warn(`${type} 不是一个有效的注册节点`);
            return;
        }

        return temp;
    }
    /**
     * 解析
     * @param list
     * @param parent
     */
    protected analysis(
        list: NTemplate.Config[],
        parent: BaseCTXNodeAny = this,
    ): void {
        list.forEach(({ name, type, template, children }) => {
            const temp = this.obtainTemplate(type);

            if (!temp) return console.warn(`${name} - 解析出错`);

            const node = new temp(template);

            node.userData["NODE_NAME"] = name;

            parent.add(node);
            children && this.analysis(children, node);
        });
    }
    /**
     * 路径解析
     * @param list
     */
    protected pathAnalysis(list: NPath.Config[]): void {
        this.path = new Path2D();

        list.forEach(({ type, template }) => {
            const temp = this.obtainTemplate(type);

            if (!temp) return;

            const {
                    path,
                    scale: { x: sx, y: sy },
                    position: { x: tx, y: ty },
                    rotation: { z: rotation },
                } = new temp(template),
                transfrom = new DOMMatrix(
                    TransformUtils.compose({ tx, ty, sx, sy, rotation }),
                );

            this.path.addPath(path, transfrom);
        });
    }

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const { paths, children } = config;

        paths && this.pathAnalysis(paths);
        children && this.analysis(children);
    }
}

interface IConfig extends BaseCTXNodeConfig {
    /**
     * 路径
     */
    paths?: NPath.Config[];
    /**
     * 子节点
     */
    children?: NTemplate.Config[];
}

namespace NTemplate {
    export type Map = Canvas.TemplateMap;

    export type Key = keyof Map;

    export type Config = {
        [K in Key]: Node<K>;
    }[Key];

    export interface Node<T extends Key> {
        /**
         * 名称
         */
        name: string;
        /**
         * 类型
         */
        type: T;
        /**
         * 模板
         */
        template: Map[T];
        /**
         * 子节点
         */
        children?: Config[];
    }
}

namespace NPath {
    export type Map = Canvas.PathMap;

    export type Key = keyof Map;

    export type Config = {
        [K in Key]: Node<K>;
    }[Key];

    export interface Node<T extends Key> {
        /**
         * 类型
         */
        type: T;
        /**
         * 模板
         */
        template: Map[T];
    }
}
