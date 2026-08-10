<h1><center>莫队</center></h1>

默认的莫队时间复杂度分析仅考虑指针移动的次数，具体问题中，还需要考虑指针移动时维护信息的时间复杂度，和处理询问答案时的时间复杂度，因此具体实现时，可以根据这个均衡块长。


若无特殊说明，本文时间复杂度分析均为指针移动次数分析。

## 离线莫队

正经莫队。


### 普通莫队

​普通莫队是一个基于分块的离线解决静态区间询问问题的算法。

​设询问区间为 $[l_i,r_i]$。对原序列索引分块。将询问区间离线后以 $l_i$ 所在块的编号为第一关键字，$r_i$ 为第二关键字升序。

#### 算法流程：

​对于每个询问 $[l_i,r_i]$ 的答案，由 $[l_1,r_1]$ 扩展而来，每次用 while 循环暴力移动 $l,r$ 指针。

​此时，升序后的 $[l_i,r_i]$，同一块内的 $l_i$ 对应的询问 $[l_i,r_i]$ 视作一个整体，共有 $\frac nt$ 个块。在一个块内的 $r$ 最多移动 $n$ 次（因为同一块内的 $r$ 升序，最多从 $1$ 移动到 $n$。在同一个块内 $l$ 每次扩展最多移动 $t$ 次。同时，从一个块的右端点询问的 $l$ 向下一个块的左端点的 $l$ 扩展时，$l$ 最多移动 $2t$，$r$ 最多移动 $n$。

#### 时间复杂度分析：

​综上：处理完 $m$ 个询问，$l,r$ 指针的总移动次数为：$O(\dfrac{n^2}{t}+mt)$。

​当 $t=\dfrac{n}{\sqrt m}$ 时，时间复杂度最优为：$O(n\sqrt m)$。

​认为 $n,m$ 同阶，所以直接取 $\sqrt n$。

#### 优化：

​奇偶化排序：对奇数块内的询问的 $r$ 进行升序，对偶数块内的询问的 $r$ 进行降序。

​这是很自然的，因为按原本的排序方式，每次进入一个新块时，$r$ 都会从最大值降到最小值，再又升到最大值。这当然是不优的。

::: details 点击展开代码

```c++
struct Query {
    int l, r, id;
    bool operator<(const Query &t) const {
        return (kind[l] ^ kind[t.l]) ? kind[l] < kind[t.l]
                                     : ((kind[l] & 1) ? r < t.r : r > t.r);
    }
};
void add(int x) {
    /*
    	将 a[x] 加入答案
    */
}
void del(int x) {
    /*
    	将 a[x] 删去
    */
}
void solve() {
    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B;
    sort(q + 1, q + 1 + m);
    int l = 1, r = 0;
    for (int i = 1; i <= m; i++) {
        while (q[i].l < l) add(--l);
        while (q[i].r > r) add(++r);
        while (q[i].l > l) del(l++);
        while (q[i].r < r) del(r--);
        /*
        	ans[q[i].id] = ...
        */
    }
}
```

:::

### 回滚莫队

​回滚莫队用于 add 容易维护，del 不易维护的问题，可以将 del 操作转换成 add 操作。

#### 算法流程：

​在普通莫队中，处理 $l_i$ 位于同一块内的询问时：

- 若 $r_i$ 也在 $l_i$ 的块内，询问区间长度 $\le t$，直接暴力处理。
- 若 $r_i$ 不在 $l_i$ 的块内，按 $r_i$ 升序 add，对于相同的 $r_i$ 的不同 $l_i$，因为 $l_i$ 在同一块内，所以直接重新从 $l_i$ 所在块的右边界 add 过去。

​这样实现时，不同块的 $l_i$ 的询问之间就独立了，进入下一个块时，要清空维护的信息。

左端点在块内回滚时，最无脑的做法就是开一个 history 栈，把所有数组和修改的位置和值存下来，通过清空栈回退。

#### 时间复杂度分析：

处理过程中，右端点移动 $O(n)$，有 $O(\dfrac{n}{B})$，总 $O(\dfrac{n^2}{B})$，左端点均摊每个询问移动 $O(B)$，总 $O(mB)$。

::: details 点击展开代码

