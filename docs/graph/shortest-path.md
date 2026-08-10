<h1><center>最短路</center></h1>

## Dijkstra

Dijkstra 只适用于边权非负的图。距离和中间加法应使用 64 位整数；下方取 `INF=2^62`，并假设单条边权与所有需要输出的有限最短路都落在 `(-INF,INF)` 内。优先队列必须按距离从小到大弹出。

$O(m\log m)$ 实现：

:::details 点击展开代码
```cpp
vector<long long> dijkstra(int s, int n) {
    const long long INF = 1LL << 62;
    vector<long long> dis(n + 1, INF);
    using pli = pair<long long, int>;
    priority_queue<pli, vector<pli>, greater<pli>> q;
    dis[s] = 0;
    q.push({0, s});
    while (q.size()) {
        auto [cur, now] = q.top();
        q.pop();
        if (cur != dis[now])
            continue;
        for (auto [v, w] : p[now]) {
            if (w > INF - dis[now])
                continue;
            long long nxt = dis[now] + w;
            if (dis[v] > nxt) {
                dis[v] = nxt;
                q.push({nxt, v});
            }
        }
    }
    return dis;
}
```
:::

稠密图上，$O(n^2)$ 实现优于 $O(m\log m)$ 实现：

:::details 点击展开代码
```cpp
vector<long long> dijkstra(int s, int n) {
    const long long INF = 1LL << 62;
    vector<long long> dis(n + 1, INF);
    vector<bool> vis(n + 1);
    dis[s] = 0;
    for (int _ = 1; _ <= n; _++) {
        int mini = 0;
        for (int i = 1; i <= n; i++) {
            if (!vis[i] && (!mini || dis[i] < dis[mini])) {
                mini = i;
            }
        }
        if (!mini || dis[mini] == INF)
            break;
        vis[mini] = 1;
        for (auto [v, w] : p[mini]) {
            if (vis[v] || w > INF - dis[mini])
                continue;
            long long nxt = dis[mini] + w;
            if (dis[v] > nxt) {
                dis[v] = nxt;
            }
        }
    }
    return dis;
}
```
:::

## Bellman-Ford 

Bellman-Ford 基于松弛次数，特殊地，可以用来求解经过边数不超过某个数量的最短路。

原地松弛可以用于普通 Bellman-Ford，并可能在一轮内传播多条边；但若限制至多经过 $k$ 条边，第 $i$ 轮必须只从第 $i-1$ 轮的距离转移。下方模板每轮备份一次数组，时间复杂度为 $O(k(n+m))$。

:::details 点击展开代码
```cpp
vector<long long> bellman_ford(int s, int n, int k) {
    const long long INF = 1LL << 62;
    vector<long long> dis(n + 1, INF);
    dis[s] = 0;
    for (int _ = 1; _ <= k; _++) {
        auto pre = dis;
        bool flag = 0;
        for (int u = 1; u <= n; u++) {
            if (pre[u] == INF)
                continue;
            for (auto [v, w] : p[u]) {
                if (dis[v] > pre[u] + w) {
                    dis[v] = pre[u] + w;
                    flag = 1;
                }
            }
        }
        if (!flag)
            break;
    }
    return dis;
}
```
:::

### spfa

SPFA 使用队列只处理本轮距离被更新的顶点，可以看作 Bellman-Ford 的队列优化。普通最短路模板假设从源点不可达负环；若存在可达负环，必须使用后文的检测版本及时终止。

它在部分数据上运行较快，但最坏时间复杂度仍为 $O(nm)$，各种队列顺序优化也不改变这一最坏界。

标准实现使用 `inq` 标记顶点是否已在队列中，避免同一个顶点被重复加入队列。

:::details 点击展开代码
```cpp
vector<long long> spfa(int s, int n) {
    const long long INF = 1LL << 62;
    vector<long long> dis(n + 1, INF);
    vector<bool> inq(n + 1);
    dis[s] = 0;
    queue<int> q;
    q.push(s);
    inq[s] = 1;
    while (q.size()) {
        auto now = q.front();
        q.pop();
        inq[now] = 0;
        for (auto [v, w] : p[now]) {
            if (dis[v] > dis[now] + w) {
                dis[v] = dis[now] + w;
                if (!inq[v]) {
                    q.push(v);
                    inq[v] = 1;
                }
            }
        }
    }
    return dis;
}
```
:::

