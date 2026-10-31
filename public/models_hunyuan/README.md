# TT08 Hunyuan 版 GLB · 接入说明

由腾讯混元（Hunyuan）图生 3D 模型后处理得到，作为 `models/`（Blender 重建版）的**备选替换**。原版文件未改动。

## 文件
| 文件 | 款式 | 大小 | 三角面 | 包围盒 宽×高×厚 | 处理 |
|---|---|---|---|---|---|
| `TT08-W01.glb` | 连帽卫衣 | 1.37 MB | 50,000 | 0.88×1.00×0.30 | 原模型平铺很薄（厚/宽 13%），已加厚：Z ×2 + 躯干鼓起 |
| `TT08-W02.glb` | 长袖 T | 1.28 MB | 50,000 | 0.84×1.00×0.39 | 无需加厚 |
| `TT08-W03.glb` | 宽松短袖 T | 0.82 MB | 28,113 | 0.93×1.00×0.49 | 已去掉人台脖子、手臂、裤子和抽绳 |
| `TT08-W04.glb` | 宽松长袖 T（黑） | 1.11 MB | 35,256 | 0.69×1.00×0.46 | 已去掉头、脖子、手和裤子，手部的洞已用黑色补面；保留模特交叉双臂的姿势 |

验证图：`threejs_test_all_rot0.png` / `threejs_test_all_rot90.png`（本目录），各款 `clothing-3d/TT08-W0x/hunyuan/render_hy_*.png`、`threejs_test.png`，总览 `clothing-3d/hunyuan_contact.png`。

## 规格（和 Blender 版一致）
- 坐标：**Y 轴朝上，正面朝 +Z**；包围盒中心在原点；**高度统一为 1.0**。
- 单 mesh、单 PBR 材质：baseColor + normal 贴图，2048² **WebP**（`EXT_texture_webp`），metallic 0 / roughness 0.9，双面渲染。
- **没有 Draco / Meshopt 压缩**，标准 `GLTFLoader` 即可加载（three.js r130+ 支持 WebP），不需要额外的解码器。

## 替换到网站
1. 最简单：把加载路径 `models/TT08-W0x.glb` 改成 `models_hunyuan/TT08-W0x.glb`。其他代码（相机、灯光、OrbitControls、衣架偏移）都不用改。
2. 或者先备份 `models/`，再用本目录的同名文件覆盖。
3. 测试页：在 `clothing-site/` 下运行 `python3 -m http.server`，打开 `test_hy.html`（可加 `?rot=90`、`&only=W03`）。

## 已知问题
- 几何和贴图都是 AI 生成的。背面和侧面是模型自己补出来的，不是实拍。
- W01 的厚度是程序加的，侧面轮廓偏"枕头形"；左袖背面原模型有一道深色缝（来源瑕疵）。
- W03 的领口内侧和袖口有少量切割留下的毛边。
- W04 是穿在人身上的姿态（双臂交叉，不是平挂），领口是平切的。手附近可能有极少量肤色碎点。

## 衣架适配（fix/hanger-fit）
- 衣架改为按款式拟合：`src/hanger.js` 里的 `HANGER_FITS`（衣服局部坐标），在 Blender 里对每个 GLB 求解并做了穿模检测。
- `w01.glb`（卫衣）有改动：只改了索引缓冲区，删掉了挂钩穿过帽子内衬处的 28 个三角面（开一个约 Ø3 cm 的小孔），以及衣架臂附近 1201 个从外面任何角度都看不到的内部夹层面。顶点、UV、贴图都没动，三角面 50,000 → 48,779。
- 换了 GLB 就要重新拟合（脚本在资产工作区 `hanger_fix/work/`）。