```cpp
struct Query {
    int l, r, id;
    bool operator<(const Query &t) const {
        if (kind[l] != kind[t.l])
            return kind[l] < kind[t.l];
        return r < t.r;
    }
} q[N];

void solve() {

    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B + 1;

    sort(q + 1, q + 1 + m);

    int i = 1, l, r, res = 0;
    auto add = [&](int x){

    };
    while (i <= m) {
        int j = i;
        while (j <= m && kind[q[i].l] == kind[q[j].l])
            j++;
        int right = min(n, kind[q[i].l] * B);
        while (i < j && q[i].r <= right) {
            res = 0;
            for (int k = q[i].l; k <= q[i].r; k++)
                add(k);
            /*
			    ans[q[i].id] = ...;
			*/
            // 清空信息
            i++;
        }
        l = right + 1, r = right;
        while (i < j) {
            while (r < q[i].r)
                add(++r);
            /*
                拷贝旧信息
            */
            while (l > q[i].l)
                add(--l);
            /*
			    ans[q[i].id] = ...;
			*/
            while(l < right + 1){
                l++;// 回滚
            }
            /*
                回滚到旧信息
            */
            i++;
        }
        // 清空信息
    }
}
```

:::

#### 只减不删的回滚莫队

如果信息是 del 容易维护，add 不容易维护，那么可以每次，左端点从块的左端点向右移动，右端点从 $n$ 向块的右端点移动。

全局信息从 $[1,n]$ 不断移动左端点得到。

### 带修莫队

#### 算法流程：

​带修莫队与普通莫队相比，多了一维时间轴表示每修改一次，时间增加 $1$。

​把询问表示成 $(l,r,t)$ 的形式，其中 $t$ 表示这次询问位于第 $t$ 次修改和第 $t+1$ 次修改之间。

将三元组按照某种规则排序后考虑指针移动次数。

令 $L,R$ 分别表示 $l,r$ 所在的块的编号，全 $6$ 种排序的移动次数表

| 排序关键字 | L 移动次数 | R 移动次数 | T 移动次数 | 总移动次数 |
| :---: | :---: | :---: | :---: | :---: |
| $L,R,T$ | $O(QB + n)$ | $O(QB + nG)$ | $O(CG^2)$ | $O(QB + nG + CG^2)$ |
| $R,L,T$ | $O(QB + nG)$ | $O(QB + n)$ | $O(CG^2)$ | $O(QB + nG + CG^2)$ |
| $L,T,R$ | $O(QB + n)$ | $O(QB + nCG)$ | $O(CG)$ | $O(QB + nCG)$ |
| $R,T,L$ | $O(QB + nCG)$ | $O(QB + n)$ | $O(CG)$ | $O(QB + nCG)$ |
| $T,L,R$ | $O(QB + nC)$ | $O(QB + nCG)$ | $O(C)$ | $O(QB + nCG)$ |
| $T,R,L$ | $O(QB + nCG)$ | $O(QB + nC)$ | $O(C)$ | $O(QB + nCG)$ |

---

把 $G = \frac{n}{B}$ 代进去：

| 排序关键字 | 总移动次数 |
| :---: | :---: |
| $L,R,T$ | $O\left(QB + \frac{n^2}{B} + \frac{Cn^2}{B^2}\right)$ |
| $R,L,T$ | $O\left(QB + \frac{n^2}{B} + \frac{Cn^2}{B^2}\right)$ |
| $L,T,R$ | $O\left(QB + \frac{Cn^2}{B}\right)$ |
| $R,T,L$ | $O\left(QB + \frac{Cn^2}{B}\right)$ |
| $T,L,R$ | $O\left(QB + nC + \frac{Cn^2}{B}\right)$，通常写作 $O\left(QB + \frac{Cn^2}{B}\right)$ |
| $T,R,L$ | $O\left(QB + nC + \frac{Cn^2}{B}\right)$，通常写作 $O\left(QB + \frac{Cn^2}{B}\right)$ |


#### 时间复杂度分析：

对于所有排序规则分析取最小值，只有 $(L,R,T),(R,L,T)$ 是 $O(n^{5/3})$，剩下的均会出现 $O(\frac{cn^2}{B})$，最优为 $O(n^2)$。

​认为序列大小 $n$，询问次数 $m$，修改次数 $t$ 同阶，块长取 $n^{\frac{2}{3}}$ 时，时间复杂度最优，为 $O(n^{\frac{5}{3}})$。


#### 优化：

和普通莫队奇偶排序类似地，带修莫队多一维，进行蛇形排序。


::: details 点击展开代码


