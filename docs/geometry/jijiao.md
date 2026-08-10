<h1><center>极角序</center></h1>

## 极坐标系

- 极点：O
- 极轴：$\overrightarrow{OL}$
- 极径：$r$
- 极角：$\varphi$
- 极坐标：$(r,\varphi)$

对于非零向量 $(x,y)$，可以在一个约定的、长度为 $2\pi$ 的半开区间（如 $[0,2\pi)$）内定义其极角。当 $x\ne 0$ 时有

$$\tan\varphi=\dfrac{y}{x}$$

但该等式不能唯一确定 $\varphi$：正切函数以 $\pi$ 为周期，因而无法区分象限；当 $x=0$ 时，右侧也没有定义。零向量 $(0,0)$ 的极角本身没有定义，排序时应将其排除，或明确约定它的位置。

## 极角排序

### 排序范围小于 $\pi$

若所有非零向量的极角都位于同一个长度严格小于 $\pi$ 的角区间内，并且该区间不跨越所选的排序断点，则可以用 to-left 测试，即叉积的符号比较极角。若角度范围达到 $\pi$，反向向量的叉积为 $0$，不能仅靠叉积区分先后。

### 完整一周的排序

#### 使用 `atan2`

对非零向量使用 `atan2(y,x)` 计算极角，其值域为 $[-\pi,\pi]$。若要按 $[0,2\pi)$ 排序，可将负角加上 $2\pi$ 后再排序。

`atan2` 的主要优势是同时利用 $x,y$ 判断象限，并且可以处理 $x=0,y\ne 0$，而不是简单地比 `atan(y/x)` “精度更高”。它仍是浮点运算，会受到舍入误差影响；但它不需要先计算 $y/x$，也避免了这一步可能产生的溢出、下溢和额外舍入。

#### 使用半平面和叉积

可以先划分半平面，再在同一半平面内比较叉积。例如约定从 $x$ 轴正半轴开始逆时针排序，即依次为 $x$ 轴正半轴、上半平面、$x$ 轴负半轴、下半平面。下面的整数实现同时约定零向量排在最前，同方向向量按模长从小到大排序：

```cpp
struct Point {
    long long x, y;
};

using i128 = __int128_t;

bool zero(const Point &a) {
    return a.x == 0 && a.y == 0;
}

int half(const Point &a) {
    return a.y < 0 || (a.y == 0 && a.x < 0);
}

i128 cross(const Point &a, const Point &b) {
    return (i128)a.x * b.y - (i128)a.y * b.x;
}

i128 len2(const Point &a) {
    return (i128)a.x * a.x + (i128)a.y * a.y;
}

bool cmp(const Point &a, const Point &b) {
    if (zero(a) != zero(b))
        return zero(a);
    if (zero(a))
        return false;
    if (half(a) != half(b))
        return half(a) < half(b);
    i128 c = cross(a, b);
    if (c != 0)
        return c > 0;
    return len2(a) < len2(b);
}
```

在中间量不溢出的精确整数运算下，该比较器满足严格弱序。若不关心同方向向量的长度次序，也可以在叉积为 $0$ 时直接返回 `false`，将它们视为等价；若后续算法需要确定顺序，则保留模长这一 tie-break。对于浮点坐标，叉积同样会有舍入误差，并非“无精度损失”；也不应直接在排序比较器中用可能破坏传递性的 `eps` 判等。

时间复杂度：$O(n\log n)$。
