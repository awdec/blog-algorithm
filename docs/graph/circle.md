<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>环计数问题</center></h1>

无向图环计数，扩展性较差。

主要有以下三类：

## 普通环计数

限制：没有自环

普通环计数是 P 完全的（不存在多项式解法）。

和哈密顿路径类似，考虑状压 dp。

首先，对于一个环，钦定以环上的编号最小的节点为起止点。

令 $f_{i,s}$ 表示已经过的点集为 $s$，且终点为 $i$ 的方案数，$f_{i,s}\times (i,j)\rightarrow f_{j,s|2^j}$，转移即可。

时间复杂度：$O(2^nm)$ 或 $O(2^nn^2)$。

因为环可以向两个方向走：$a_1\rightarrow a_2\rightarrow a_3\rightarrow a_1$ 和 $a_1\rightarrow a_3\rightarrow a_2\rightarrow a_1$，同一个环会被算两遍（除了二元环 $u\rightarrow v\rightarrow u$）

所以答案减去二元环的数量再除以 $2$ 即可。

注：具体情况具体讨论题目是否将二元环视作简单环。

## 三元环计数

给边定向，规定从度数小的点指向度数大的点，度数相同的点，由编号小的指向编号大的。

此时，枚举 $u$ 的出边 $(u,v)$，再枚举 $v$ 的入边，$(v,w)$，判断 $(u,v,w)$ 三点是否构成三元环即可。

可以证明，时间复杂度：$O(m\sqrt m)$。

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
int ans = 0;
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

## 四元环计数

四元环即：$a\rightarrow b\rightarrow c\rightarrow d\rightarrow a$，注意到：枚举 $a,c$ 时，$b,d$ 就可以独立统计了。

对边排序，度数小的排在前面，度数大的排在后面。

枚举度数大的点作为 $a$，再枚举度数小的点作为 $c$，求 $a,c$ 之间有多少点满足和 $a,c$ 都有边即可。

因为 $b,d$ 这里独立了，所以枚举复杂度本质和前文三元环计数相同，可以证明，时间复杂度：$O(m\sqrt m)$。

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

int ans = 0;
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

## 五元环计数

无向图上，起止点相同的长度为五的路径只有两种情况：
- 五元环
- 三元环上挂一个二元环

长度为五的路径数，容易通过 dp 实现。

对于三元环上挂一个二元环，相当于三元环上每一个点再向外连一条边，即：$(deg_x-1)+(deg_y-1)+(deg_z-1)$，所以枚举每一个三元环即可统计。

时间复杂度：$O(n^3)$。

```cpp
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
int ans = 0;
for (int i = 1; i <= n; i++)
    ans += dp[5][i][i];
ans /= 10;
for (int i = 1; i <= n; i++) {
    for (int j = i + 1; j <= n; j++) {
        for (int k = j + 1; k <= n; k++) {
            if (dp[1][i][j] && dp[1][j][k] && dp[1][k][i]) {
                ans -= deg[i] + deg[j] + deg[k] - 3;
            }
        }
    }
}
```

## X(X $\ge$ 6)元环计数

X(X $\ge$ 6)元环计数暂无高效做法。

目前只找到五元以下的高效环计数解法。

## 有向图三元环计数

即：$u\rightarrow v\rightarrow w\rightarrow u$

对于 $v,w$ 考虑使用 `bitset` 维护可达 $v$ 的点和 $w$ 可达的点集。

枚举边 $v\rightarrow w$，对 `bitset` 求交，时间复杂度：$O(\frac{n^3}{w})$。