<h1><center>环计数问题</center></h1>

无向图环计数，扩展性较差。

主要有以下三类：

## 普通环计数

以下默认讨论无自环、无重边的简单无向图；简单环的长度至少为 $3$。

在一般无向图中精确计数所有简单环是 #P-complete 的计数问题，而不是 P-complete。判定图中是否存在环本身可以在线性时间完成；困难的是精确计数。当前没有已知的多项式时间精确算法，通常只能在 $\mathrm{FP}\ne\#\mathrm P$ 的复杂性假设下说明其不存在，不能写成无条件结论。

和哈密顿路径类似，考虑状压 dp。

为避免同一个环从不同顶点开始而被重复统计，钦定环上编号最小的节点 $r$ 为起止点。

令 $f_{S,v}$ 表示从 $r=\min S$ 出发，恰好经过点集 $S$，当前终点为 $v$ 的简单路径数量。对每个单点集合初始化 $f_{\{r\},r}=1$；转移时只加入满足 $u>r$、$u\notin S$ 且 $(v,u)\in E$ 的点：

$$
f_{S\cup\{u\},u}\mathrel{+}=f_{S,v}.
$$

当 $|S|\ge3$ 且 $(v,r)\in E$ 时，将 $f_{S,v}$ 加入闭环计数。这样每个简单环只会以其最小编号点为起点，但仍会按顺、逆两个方向各统计一次。

时间复杂度：$O(2^nm)$ 或 $O(2^nn^2)$。

因此最终答案直接除以 $2$。简单无向图中沿同一条边 $u\to v\to u$ 往返使用了同一条边两次，不是简单环，不应先计入再减去。

若题目讨论允许重边的多重图，并把两条不同的平行边视为长度为 $2$ 的环，则应根据平行边数量另外统计；这与沿同一条无向边往返不同。环数可能很大，实际实现还需按题意使用大整数或取模。

## 三元环计数

给边定向，规定从度数小的点指向度数大的点，度数相同的点，由编号小的指向编号大的。

所有边都按“度数、编号”这一全序定向。先标记 $u$ 的所有出邻点，再枚举两条连续的出边 $u\to v$、$v\to w$；若同时存在 $u\to w$，则 $(u,v,w)$ 构成一个三元环。每个无向三元环只会按上述全序统计一次。

可以证明，时间复杂度：$O(m\sqrt m)$。

:::details 点击展开代码
```cpp
for (int i = 1; i <= m; i++) {
    if (deg[u[i]] < deg[v[i]])
        add(u[i], v[i]);
    else if (deg[v[i]] < deg[u[i]])
        add(v[i], u[i]);
    else if (u[i] < v[i])
        add(u[i], v[i]);
    else
        add(v[i], u[i]);
}
long long ans = 0;
for (int i = 1; i <= n; i++) {
    for (auto v : p[i])
        vis[v] = 1;
    for (auto u : p[i])
        for (auto v : p[u])
            if (vis[v])
                ans++;
    for (auto v : p[i])
        vis[v] = 0;
}
```
:::

## 四元环计数

四元环即：$a\rightarrow b\rightarrow c\rightarrow d\rightarrow a$，注意到：枚举 $a,c$ 时，$b,d$ 就可以独立统计了。

对边排序，度数小的排在前面，度数大的排在后面。

枚举度数大的点作为 $a$，再枚举度数小的点作为 $c$，求 $a,c$ 之间有多少点满足和 $a,c$ 都有边即可。

因为 $b,d$ 这里独立了，所以枚举复杂度本质和前文三元环计数相同，可以证明，时间复杂度：$O(m\sqrt m)$。

四元环数量可能超过 32 位整数范围，答案使用 `long long` 保存；若题目规模仍可能超过 64 位，则需使用大整数或按题意取模。

:::details 点击展开代码
```cpp
vector<int> a(n + 1);

for (int i = 1; i <= n; i++)
    a[i] = i;

auto cmp = [&](int x, int y) { return deg[x] < deg[y]; };
sort(a.begin() + 1, a.end(), cmp);
vector<int> rk(n + 1);

for (int i = 1; i <= n; i++)
    rk[a[i]] = i;

for (int i = 1; i <= n; i++) {
    for (auto u : p[i]) {
        if (rk[u] < rk[i]) {
            edge[i].push_back(u);
        }
    }
}

long long ans = 0;
vector<int> cnt(n + 1);

for (int i = 1; i <= n; i++) {
    for (auto u : edge[a[i]]) {
        for (auto v : p[u]) {
            if (rk[v] >= rk[a[i]])
                continue;

            ans += cnt[v];
            cnt[v]++;
        }
    }

    for (auto u : edge[a[i]]) {
        for (auto v : p[u]) {
            cnt[v] = 0;
        }
    }
}
```
:::

## 五元环计数

无向图上，起止点相同的长度为五的路径只有两种情况：
- 五元环
- 三元环上插入一次沿某条边走出再返回的二步回走

长度为五的路径数，容易通过 dp 实现。

矩阵迹 $\operatorname{tr}(A^5)$ 统计带起点和方向的长度为 $5$ 的闭游走，每个五元环贡献 $10$ 次。先除以 $10$ 后，一个三元环 $(x,y,z)$ 产生的二步回走贡献为 $(deg_x-1)+(deg_y-1)+(deg_z-1)$，所以再枚举每个三元环减去这部分即可。

时间复杂度：$O(n^3)$。

`dp` 中的闭游走数量和最终答案都可能超过 32 位整数范围，统一使用 `long long`；若结果可能超过 64 位，则仍需使用大整数或取模。

:::details 点击展开代码
```cpp
long long dp[6][N][N];
for (int i = 1; i <= m; i++) {
    int u, v;
    cin >> u >> v;
    dp[1][u][v] = dp[1][v][u] = 1;
    deg[u]++, deg[v]++;
}
for (int i = 2; i <= 5; i++) {
    for (int j = 1; j <= n; j++) {
        for (int k = 1; k <= n; k++) {
            for (int l = 1; l <= n; l++) {
                dp[i][k][l] += dp[i - 1][k][j] * dp[1][j][l];
            }
        }
    }
}
long long ans = 0;
for (int i = 1; i <= n; i++)
    ans += dp[5][i][i];
ans /= 10;
for (int i = 1; i <= n; i++) {
    for (int j = i + 1; j <= n; j++) {
        for (int k = j + 1; k <= n; k++) {
            if (dp[1][i][j] && dp[1][j][k] && dp[1][k][i]) {
                ans -= 1LL * deg[i] + deg[j] + deg[k] - 3;
            }
        }
    }
}
```
:::

## 固定长度 $X\ge6$ 的环计数

本文暂未给出 $X\ge6$ 的具体实现，这不表示不存在高效或专门算法。

当 $X$ 是固定常数时，枚举本身已经给出关于 $n$ 的多项式算法；还可以使用颜色编码、分治、矩阵乘法和其他代数方法改进不同图类上的检测或计数复杂度。当 $X$ 也是输入的一部分，或要求统计所有长度的简单环时，问题的复杂度则不同，需要单独讨论。

## 有向图三元环计数

即：$u\rightarrow v\rightarrow w\rightarrow u$

对于 $v,w$ 考虑使用 `bitset` 维护可达 $v$ 的点和 $w$ 可达的点集。

枚举边 $v\rightarrow w$，对 `bitset` 求交，时间复杂度：$O(\frac{n^3}{w})$。