### 判负环

从指定源点 $s$ 出发，只能发现从 $s$ 可达的负环。若要判断图中任意位置是否存在负环，应增加超级源点并向每个顶点连一条 $0$ 权边；实现上也可以等价地令所有顶点初始距离为 $0$ 并全部入队。

Bellman-Ford 版：

:::details 点击展开代码
```cpp
bool bellman_ford(int s, int n) {
    const long long INF = 1LL << 62;
    vector<long long> dis(n + 1, INF);
    dis[s] = 0;
    for (int _ = 1; _ <= n; _++) {
        for (int i = 1; i <= n; i++) {
            for (auto [v, w] : p[i]) {
                if (dis[i] == INF)
                    continue;
                if (dis[v] > dis[i] + w) {
                    dis[v] = dis[i] + w;
                    if (_ == n)
                        return 1;
                }
            }
        }
    }
    return 0;
}
```
:::

spfa 版：

:::details 点击展开代码
```cpp
bool spfa(int n) {
    vector<long long> dis(n + 1);
    vector<int> cnt(n + 1);
    vector<bool> inq(n + 1);
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        q.push(i);
        inq[i] = 1;
    }
    while (q.size()) {
        auto now = q.front();
        q.pop();
        inq[now] = 0;
        for (auto [v, w] : p[now]) {
            if (dis[v] > dis[now] + w) {
                dis[v] = dis[now] + w;
                cnt[v] = cnt[now] + 1;
                if (cnt[v] >= n)
                    return 1;
                if (!inq[v]) {
                    q.push(v);
                    inq[v] = 1;
                }
            }
        }
    }
    return 0;
}
```
:::

## Floyd

应先把距离矩阵初始化为 `INF`，再一次性令 `dis[i][i]=0`，之后读入边并取最小值。不能在三重循环中反复把对角线改回 $0$，否则已经得到的负对角值会被覆盖，负环信息也会丢失。

:::details 点击展开代码
```cpp
const long long INF = 1LL << 62;
vector<vector<long long>> dis(n + 1, vector<long long>(n + 1, INF));
for (int i = 1; i <= n; i++)
    dis[i][i] = 0;
for (auto [u, v, w] : edge)
    dis[u][v] = min(dis[u][v], 1LL * w);
for (int k = 1; k <= n; k++) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (dis[i][k] == INF || dis[k][j] == INF)
                continue;
            dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);
        }
    }
}
```
:::

算法结束后，若存在 $i$ 满足 $dis[i][i]<0$，则图中存在负环。无向图读边时还需同时更新反向距离。

### 传递闭包

Floyd 可用于求解传递闭包，即全源可达性。特别地，使用 `bitset` 优化，时间复杂度：$O(\frac{n^3}{w})$。

:::details 点击展开代码
```cpp
for (int k = 1; k <= n; k++) {
    for (int i = 1; i <= n; i++) {
        if (dis[i][k])
            dis[i] |= dis[k];
    }
}
```
:::

注：Floyd 常数极小，$O(n^3)$ 的时间复杂度可以通过 $n=1000$ 的数据。

### 最小环：

:::details 点击展开代码
```cpp
auto get_path = [&](auto self, int x, int y) -> void {
    if (!pos[x][y])
        return;
    auto now = pos[x][y];
    self(self, x, now);
    ans.push_back(now);
    self(self, now, y);
};
for (int k = 1; k <= n; k++) {
    for (int i = 1; i < k; i++) {
        for (int j = i + 1; j < k; j++) {
            if (dis[i][j] + Dis[j][k] < minn - Dis[k][i]) {
                minn = dis[i][j] + Dis[j][k] + Dis[k][i];
                ans.clear();
                ans.push_back(k);
                ans.push_back(i);
                get_path(get_path, i, j);
                ans.push_back(j);
            }
        }
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (dis[i][j] > dis[i][k] + dis[k][j]) {
                dis[i][j] = dis[i][k] + dis[k][j];
                pos[i][j] = k;
            }
        }
    }
}
```
:::

