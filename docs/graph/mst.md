<h1><center>最小生成树</center></h1>

## Kruskal

将边集升序后，使用并查集贪心合并顶点不在同一个连通块中的边即可。

排序必须按边权升序。并查集需要检查全部 $m$ 条边，因此初始化和并查集操作的复杂度为 $O(n+m\alpha(n))$；总时间复杂度为 $O(m\log m+n+m\alpha(n))=O(m\log m+n)$，瓶颈通常是排序。

:::details 点击展开代码
```cpp
sort(edge.begin(), edge.end());
long long ans = 0;
int cnt = 0;
for (auto [u, v, w] : edge) {
    if (dsu.same(u, v))
        continue;
    dsu.merge(u, v);
    ans += w;
    cnt++;
}
if (cnt != n - 1) {
    // 图不连通，不存在生成树
    return;
}
```
:::

上方代码默认 `edge` 的比较规则以边权为第一关键字。最终必须恰好选出 $n-1$ 条边；仅得到一个权值累加和并不能说明原图连通。

## Prim

### 朴素维护

Prim 本质上求的是一棵根向叶子的有向树，用 $dis_x$ 表示 $x$ 向父节点的边权。

每次扩展一个 $dis$ 最小的叶子，朴素维护时间复杂度：$O(n^2+m)$。

下面模板默认 `dis` 初始化为 `inf`、`vis` 初始化为 $0$。根节点也需要作为一次扩展被选中，因此共循环 $n$ 次；若某次最小值仍为 `inf`，说明原图不连通。

:::details 点击展开代码
```cpp
long long ans = 0;
dis[1] = 0;
for (int _ = 1; _ <= n; _++) {
    int mini = 0;
    for (int i = 1; i <= n; i++) {
        if (!vis[i] && (!mini || dis[i] < dis[mini]))
            mini = i;
    }
    if (!mini || dis[mini] == inf) {
        // 图不连通，不存在生成树
        return;
    }
    vis[mini] = 1;
    ans += dis[mini];
    for (auto [v, w] : p[mini]) {
        if (!vis[v])
            dis[v] = min(dis[v], w);
    }
}
```
:::

### 堆优化

时间复杂度同 Dijkstra，使用二叉堆维护 $O((n+m)\log m)$。

下面的 `q` 为按候选边权从小到大取出的优先队列。根节点同样计入 $n$ 次扩展；队列提前为空表示剩余顶点不可达，必须报告无生成树。

:::details 点击展开代码
```cpp
long long ans = 0;
dis[1] = 0;
q.push({1, 0});
for (int _ = 1; _ <= n; _++) {
    while (q.size() && vis[q.top().v])
        q.pop();
    if (q.empty()) {
        // 图不连通，不存在生成树
        return;
    }
    auto [now, __] = q.top();
    q.pop();
    vis[now] = 1;
    ans += dis[now];
    for (auto [v, w] : p[now]) {
        if (!vis[v]) {
            if (dis[v] > w) {
                q.push({v, w});
                dis[v] = w;
            }
        }
    }
}
```
:::

### 其他数据结构优化

容易发现，堆优化 Prim 只是用二叉堆优化了取最小值的过程。

那么同样地，完全可以使用任意其他可以维护最值的数据结构来优化 Prim，如线段树、`set` 等。

同时，根据其他数据结构的功能，还可以扩展出其他存图方式，本质上只要能维护 `dis` 数组即可。

## Boruvka

每轮先根据轮开始时的并查集，为每个当前连通块记录一条最轻出边，再统一尝试合并。若原图连通，每个尚未完成的连通块都有出边，合并后连通块数量至少减半，因此最多进行 $O(\log n)$ 轮。计入并查集操作后，时间复杂度为 $O((n+m)\alpha(n)\log n)$，通常简写为 $O(m\log n)$。

:::details 点击展开代码
```cpp
int cnt = n - 1;
long long ans = 0;
dsu.init(n);
while (cnt) {
    vector<int> minn(n + 1, inf);
    vector<pii> mini(n + 1, {0, 0});
    for (auto [u, v, w] : edge) {
        int x = dsu.find(u), y = dsu.find(v);
        if (x == y)
            continue;
        if (minn[x] > w) {
            minn[x] = w;
            mini[x] = {u, v};
        }
        if (minn[y] > w) {
            minn[y] = w;
            mini[y] = {u, v};
        }
    }
    bool flag = 0;
    for (int i = 1; i <= n; i++) {
        auto [u, v] = mini[i];
        if (!u || dsu.same(u, v))
            continue;
        dsu.merge(u, v);
        ans += minn[i];
        cnt--;
        flag = 1;
    }
    if (!flag) {
        // 图不连通，不存在生成树
        return;
    }
}
```
:::

