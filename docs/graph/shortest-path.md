<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>最短路</center></h1>

## Dijkstra

$O(m\log m)$ 实现：

```cpp
vector<int> dijkstra(int s, int n) {
    vector<int> dis(n + 1, inf);
    priority_queue<node> q;
    q.push({s, 0});
    while (q.size()) {
        auto [now, cur] = q.top();
        q.pop();
        if (dis[now] != inf)
            continue;
        dis[now] = cur;
        for (auto [v, w] : p[now]) {
            if (dis[v] > dis[now] + w) {
                q.push({v, dis[now] + w});
            }
        }
    }
    return dis;
}
```

稠密图上，$O(n^2)$ 实现优于 $O(m\log m)$ 实现：

```cpp
vector<int> dijkstra(int s, int n) {
    vector<int> dis(n + 1, inf);
    vector<bool> vis(n + 1);
    dis[s] = 0;
    int mini = s;
    for (int _ = 1; _ <= n; _++) {
        int mini = 0;
        for (int i = 1; i <= n; i++) {
            if (dis[mini] > dis[i] && !vis[i]) {
                mini = i;
            }
        }
        for (auto [v, w] : p[mini]) {
            if (dis[v] > dis[mini] + w) {
                dis[v] = dis[mini] + w;
            }
        }
        vis[mini] = 1;
    }
    return dis;
}
```

## Bellman-Ford 

Bellman-Ford 基于松弛次数，特殊地，可以用来求解经过边数不超过某个数量的最短路。

```cpp
vector<int> bellman_ford(int s, int n) {
    vector<int> dis(n + 1, inf);
    dis[s] = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (dis[j] == inf)
                continue;
            for (auto [v, w] : p[j]) {
                dis[v] = min(dis[v], dis[j] + w);
            }
        }
    }
    return dis;
}
```

### spfa

队列实现 Bellman-Ford 剪枝，达到剪枝的效果。

可以证明随机图上效率优秀。

可以尝试赌出题人数据水，使用各种神秘 spfa 优化。

不难发现 spfa 时间复杂度不劣于 Bellman-Ford 

朴素实现：

```cpp
vector<int> spfa(int s, int n) {
    vector<int> dis(n + 1, inf);
    dis[s] = 0;
    queue<int> q;
    q.push(s);
    while (q.size()) {
        auto now = q.front();
        q.pop();
        for (auto [v, w] : p[now]) {
            if (dis[v] > dis[now] + w) {
                dis[v] = dis[now] + w;
                q.push(v);
            }
        }
    }
    return dis;
}
```

注：事实上使用 `vis` 标记松弛点是否在队列中（在就不再加入队列）也是一种 spfa 的神秘优化。

### 判负环

spfa 不劣于 Bellman-Ford 判负环，通常直接使用 spfa 判断。

Bellman-Ford 版：

```cpp
bool bellman_ford(int s, int n) {
    vector<int> dis(n + 1, inf);
    dis[s] = 0;
    for (int _ = 1; _ <= n; _++) {
        for (int i = 1; i <= n; i++) {
            for (auto [v, w] : p[i]) {
                if (dis[i] == inf)
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

spfa 版：

```cpp
bool spfa(int s, int n) {
    vector<int> dis(n + 1, inf), cnt(n + 1);
    dis[s] = 0;
    queue<int> q;
    q.push(s);
    while (q.size()) {
        auto now = q.front();
        q.pop();
        for (auto [v, w] : p[now]) {
            if (dis[v] > dis[now] + w) {
                dis[v] = dis[now] + w;
                cnt[v] = cnt[now] + 1;
                if (cnt[v] > n)
                    return 1;
                q.push(v);
            }
        }
    }
    return 0;
}
```

## Floyd

```cpp
for (int k = 1; k <= n; k++) {
    for (int i = 1; i <= n; i++) {
        dis[i][i] = 0;
        for (int j = 1; j <= n; j++) {
            dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);
        }
    }
}
```

Floyd 可用于求解传递闭包，即全源可达性。特别地，使用 `bitset` 优化，时间复杂度：$O(\frac{n^3}{w})$。

```cpp
for (int k = 1; k <= n; k++) {
    for (int i = 1; i <= n; i++) {
        if (dis[i][k])
            dis[i] |= dis[k];
    }
}
```

注：Floyd 常数极小，$O(n^3)$ 的时间复杂度可以通过 $n=1000$ 的数据。

## Johnson 全源最短路




## 不同最短路算法的比较

|最短路算法|Dijkstra|Bellman-Ford|Floyd|Johnson|
|--|---|---|---|---|
|图限制|非负权图|无|无|无|
|解对象|单源最短路|单源最短路|全源最短路|全源最短路|
|判负环|不能|能|能|能|
|时间复杂度|$O(n^2)/O(m\log m)$|$O(nm)$|$O(n^3)$|$O(nm\log m)$|

## 01 BFS

边权只有 0/1 的最短路问题，使用双端队列维护，若松弛时边权为 $0$，则将点加入队首，若松弛时边权为 $1$ 则将点加入队尾。

时间复杂度：$O(n)$。

## 差分约束

差分约束用于解决 $n$ 元一次不等式组问题，且要求 $n$ 元一次不等式是形如 $x_{a_i}\le x_{b_i}+c_i$。

根据最短路三角不等式 $dis_v\le dis_u+w$，建有向边 $(a_i,b_i,c_i)$，爬最短路，得到的最短路数组即为原 $n$ 元一次不等式的解。

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

注：实际问题中还需要题目对每一个数有最小限制：$x_i\le e_i$，否则可以无穷大。

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

下文均假设在不含零环的图上的单源最短路。

对于原图上的导出子图 $(u,v,w),dis_v=dis_u+w$，容易发现构成 DAG，这个导出子图称为最短路图。

特别地，若对于 $v$ 存在多个 $(u',v,w),dis_v=dis_{u'}+w$，仅保留其中任意一条，容易发现生成的图为一棵树，称之为最短路树。

从源点 $s$ 出发到 $t$ 的所有最短路和最短路图上 $s$ 和 $t$ 之间的路径一一对应。

因为最短路图是一个 DAG，那么可在最短路图上进行 dp 求解相关问题。

因为 Dijkstra 求解过程相当于建图过程，所以有时可以不显式建图，在 Dijkstra 的同时 dp 即可。