<h1><center>点分治</center></h1>

点分治用于解决树上路径问题。

## 点分治

树上的路径可以分为两部分：
- 经过重心
- 不经过重心

对于经过重心的路径，以重心为根，dfs 处理出所有路径信息，在重心处合并。

对于不经过重心的路径，递归子树处理。

删除一个规模为 $s$ 的连通块的重心后，每个剩余连通块的大小都不超过 $s/2$，因此点分治的递归层数为 $O(\log n)$。

在同一递归深度，各连通块互不相交。求子树大小、寻找重心以及 DFS 收集路径信息时，这一层访问的节点总数为 $O(n)$；跨越全部递归层后，点分治结构本身的总扫描量为 $O(n\log n)$。

若每访问一个节点会产生 $O(1)$ 条待处理信息，并对题目所用数据结构执行一次代价为 $F(n)$ 的加入、查询或撤销操作，则总时间复杂度为 $O(n\log n\,F(n))$；当这些操作均为 $O(1)$ 时，就是 $O(n\log n)$。若某层采用排序、卷积等整批处理，应按每个连通块的批处理成本分别求和，不能用一个未定义的“总合并成本”笼统代替这部分分析。

:::details 点击展开代码
```cpp

int get_size(int x, int fa) {
    if (vis[x])
        return 0;
    int res = 1;
    for (auto u : p[x]) {
        if (u == fa)
            continue;
        res += get_size(u, x);
    }
    return res;
}
int get_wc(int x, int fa, int tot, int &wc) {
    if (vis[x])
        return 0;
    int sum = 1, maxs = 0, t;
    for (auto u : p[x]) {
        if (u == fa)
            continue;
        t = get_wc(u, x, tot, wc);
        maxs = max(maxs, t);
        sum += t;
    }
    maxs = max(maxs, tot - sum);
    if (maxs <= tot / 2)
        wc = x;
    return sum;
}

void dfs0(int x, int y) { // 添加 x 子树信息
    if (vis[x])
        return;

    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs0(u, x);
    }
}
void dfs1(int x, int y) { // 删除 x 子树信息
    if (vis[x])
        return;

    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs1(u, x);
    }
}
void dfs2(int x, int y) { // 将 x 子树路径和已有信息合并，计算贡献 & 计算子树中节点到重心这条路径的答案
    if (vis[x])
        return;

    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs2(u, x);
    }
}
void calc(int x) {
    if (vis[x])
        return;
    get_wc(x, 0, get_size(x, 0), x);
    vis[x] = 1;
    // 特殊讨论重心单点的答案
    for (auto u : p[x]) {
        dfs2(u, x);
        dfs0(u, x);
    }

    for (auto u : p[x]) {
        dfs1(u, x);
    }

    for (auto u : p[x])
        calc(u);
}
```
:::

## 动态点分治（点分树）

考虑强制在线地询问一个点作为端点的路径信息。

若每一次都做一遍点分治，发现分治过程中递归的重心是相同的。

那么把递归层更深的重心视作当前递归层重心的儿子，形成的树，即为点分树。

而每一个点作为端点合并路径，只会在其在点分树上的祖先处合并，点分治递归层数为 $O(\log n)$，那么同样地，点分树的树高也为 $O(\log n)$。

结合具体题目，维护点分树上每个点的子树信息即可。

:::details 点击展开代码
```cpp
int get_size(int x, int fa) {
    if (vis[x])
        return 0;
    int res = 1;
    for (auto u : p[x]) {
        if (u == fa)
            continue;
        res += get_size(u, x);
    }
    return res;
}
int get_wc(int x, int fa, int tot, int &wc) {
    if (vis[x])
        return 0;
    int sum = 1, maxs = 0, t;
    for (auto u : p[x]) {
        if (u == fa)
            continue;
        t = get_wc(u, x, tot, wc);
        maxs = max(maxs, t);
        sum += t;
    }
    maxs = max(maxs, tot - sum);
    if (maxs <= tot / 2)
        wc = x;
    return sum;
}

int fa[N];

void calc(int x, int y) { // 只需要保留重心递归部分
    if (vis[x])
        return;
    get_wc(x, 0, get_size(x, 0), x);
    fa[x] = y;
    vis[x] = 1;
    for (auto u : p[x])
        calc(u, x);
}
```
:::
