<h1><center>计算几何基础概念</center></h1>

## 浮点数与精度问题

### 特殊值：

- +0.0 -0.0
- 在常见的 IEC 60559/IEEE 754 浮点实现中，非零数除以 $\pm0.0$ 可能得到 $\pm\mathrm{inf}$，对负数开平方等无效运算可能得到 `NaN`。
- `NaN` 与任何数（包括自身）做有序比较或相等比较都返回 `false`，只有 `!=` 返回 `true`。

这些行为依赖实现和浮点环境，不能把主动除以零或制造 `NaN` 当作可移植的分支技巧。应在运算前检查分母、方向向量和定义域，必要时再使用 `std::isfinite`、`std::isinf`、`std::isnan` 检查结果。

1. 若问题能用整数解决则不用浮点数
2. 除非时限紧张，否则使用 `long double`
3. 减少数学库函数的调用
4. 进行浮点数比较时，加入容限（误差）eps

下文公式中的 $=0$、$>0$ 和 $<0$，若使用浮点数实现，均应通过与数据尺度匹配的误差比较完成；若输入是整数，点积、叉积等判定可使用足够宽的整数类型精确计算，并注意中间乘法溢出。

## 点

$(x,y)$，横坐标：$x$，纵坐标：$y$。

### 向量：

坐标系中一个点对应一个向量，通常使用向量表示一个点。

### 点积：

点积是一个值：

$$​\vec{a}\cdot\vec{b}=a_xb_x+a_yb_y$$

​几何意义：

$$\vec a\cdot \vec b=|\vec a|\times |\vec{b}|\times \cos\theta$$

- 向量的长度：$|\vec a|=\sqrt{\vec a\cdot \vec a}$
- 向量的夹角：$\cos\theta=\dfrac{\vec a\cdot\vec b}{|\vec a|\times |\vec b|}$，要求 $\vec a,\vec b$ 均为非零向量
- $\vec a$ 在 $\vec b$ 方向上的标量投影：$\dfrac{\vec a\cdot\vec b}{|\vec b|}$，要求 $\vec b\ne\vec0$；当 $\vec a,\vec b$ 均非零时，它也等于 $|\vec a|\cos\theta$
- $\vec a$ 在 $\vec b$ 上的向量投影：$\operatorname{proj}_{\vec b}\vec a=\dfrac{\vec a\cdot\vec b}{\vec b\cdot\vec b}\vec b$，要求 $\vec b\ne\vec0$
- 向量垂直：$\vec a\cdot \vec b=0$

### 叉积：

向量的叉积仅在 $2,3$ 维坐标系中存在，更高维通常没有意义。

- $2$ 维是一个标量：$\vec a\times \vec b=a_xb_y-a_yb_x$
- $3$ 维是一个向量：$\vec a\times \vec b=(a_yb_z-a_zb_y,-a_xb_z+a_zb_x,a_xb_y-a_yb_x)$

​几何意义：

$$\vec a\times\vec b=|\vec a|\times |\vec b|\times \sin\theta\widehat{k}$$

- 平行四边形面积：$|\vec a\times \vec b|=|\vec a|\times |\vec b|\times |\sin\theta|$
- 向量平行：$\vec a\times\vec b=\vec 0$
- to-left 测试

### to-left 测试

​判断点 P 在有向直线 AB 左侧/右侧上。

$$\begin{cases}\overrightarrow{AB}\times\overrightarrow{AP}>0& P\ 在有向直线\ AB\ 左侧\\\overrightarrow{AB}\times\overrightarrow{AP}<0&P\ 在有向直线\ AB\ 右侧\\\overrightarrow{AB}\times\overrightarrow{AP}=0&P\ 在有向直线\ AB\ 上\end{cases}$$

### 向量逆时针旋转

​$\vec a$ 逆时针旋转 $\theta$：

$$(a_x,a_y)\rightarrow(\cos\theta a_x-\sin\theta a_y,\sin\theta a_x+\cos\theta a_y)$$


## 线段

$\vec{a},\vec{b}$ 记录线段两端点。

### 判断点是否在线段上：

- 点 P 在 AB 所在直线上：$\overrightarrow{PA}\times\overrightarrow{PB}=0$
- 点 P 在 AB 之间：
  - 若线段包含端点，则 $\overrightarrow{PA}\cdot \overrightarrow{PB}\le 0$；若只判断开线段内部，才使用 $<0$
  - $\min(A_x,B_x)\le P_x\le \max(A_x,B_x)\land \min(A_y,B_y)\le P_y\le \max(A_y,B_y)$

### 判断两条线段是否相交：

- 若只判断严格相交，则要求点 A 和点 B 在直线 CD 的严格不同侧，且点 C 和点 D 在直线 AB 的严格不同侧。
- 若把端点接触和共线重叠也视为相交，还要分别判断四个端点是否落在另一条线段上；点在线段上的判定使用上一节的闭区间条件。

