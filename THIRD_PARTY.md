# Open-source research and licenses

V6 的实现研究了下列项目。除项目依赖 `three` 外，没有把这些仓库的源文件复制进本项目。

| Project | What was studied | License / usage |
| --- | --- | --- |
| `14islands/r3f-scroll-rig` | 单一全局 Canvas、滚动场景与 DOM 布局同步、按需渲染思路 | MIT；仅研究架构 |
| `JosephASG/codrops-cinematic-scroll-animations` | 滚动驱动镜头与排版的电影化节奏 | MIT；仅研究节奏 |
| `dgreenheck/three-pinata` | 有种子的预切割、双材质表面、UV 连续性 | MIT；仅研究数据策略 |
| `houmahani/codrops-depth-gallery` | 将滚动速度用于雾与空间气氛 | MIT；仅研究交互思路 |
| `pmndrs/react-postprocessing` | 后处理链的组织方式 | MIT；仅研究；本项目直接使用 Three examples passes |
| `pmndrs/postprocessing` | 合并效果和性能策略 | zlib；仅研究 |
| `magnuswahlstrand/dissolve-effect` | dissolve 视觉参考 | 仓库未发现许可证，因此没有复制代码；本项目 shader 独立编写 |
| `mrdoob/three.js` | WebGL 渲染、几何、纹理与 examples 后处理 passes | MIT；运行时依赖 |

本项目的固定 12 片多边形、位姿、时间延迟、侵蚀 shader、Earth 夜间调色母图与交互时间线均为本轮实现。