时间复杂度：$O(n^3)$。

## Johnson 全源最短路

Johnson 算法用于稀疏图的全源最短路，允许负边，但图中不能存在负环。

新增超级源点 $0$，向每个原顶点连接一条 $0$ 权边。使用 Bellman-Ford 求出 $h_v=dis(0,v)$；若检测到负环，则原问题无解。随后将每条边重赋权为

$$
w'(u,v)=w(u,v)+h_u-h_v.
$$

由最短路三角不等式可知 $w'(u,v)\ge0$，所以可以从每个顶点运行 Dijkstra。设重赋权后的最短距离为 $d'(s,v)$，原距离为

$$
d(s,v)=d'(s,v)-h_s+h_v.
$$

下面用所有 $h_i=0$ 初始化 Bellman-Ford，这与显式添加超级源点的效果相同。模板返回 $0$ 表示存在负环；所有边权、势能和重赋权结果均需落在 64 位与 `INF` 约定的范围内。

:::details 点击展开代码
```cpp
bool johnson(int n, vector<vector<long long>> &ans) {
    const long long INF = 1LL << 62;
    vector<long long> h(n + 1);
    for (int _ = 1; _ <= n; _++) {
        bool flag = 0;
        for (auto [u, v, w] : edge) {
            if (h[v] > h[u] + w) {
                h[v] = h[u] + w;
                flag = 1;
            }
        }
        if (!flag)
            break;
        if (_ == n)
            return 0;
    }

    vector<vector<pair<int, long long>>> g(n + 1);
    for (auto [u, v, w] : edge) {
        long long nw = (long long)((__int128)w + h[u] - h[v]);
        g[u].push_back({v, nw});
    }

    ans.assign(n + 1, vector<long long>(n + 1, INF));
    using pli = pair<long long, int>;
    for (int s = 1; s <= n; s++) {
        vector<long long> dis(n + 1, INF);
        priority_queue<pli, vector<pli>, greater<pli>> q;
        dis[s] = 0;
        q.push({0, s});
        while (q.size()) {
            auto [cur, u] = q.top();
            q.pop();
            if (cur != dis[u])
                continue;
            for (auto [v, w] : g[u]) {
                if (w > INF - dis[u])
                    continue;
                long long nxt = dis[u] + w;
                if (dis[v] > nxt) {
                    dis[v] = nxt;
                    q.push({nxt, v});
                }
            }
        }
        for (int v = 1; v <= n; v++) {
            if (dis[v] != INF)
                ans[s][v] = (long long)((__int128)dis[v] - h[s] + h[v]);
        }
    }
    return 1;
}
```
:::

使用二叉堆时，时间复杂度为 $O(nm+nm\log m)$，通常写作 $O(nm\log m)$；若保存完整答案矩阵，空间复杂度为 $O(n^2+m)$。


## 不同最短路算法的比较

|最短路算法|Dijkstra|Bellman-Ford|Floyd|Johnson|
|--|---|---|---|---|
|图限制|非负权图|可含负边|可含负边|可含负边、无负环|
|解对象|单源最短路|单源最短路|全源最短路|全源最短路|
|判负环|不能|能|能|能|
|时间复杂度|$O(n^2)/O(m\log m)$|$O(nm)$|$O(n^3)$|$O(nm\log m)$|

## 0-1 BFS

边权只有 0/1 的最短路问题，使用双端队列维护，若松弛时边权为 $0$，则将点加入队首，若松弛时边权为 $1$ 则将点加入队尾。

使用邻接表时，每个顶点和每条边只会产生常数次有效处理，时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

## 差分约束

差分约束用于解决 $n$ 元一次不等式组问题，且要求 $n$ 元一次不等式是形如 $x_{a_i}\le x_{b_i}+c_i$。

根据最短路三角不等式 $dis_v\le dis_u+w$，约束 $x_{a_i}\le x_{b_i}+c_i$ 应建立有向边 $b_i\to a_i$，边权为 $c_i$。若误建成 $a_i\to b_i$，得到的是方向相反的约束。建图后求得的最短路数组给出一组可行解；图中存在负环当且仅当约束系统无解。

