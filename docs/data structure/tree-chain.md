<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>树链剖分</center></h1>

## dfs 序

对一棵树 dfs 时，记录遍历的次序，即：时间戳 dfn。

### 性质：

> 子树在 dfs 序上是连续的一段。

因此可以将树上的子树问题转换成 dfs 序上的区间问题。

## 重链剖分

### 定义

- 重儿子：子树大小最大的儿子（如果有多个，选择任意一个）
- 重边：和重儿子相连的边
- 轻儿子：除重儿子外的所有儿子
- 轻边：除重边外的所有边
- 重链：由连续的重边形成的链

### 性质

> 树上两点间路径仅经过不超过 $O(\log n)$ 条重链

简单证明：每走一条轻边子树大小至少减小一半，那么从祖先走向后代最多走 $O(\log n)$ 条轻边。而经过的边，不是轻边就是重边，因为连续的重边是一段重链，所以重链的数量和轻边的数量相当，同样不超过 $O(\log n)$。两点路径本质上是两点 LCA 到两点的两段路径，所以树上两点间路径同样经过不超过 $O(\log n)$ 条重链。

dfs 时，优先遍历重儿子，可以保证重链中的节点 dfs 序连续，且由祖先向后代递增。

那么树上一条路径可以对应到 dfs 序上的 $O(\log n)$ 个区间。

注：钦定遍历顺序的 dfs 序仍然是 dfs 序，那么仍然满足子树的 dfs 序是连续的一段。所以重链剖分可以同时维护子树和路径。

```cpp
void dfs1(int x, int y) {
    dep[x] = dep[y] + 1, fa[x] = y, sz[x] = 1;
    son[x] = 0;
    for (auto v : p[x]) {
        if (v == y)
            continue;
        dfs1(v, x);
        sz[x] += sz[v];
        if (sz[son[x]] < sz[v])
            son[x] = v;
    }
}
void dfs2(int x, int y) {
    dfn[x] = ++idx, sec[idx] = a[x], top[x] = y;
    if (!son[x])
        return;
    dfs2(son[x], y);
    for (auto v : p[x]) {
        if (v == fa[x] || v == son[x])
            continue;
        dfs2(v, v);
    }
}
void get_path(int x, int y) {
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]])
            swap(x, y);
        /*
            dfn[top[x]] -> dfn[x] 表示当前重链
        */
        x = fa[top[x]];
    }
    if (dep[x] > dep[y])
        swap(x, y);
    /*
        dfn[x] -> dfn[y] 剩余部分
    */
}
```

## 长链剖分

### 定义

和重链剖分类似，修改重儿子的定义：子树中深度最深的节点的深度最大的儿子（如果有多个，选择任意一个）。

### 性质

> 树上任意两点间路径仅经过不超过 $O(\sqrt n)$ 条轻边

简单证明：若经过轻边 $(u,v)$，令 $u$ 的重链长度为 $L$，则 $v$ 的重链长度 $\le L-1$，因为 $1+2+\dots+L=\frac{L(L+1)}{2}\le n$ 所以 $L\le \sqrt n$，那么重链长度减小的次数不超过 $O(\sqrt n)$，经过轻边的数量也不超过 $O(\sqrt n)$。

> 对于树上两点 $x,y$ 若 $x$ 为 $y$ 的祖先，那么 $x$ 所在的重链长度 $\ge dep_y-dep_x$。 

简单证明：若 $dep_y-dep_x$ 超过 $x$ 所在重链长度，那么 $x,y$ 路径会成为新的重链的一部分。

### 应用

> 树上 k 级祖先

对于每条重链链顶节点，预处理向上/向下重链长度的信息，容易发现预处理的规模等于重链的总长度 $O(n)$。

预处理每个节点的 $2^i$ 级祖先，询问时先跳 $2^{\lfloor\log_2 k\rfloor}$ 级祖先，那么 $k-2^{\lfloor\log_2 k\rfloor}<2^{\lfloor\log_2 k\rfloor}$，直接调用链顶的不超过重链长度的预处理信息即可。

单次询问 $O(1)$。

```cpp
void dfs1(int x) {
    dep[x] = dep[f[x][0]] + 1;
    h[x] = dep[x];
    son[x] = 0;
    for (int i = 1; i < 19; i++)
        f[x][i] = f[f[x][i - 1]][i - 1];
    for (int i = d[x]; i < d[x + 1]; i++) {
        int u = g[i];
        dfs1(u);
        if (h[u] > h[son[x]])
            son[x] = u;
        h[x] = max(h[x], h[u]);
    }
}
void dfs2(int x, int y) {
    dfn[x] = ++idx;
    down[idx] = x;
    up[idx] = y;
    if (son[x]) {
        top[son[x]] = top[x];
        dfs2(son[x], f[y][0]);
    }
    for (int i = d[x]; i < d[x + 1]; i++) {
        int u = g[i];
        if (u == son[x])
            continue;
        top[u] = u;
        dfs2(u, u);
    }
}
int query(int x, int k) {
    if (!k)
        return x;
    int now = __lg(k) / __lg(2);
    x = f[x][now];
    k -= (1 << now) + dep[x] - dep[top[x]];
    x = top[x];
    if (k >= 0)
        return up[dfn[x] + k];
    return down[dfn[x] - k];
}
dfs1(root);
top[root] = root;
dfs2(root, root);
```


### 长链剖分优化 dp

长链剖分主题常用于优化状态和深度有关的 dp，此处略。

## “启发式”剖分

还有一些可以结合题目的“自定义”的剖分方式。

### ”猫猫虫“剖分

和重链剖分的区别仅在于修改节点的编号。

传统重链剖分直接按 dfs 序编号，”猫猫虫“剖分按以下顺序为节点编号：
- 递归重儿子
- 为所有轻儿子编号
- 递归轻儿子

（所以其实笔者私以为这个从剖分的角度就是重链剖分，其核心是维护节点的 编号，而非剖分）

其节点编号具有的性质如下：
- 一条重链，除了顶端节点编号可能不连续，其余节点编号连续
- 一棵子树，除了根节点编号可能不连续，其余节点编号连续
- 一个点的所有邻接点最多有三段连续区间，即父亲、重儿子、所有轻儿子

虽然和传统重链剖分略有差距，但是仍然可以维护传统重链剖分能维护的信息。还额外支持维护任一节点的所有儿子的信息。

时间复杂度分析和重链剖分一致。