Boruvka 本质上只要找到当前每个连通块向外的最小边即可，如果条件允许，也不见得一定要遍历所有边。

## 次小生成树

> 固定一棵最小生成树后，至少存在一棵最优的候选次小生成树，可以通过加入一条非树边、再从形成的环上删除一条树边得到。

设最小生成树权值为 $W$。对于非树边 $(u,v,w)$，加入它会与树上 $u,v$ 路径形成一个环；若删除路径上的树边权值 $x$，新树权值为

$$
W+w-x.
$$

若只要求得到一棵不同的生成树，并允许其权值仍等于 $W$，删除路径上的最大边即可。若要求严格次小生成树，即答案必须严格大于 $W$，则必须删除路径上权值严格小于 $w$ 的最大边：

- 当路径最大边权 $mx_1<w$ 时，删除 $mx_1$；
- 当 $mx_1=w$ 时，删除路径上第二大的不同边权 $mx_2$；若不存在 $mx_2$，这条非树边不能产生严格候选。

因此倍增查询通常维护路径上前两大的不同边权，而不是只维护一个最大值。若允许负边权，空值必须初始化为 `-inf`，不能用 $0$ 充当不存在的边权。

## 瓶颈路

$x,y$ 最小瓶颈路指 $x,y$ 的所有路径中最大边权最小的路径。

可以证明，最小生成树上 $x,y$ 的路径是一条最小瓶颈路。

反之，最大瓶颈路指 $x,y$ 的所有路径中最小边权最大的路径，最大生成树上 $x,y$ 的路径是一条最大瓶颈路。

## Kruskal 重构树

在 Kruskal 运行过程中，对于树边 $(u,v,w)$，令合并时 $u$ 的根节点为 $x$，$v$ 的根节点为 $y$，那么新建节点 $t$，令 $a_t=w$，连接 $(t,x),(t,y)$，再把 $x,y$ 所在集合的根更新为 $t$，形成的树即为 Kruskal 重构树。

原图顶点 $u,v$ 的最小瓶颈值等于 Kruskal 重构树上 $u,v$ 的 LCA 的权值。若原图不连通，得到的是重构森林，只能查询同一连通块内的点对。


## 最小树形图

本文讨论以 $r$ 为根的最小外向树形图：根 $r$ 能沿有向边到达所有顶点，每个非根点恰好有一条入边，目标是使总边权最小。若要求所有点都能到达根的内向树形图，应反转所有边后再使用同一算法。

### 朱刘算法

:::details 点击展开代码
```cpp
bool zl(int n, int r, long long &res) {
    res = 0;
    while (1) {
        vector<node> pre(n + 1);
        for (int i = 1; i <= n; i++)
            pre[i].w = inf;
        for (auto u : edge) {
            if (u.v == r)
                continue;
            if (u.w <= pre[u.v].w) {
                pre[u.v] = {u.u, u.w};
            }
        }
        for (int i = 1; i <= n; i++) {
            if (i == r)
                continue;
            if (pre[i].w == inf)
                return 0;
            res += pre[i].w;
        }
        stack<int> q;
        vector<bool> vis(n + 1);
        vector<int> num(n + 1), col(n + 1);
        int id = 0;
        for (int i = 1; i <= n; i++) {
            int now = i;
            if (col[now] || i == r)
                continue;
            while (now && !vis[now] && !col[now]) {
                q.push(now);
                vis[now] = 1;
                now = pre[now].v;
            }
            if (vis[now]) {
                id++;
                while (q.top() != now) {
                    int cur = q.top();
                    q.pop();
                    num[cur] = id;
                    vis[cur] = 0;
                    col[cur] = 2;
                }
                q.pop();
                num[now] = id;
                vis[now] = 0;
                col[now] = 2;
            }
            while (q.size()) {
                int cur = q.top();
                q.pop();
                num[cur] = ++id;
                vis[cur] = 0;
                col[cur] = 1;
            }
        }
        bool flag = 0;
        for (int i = 1; i <= n; i++)
            if (col[i] == 2) {
                flag = 1;
                break;
            }
        if (!flag)
            break;
        vector<Edge> tmp;
        for (auto u : edge) {
            if (num[u.u] == num[u.v])
                continue;
            tmp.push_back({num[u.u], num[u.v], u.w - pre[u.v].w});
        }
        edge = tmp;
        r = num[r];
        n = id;
    }
    return 1;
}
```
:::

每轮必须先确认所有非根点都存在入边；若某点没有入边，则根无法到达该点，树形图不存在。上方接口返回是否有解，权值通过 `res` 输出。

时间复杂度：$O(nm)$。


### 左偏树优化。


时间复杂度：$O(m+n\log n)$。