此外，最短需要一个源点，所以对于上述不等式组，需要做一些额外限制：

- 求解最短路需要源点和所有点连通，所以建图后每一个连通块的求解是独立的。求解一个不等式组，需要钦定一些变量的值，而对应在图中，这些需要被钦定的变量就是强连通分量缩点后入度为 $0$ 的点。
- 对于原始问题：$x_{a_i}\le x_{b_i}+c_i$  的不等式，实际上是有无穷多组解的，因为给每一个元素加一个常数 $d$ 后，不等式组仍成立。所以求一组解时，可以给每一个元素一个初值的限制也就是超级源点向每一个点连的边权，然后给超级源点钦定一个初值。

### 最小解

若问题要求每个 $x_i$ 的最小解，那么 $dis_v\ge dis_u+w$，$dis_v$ 合法的最小值为 $\max\{dis_u+w\}$ 才能使所有不等式成立。

使用最长路求解。

注：实际问题中还需要题目对每一个数有最小限制：$x_i\ge e_i$，否则可以无穷小。

### 最大解：

若问题要求每个 $x_i$ 的最大解，那么 $dis_v\le dis_u+w$，$dis_v$ 合法的最大值为 $\min\{dis_u+w\}$ 才能使所有不等式成立。

使用最短路求解。

注：实际问题中还需要题目对每一个数有最大限制：$x_i\le e_i$，否则可以无穷大。

### 最后

所以实际上，我之前在洛谷板子 [P5960 【模板】差分约束](https://www.luogu.com.cn/problem/P5960) 的代码实际上求的是 $x_i\le 0$ 的最大解。

### expand 1.

朴素的，由上可知，差分约束需要每一个不等式严格满足有两个变量 $x_{a_i}$ 和 $x_{b_i}$，这样才有三角不等式。

但是对于只有一个变量的不等式，可以转换成和超级源点的连边 $x_{a_i}\le x_0+c_i$（和钦定初值同理）。

### expand 2.

如果出现 $x_{a_i}=c_i$ 这种条件，可以转换成 $x_{a_i}\le c_i$ 和 $x_{a_i}\ge c_i$ 从而转换成 $x_{a_i}\le x_0+c_i,x_0\le x_{a_i}-c_i$ 的两个不等式。

### expand 3.

对于除法不等式形如：$\dfrac{x_{a_i}}{x_{b_i}}\le c_i$，可以通过取对数，将除法转换成减法。

$\dfrac{x_{a_i}}{x_{b_i}}\le c_i\rightarrow \log x_{a_i}-\log x_{b_i}\le \log c_i$。

## 最短路图/最短路树

只考虑从源点 $s$ 可达且最短距离有限的顶点。对于原图中的边 $(u,v,w)$，若

$$
dis_v=dis_u+w,
$$

则称它为紧边；由所有紧边组成的子图称为最短路图。从 $s$ 到 $t$ 的最短路与最短路图中 $s$ 到 $t$ 的路径对应。

最短路图不一定是 DAG。紧边环上的等式相加后，环的总边权必为 $0$；因此只在不存在总权为 $0$ 的紧边环时，最短路图才是 DAG。对于非负权图，这种环只能由 $0$ 权边组成。

若最短路图是 DAG，可以拓扑排序后进行路径计数等 dp。若存在 $0$ 权紧边，即使没有形成环，紧边两端的距离也可能相等，优先队列对同距离顶点的弹出顺序不保证是拓扑序，所以直接在 Dijkstra 过程中同步计数仍可能漏算。只有当每条相关紧边都满足 $dis_u<dis_v$（例如所有边权都严格为正）或另行保证了正确处理顺序时，在线 dp 才是安全的。

最短路树需要为每个可达的非源点选择一条紧入边。不存在紧边环时可以直接选择；存在 $0$ 权紧环时则不能任取，否则可能选出环，应使用一次实际的搜索/松弛过程记录父边，保证最终得到以 $s$ 为根的树。若允许反复经过 $0$ 权环，则最短路“游走”的数量甚至可能无穷，需要先明确题目统计的是路径还是游走。
