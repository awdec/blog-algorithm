<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>极角序</center></h1>

## 极坐标系

- 极点：O
- 极轴：$\overrightarrow{OL}$
- 极径：$r$
- 极角：$\varphi$
- 极坐标：$(r,\varphi)$


$$\tan\varphi=\dfrac{y}{x}$$

## 极角排序

### 排序范围小于 $\pi$

​to-left 测试，即叉积比较。

### 排序范围小于 $2\pi$

#### 有精度损失

​使用反三角函数 `atan2(y,x)` （精度比 `atan` 更高）函数计算极角，`atan2` 值域是 $[-\pi,\pi]$ 然后排序。

#### 无精度损失

​先划分上下平面，同一部分内进行叉积比较.

例如：​下半平面 $<$ 原点 $< x$ 正半轴 $<$ 上半平面 $< x$  负半轴

​时间复杂度：$O(n\log n)$。