## 直线

通常使用点向式表示：直线上的一点 P 和方向向量 $\vec v$ 表示一条直线，参数方程为 $\vec X=\vec P+t\vec v$。方向向量必须满足 $\vec v\ne\vec0$。

### 求点 A 到直线的距离：


$$d=\dfrac{|\vec v\times\overrightarrow{PA}|}{|\vec v|}$$

### 求点 A 在直线上的投影点 B：

$$\vec B=\vec P+\dfrac{(\vec A-\vec P)\cdot\vec v}{\vec v\cdot\vec v}\vec v,\qquad \vec v\ne\vec0.$$

### 两直线交点：

设两条直线分别为 $\vec P_1+t\vec v_1$ 和 $\vec P_2+s\vec v_2$，且两个方向向量均非零。令

$$D=\vec v_1\times\vec v_2.$$

当 $D\ne0$ 时，两直线有唯一交点，参数和交点分别为

$$t=\dfrac{(\vec P_2-\vec P_1)\times\vec v_2}{D}=\dfrac{\vec v_2\times(\vec P_1-\vec P_2)}{D},$$

$$\vec Q=\vec P_1+t\vec v_1.$$

参数 $t$ 可能为负，不能对分子取绝对值。当 $D=0$ 时：若 $(\vec P_2-\vec P_1)\times\vec v_1\ne0$，两直线平行且不重合；否则两直线重合，没有唯一交点。浮点实现中可按向量长度缩放容限，例如比较 $|D|$ 与 $\varepsilon|\vec v_1||\vec v_2|$，而不是先执行除法。接口应分别返回“唯一交点、平行、重合、方向无效”等状态，不能依赖除以零产生的 `inf` 或 `NaN` 区分。

## 多边形

由点集表示。

- 一般按逆时针顺序
- 不一定满足凸性
- 注意第一个点与最后一个点的处理

### 多边形的面积：

先定义有向二倍面积

$$S_2=\sum\limits_{i=0}^{n-1}\vec P_i\times\vec P_{(i+1)\bmod n}.$$

多边形的普通面积为

$$S=\dfrac{|S_2|}{2}.$$

特别地，三角形的面积：$\frac{|\vec{a}\times\vec{b}|}{2}$

### 多边形的方向：

在标准笛卡尔坐标系中，若顶点沿一个不自交多边形的边界依次给出，则：

- $S_2>0$：逆时针；
- $S_2<0$：顺时针；
- $S_2=0$：退化，不能据此确定方向。

对自交多边形，$S_2/2$ 表示带符号的代数面积，不能直接用来描述整个图形的普通面积或统一方向。

### 判断点是否在多边形内

#### 射线法

从查询点 P 向 $x$ 轴正方向引出射线。首先使用“点在线段上”的闭区间判定检查 P 是否落在任意一条边上；边界点可以单独返回 `BOUNDARY`，也可以按题意统一归入内部或外部。

对非边界点，边 AB 仅在以下两种情况之一成立时贡献一次穿越：

- $A_y\le P_y<B_y$ 且 $\overrightarrow{AB}\times\overrightarrow{AP}>0$；
- $B_y\le P_y<A_y$ 且 $\overrightarrow{AB}\times\overrightarrow{AP}<0$。

这相当于纵坐标区间包含较低端点、排除较高端点，水平边不计数。射线经过普通穿越顶点时贡献一次；经过局部极小点时两条边均贡献，经过局部极大点时两条边均不贡献，因此不会错误改变交点数的奇偶性。穿越次数为奇数时 P 在奇偶填充意义下位于内部，否则位于外部。

#### 回转数法

回转数：闭合曲线绕查询点的有向总圈数。

​遵循非零规则：当回转次数为 0 时，点在曲线外部。

- 一种实现方法：计算相邻两边夹角（有方向）的和。

<center><img src="/计算几何基础1.png" alt="" width="80%"></center>

<center><img src="/计算几何基础2.png" alt="" width="80%"></center>

- 另一种实现方法是沿用射线法的半开规则：向上穿越贡献 $+1$，向下穿越贡献 $-1$。这种写法避免了反三角函数；只有在坐标为整数、叉积使用足够宽的整数类型且中间运算不溢出时，方向判定才没有浮点误差。浮点坐标仍需使用稳健的误差比较。

<center><img src="/计算几何基础3.png" alt="" width="80%"></center>

<center><img src="/计算几何基础4.png" alt="" width="80%"></center>

对简单多边形，奇偶规则与非零回转数规则给出相同的内外结果；对自交多边形，两者分别对应奇偶填充和非零填充，结果可能不同。

#### 判断点是否在凸多边形内

- $n$ 次 to-left 测试 $O(n)$。

- 二分 $O(\log n)$。

上述方法要求多边形凸、非退化，且顶点按同一方向沿边界给出；二分实现还需单独约定点落在边或顶点上的返回结果。