```cpp
struct Query {
    int l, r, t, id;
    bool operator<(const Query &x) const
    {
        if (kind[l] != kind[x.l])
            return l < x.l;
        if (kind[r] != kind[x.r])
            return (kind[l] & 1) ? r < x.r : r > x.r;
        return (kind[r] & 1) ? t < x.t : t > x.t;
    }
};
void solve() {
    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B;

    // m1 是询问数，m2 是已经读入的修改数。
    m1 = m2 = 0;
    for (int i = 1; i <= m; i++) {
        char op;
        cin >> op;
        if (op == 'Q') {
            int l, r;
            cin >> l >> r;
            ++m1;
            // 当前询问发生在前 m2 次修改之后，答案编号为 m1。
            q[m1] = {l, r, m2, m1};
        } else if (op == 'C') {
            int x, v;
            cin >> x >> v;
            c[++m2] = {x, v};
        }
    }

    sort(q + 1, q + 1 + m1);
    auto add = [&](int x){

    };
    auto del = [&](int x){

    };
    int l = 1, r = 0, t = 0;
    for (int i = 1; i <= m1; i++) {
        while (q[i].l < l) add(a[--l]);
        while (q[i].r > r) add(a[++r]);
        while (q[i].l > l) del(a[l++]);
        while (q[i].r < r) del(a[r--]);
        while (t < q[i].t)
        {
            t++;
            auto &[now, cur] = c[t];
            if (now >= l && now <= r)
            {
                del(a[now]);
                add(cur);
            }
            swap(a[now], cur);
        }
        while (t > q[i].t)
        {
            auto &[now, cur] = c[t];
            if (now >= l && now <= r)
            {
                del(a[now]);
                add(cur);
            }
            swap(a[now], cur);
            t--;
        }
        /*
            ans[q[i].id] = ...;
        */
    }
}
```

:::

### 树上莫队

​树上莫队就是莫队上树，询问树上路径信息，因为莫队通过 add 和 del 维护信息，所以在括号序上跑莫队即可。括号序会通过一次 add 和一次 del 将树上两点的 LCA 的祖先信息去掉。

如果是询问子树信息，那么通常通过 dfs 序转换成连续的区间处理，后续同其他莫队。

#### 算法流程：

通过「欧拉序」将树上的一条路径转换成序列上一段连续的区间。

这一部分本质是「欧拉序」的技巧。

对于路径 $(x,y)$，令 $tin[x]\le tin[y]$，令 $z=\text{LCA}(x,y)$。
- 若 $x=z$，则路径上的点在 $[tin[x]],tin[y]]$ 上出现奇数次。
- 若 $x\ne z$，则除 $z$ 外路径上的点在 $[tout[x], tin[y]]$ 上出现奇数次，此时要给这组询问特殊加一个 $z$ 单点的指针扩展。

指针移动时，维护变化元素的奇偶次数，奇相当于加入，偶相当于删去。

注：不难发现，树上莫队维护时，必定需要支持 add 和 del，所以不能处理「树上回滚莫队」。

#### 时间复杂度分析：

与普通莫队一致。

### 二次离线莫队

#### 算法流程：

普通莫队进行指针移动时，如果 add 和 del 操作的时间复杂度不为 $O(1)$，那么时间复杂度会变劣，如果这一部分贡献可以通过前缀和差分的方式离线计算，那么就可以去掉这一部分的时间复杂度。

具体而言，处理每一个询问的指针移动时，$l,r$ 只会向某一侧单调移动且不会出现 $l>r$ 的情况。

