<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>最小生成树</center></h1>

## Kruskal

将边集升序后，使用并查集贪心合并顶点不在同一个连通块中的边即可。

时间复杂度：$O(m\log m+n\alpha(n))$，瓶颈是排序。

```cpp
sort(edge.begin(), edge.end());
for (auto [u, v, w] : edge) {
    if (dsu.same(u, v))
        continue;
    dsu.merge(u, v);
}
```

## Prim

Prim 本质上求的是一棵根向叶子的有向树，用 $dis_x$ 表示 $x$ 向父节点的边权。

每次扩展一个 $dis$ 最小的叶子，朴素维护时间复杂度：$O(n^2+m)$。

```cpp
dis[1] = 0;
for (int _ = 1; _ < n; _++) {
    int mini = 0;
    for (int i = 1; i <= n; i++) {
        if (dis[i] < dis[mini] && !vis[i])
            mini = i;
    }
    vis[mini] = 1;
    for (auto [v, w] : p[mini]) {
        if (!vis[v])
            dis[v] = min(dis[v], w);
    }
}
```

时间复杂度同 Dijkstra，使用二叉堆维护 $O((n+m)\log m)$。

```cpp
dis[1] = 0;
q.push({1, 0});
for (int _ = 1; _ < n; _++) {
    while (q.size() && vis[q.top().v])
        q.pop();
    if (q.empty())
        break;
    auto [now, __] = q.top();
    vis[now] = 1;
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

## Boruvka

时间复杂度：$O((n+m)\log n)$。

```cpp
bool Better(int x, int y) {
    if (!y)
        return 1;
    if (edge[x].w != edge[y].w)
        return edge[x].w < edge[y].w;
    return x < y;
}
while (flag) {
    flag = 0;
    memset(best, 0, sizeof best);
    for (int i = 1; i <= m; i++) {
        if (vis[i])
            continue;
        int x = dsu.find(edge[i].u), y = dsu.find(edge[i].v);
        if (x == y)
            continue;
        if (Better(i, best[x]))
            best[x] = i;
        if (Better(i, best[y]))
            best[y] = i;
    }
    for (int i = 1; i <= n; i++) {
        if (best[i] && !vis[best[i]]) {
            flag = 1;
            vis[best[i]] = 1;
            dsu.merge(edge[best[i]].u, edge[best[i]].v);
        }
    }
}
```

## 次小生成树

> 次小生成树一定是最小生成树替换一条边得到的


对于不在最小生成树上的边 $(u,v,w)$，考虑用最小生成树上路径 $(u,v)$ 中的最大边替换这条边，更新权值和即可。

根据替换的边权是否严格小于 $w$，可分为严格次小生成树和非严格次小生成树。

## 瓶颈路

$x,y$ 最小瓶颈路指 $x,y$ 的所有路径中最大边权最小的路径。

可以证明，最小生成树上 $x,y$ 的路径是一条最小瓶颈路。

反之，最大瓶颈路指 $x,y$ 的所有路径中最小边权最大的路径，最大生成树上 $x,y$ 的路径是一条最大瓶颈路。

## Kruskal 重构树

在 Kruskal 运行过程中，对于树边 $(u,v,w)$，令合并时 $u$ 的根节点为 $x$，$v$ 的根节点为 $v$，那么新建节点 $t$，$a_t=w$，连边 $(t,x),(t,y)$，形成的树即为 Kruskal 重构树。

$x,y$ 的最小瓶颈路即为最小生成树的 Kruskal 重构树上 $x,y$ 的 LCA 的权值。


## 最小树形图

最小树形图是在带权有向图上的最小叶向有向生成树。

### 朱刘算法

```cpp
int zl(int n, int r) {
    int res = 0;
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
        for (int i = 1; i <= n; i++)
            if (i != r)
                res += pre[i].w;
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
    return res;
}
```

时间复杂度：$O(nm)$。


### 左偏树优化。


时间复杂度：$O(m+n\log n)$。