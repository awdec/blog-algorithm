<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>点分治</center></h1>

点分治用于解决树上路径问题。

## 点分治

树上的路径可以分为两部分：
- 经过重心
- 不经过重心

对于经过重心的路径，以重心为根，dfs 处理出所有路径信息，在重心处合并。

对于不经过重心的路径，递归子树处理。

每次以重心为根，子树的最大规模都会减半，递归 $O(\log n)$ 次后，子树大小就会降为 $1$。

时间复杂度：$O(n\log nT(n))$，其中 $T(n)$ 表示合并信息的时间复杂度。

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
void dfs2(int x, int y) { // 将 x 子树路径和已有信息合并，计算贡献
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

## 动态点分治（点分树）