以 $[l,r]$ 移动到 $[l,r'],r'>r$ 为例，每次 add 的贡献为 $f(a[x],l,x-1),x\in[r+1,r']$。

如果 $f$ 可差分，那么 $f(a[x],l,x-1)=g(a[x],x-1)-g(a[x],l-1)$。

$r$ 指针移动过程中总贡献为 $\sum\limits_{x=r+1}^{r'}(g(a[x],x-1)-g(a[x],l-1))$。

继续拆成两部分：$\sum\limits_{x=r+1}^{r'}g(a[x],x-1)-\sum\limits_{x=r+1}^{r'}g(a[x],l-1)$。

第一部分，令 $h(x)=g(a[x],x-1)$，可以写成 $h(r')-h(r)$，预处理 $h(x)$ 即可。

第二部分，以一个区间形式「二次离线」（目的是做到线性空间），需要被计算的 $g(a[x],l-1)$ 数量规模同原莫队指针移动次数规模 $O(n\sqrt m)$。

回滚莫队二次离线同理。

剩下三种指针移动情况类似，具体贡献范围下标略有区别。

**注意最后要将询问的贡献按莫队排序后的顺序前缀累计。**

#### 时间复杂度分析：

第二部分的贡献仍然计算 $O(n\sqrt m)$ 次，剩下部分的瓶颈为计算前缀信息的时间复杂度，需要结合具体问题分析。


::: details 点击展开代码
```cpp
auto addEvent = [&](int p, int L, int R, int id, int k)
{
    event[p].push_back({L, R, id, k});
};

for (int i = 1; i <= m; i++)
{
    int ql = q[i].l, qr = q[i].r, id = q[i].id;
    if (ql < l)
    {
        int L = ql;
        int R = l - 1;
        addEvent(r, L, R, id, 1);
        ans[id] -= sum2(L, R);
        l = ql;
    }

    if (qr > r)
    {
        int L = r + 1;
        int R = qr;
        ans[id] += sum1(L, R);
        addEvent(l - 1, L, R, id, -1);
        r = qr;
    }

    if (ql > l)
    {
        int L = l;
        int R = ql - 1;
        addEvent(r, L, R, id, -1);
        ans[id] += sum2(L, R);
        l = ql;
    }

    if (qr < r)
    {
        int L = qr + 1;
        int R = r;
        ans[id] -= sum1(L, R);
        addEvent(l - 1, L, R, id, 1);
        r = qr;
    }
}
```
:::

## 在线莫队

和“莫队”实际没有什么关系，随着时代发展，普及的技巧而已。

### 在线普通莫队

<!-- #### "假"莫队 -->

对原序列预处理 $res_{i,j}$ 表示第 $i$ 块到第 $j$ 块的结果。

询问 $[l,r]$ 时，$L,R$ 分别表示 $l$ 右侧的一个块，$r$ 左侧第一个块，那么从 $res_{L,R}$ 向两侧扩展即可。如果是 del，就从 $l,r$ 左右的块向内 del。

卡常优化：从离 $l,r$ 近的一侧的块开始扩展，可以小一半指针移动常数。

时间复杂度：$O((\dfrac{n}{B})^2+mB)$，具体还要取决于求解 $res_{i,j}$ 所需要的时间复杂度。

以区间不同数的个数为例，那么就是 $O(\dfrac{n}{B}\times n+mB)$，$B$ 取 $\dfrac{n}{\sqrt m}$ 时，最优为 $O(n\sqrt m)$。

空间复杂度：$O((\dfrac{n}{B})^2\times n)$，如果每个 $res_{i,j}$ 单独维护一个信息状态是这样。

此时，$B$ 取 $n^{\frac{2}{3}}$ 最优，时空复杂度均为 $O(n^{\frac{5}{3}})$。

如果信息可以差分，以区间不同数的个数为例，维护数的个数，可以调用 $[1,j]-[1.i-1]$ 的信息状态得到 $res_{i,j}$ 的信息状态。那么空间复杂度：$O(\dfrac{n^2}{B})$，此时 $B$ 取 $\sqrt n$ 最优，时空复杂度均为 $O(n\sqrt n)$。

注：也可以说这是「在线的回滚莫队」，因为它可以处理仅 add 或仅 del。

<!-- #### “真”莫队

考虑真正的指针移动，将 $(l,r)$ 视作平面上的点，所有状态为 $n\times n$ 的矩形。

将 $n\times n$ 的矩阵划分成 $\frac{n}{B}\times\frac{n}{B}$ 个 $B\times B$ 的子矩形，对于每个子矩形维护一个 $(x,y)$ 和信息状态。

当询问 $(l,r)$ 时，将 $(l,r)$ 所在子矩形中的 $(x,y)$ 移动到 $(l,r)$，移动次数为 $O(B)$。

时间复杂度：$O(mB+(\frac{n}{B})^2n)$。

空间复杂度：$O((\frac{n}{B})^2n)$，因为每一个小矩形都需要单独维护一个信息状态。

$B$ 取 $n^{\frac{2}{3}}$ 时最优，时空复杂度均为 $O(n^{\frac{5}{3}})$。 -->

### 在线带修莫队

在在线普通莫队的基础上，为 $res_{i,j}$ 支持修改，每次修改涉及 $O((\dfrac{n}{B})^2)$ 个状态。

所以时间复杂度加上 $O(m(\dfrac{n}{B})^2)$，其他部分不变。

$B$ 取 $n^{\frac{2}{3}}$ 时最优，时空复杂度均为：$O(n^{\frac{5}{3}})$。

## 莫队卡常

### 计算变化量

莫队移动指针时，考虑对答案的影响，可以不重新计算，只考虑变化量。

### 下标连续访问

莫队指针移动在序列上是连续的，如果问题涉及位置上的值，使用桶维护值域的时候，可以采用特殊的离散化方式，将原序列上连续的一段尽可能连续。或者直接把统计方式放在序列的位置上，因为位置的指针移动本身就是连续的。
