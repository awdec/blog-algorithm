<h1><center>并查集</center></h1>

​并查集是一片森林，一般的并查集通过路径压缩/按秩合并实现，将两者结合的均摊时间复杂度为 $O(n\alpha(n))$ 可近似认为 $O(n)$（远比 $O(n\log n)$ 小）。

## 启发式合并

​一般实现的并查集，通过维护每个节点的父节点实现快速锁定根节点。但是这并不能在任一时刻正确维护所有节点所在树的根节点，即：无法 $O(1)$ 的判断连通性。

​考虑“真正意义上”的启发式合并，初始每个节点视作一个单独的集合，对每个节点维护一个根节点，每次合并两个节点 $u,v$ 时，把所在集合 $size$ 更小的那个节点所在的集合暴力地合并到另一个集合中去，并维护每个节点的根节点。做到了任一时刻，都维护了每个节点的根节点，所以只要 $O(1)$ 即可判断两个节点是否连通，能够在任一时刻都正确地维护每个节点的根节点。

因为最终只会合并成一个集合，总均摊时间复杂度 $O(n\log n)$（和询问次数不强相关）。

常数相对较大。

采用链式前向星可适当减小常数。

::: details 点击展开代码
```cpp
struct DSU
{
    int root[N];
    list<int> p[N];
    void init(int n)
    {
        for (int i = 1; i <= n; i++)
            root[i] = i, p[i].clear(), p[i].emplace_back(i);
    }
    bool same(int x, int y) { return root[x] == root[y]; }
    void merge(int x, int y)
    {
        if (same(x, y))
            return;
        x = root[x], y = root[y];
        if (p[x].size() > p[y].size())
        {
            swap(x, y);
        }
        for (auto u : p[x])
        {
            root[u] = y;
            p[y].push_back(u);
        }
        p[x].clear();
    }
} dsu;
```
:::

## 可撤销并查集

​因为路径压缩不止在合并时，在判断连通性时，也会改变树的形态，并且改变树的的形态是时间复杂度的保证，所以路径压缩不可撤销。与之相比，按秩合并的合并操作是可撤销的。因为按秩合并只需要在合并时把一棵树的根接到另一棵树上即可，在找根节点时，暴力跳父节点。

​因为撤销操作也是有顺序的，即按照合并的顺序逆序撤销，所以把合并操作放在栈中，每次撤销栈顶操作即可。合并撤销不影响子树结果，所以记录下是哪个节点接到哪个节点上即可（$u$ 成为 $v$ 的儿子节点）。

::: details 点击展开代码
```cpp
void init(int n) {
    for (int i = 1; i <= n; i++)
        fa[i] = i, sz[i] = 1;
    while (history.size())
        history.pop();
}
int find(int x) {
    while (x != fa[x])
        x = fa[x];
    return x;
}
bool same(int u, int v) { return find(u) == find(v); }
void merge(int u, int v) {
    if (same(u, v)) {
        history.push(-1);
        return;
    }
    u = find(u), v = find(v);
    if (sz[u] < sz[v])
        swap(u, v);
    history.push(v);
    sz[u] += sz[v];
    fa[v] = u;
}
int History() { return history.size(); }
void roll() {
    if (history.empty())
        return;
    auto t = history.top();
    history.pop();
    if (t == -1)
        return;
    sz[fa[t]] -= sz[t];
    fa[t] = t;
}
```
:::

## 带权并查集

​带权并查集维护节点到父节点的相对关系。以模 $3$ 的食物链为例，设每个节点具有势值 $P[x]$，以下统一规定

$$
weight[x]=(P[x]-P[fa[x]])\bmod 3,
$$

即 `weight[x]` 表示从儿子 $x$ 指向父亲 $fa[x]$ 的关系，根节点的 `weight` 恒为 $0$。取值 $0,1,2$ 分别表示同类、前者吃后者、前者被后者吃。反向关系需要取相反数并对 $3$ 取模。

​路径压缩前，若 $x$ 的父亲为 $p$，则 $x$ 到根的关系是 $x$ 到 $p$ 与 $p$ 到根的关系之和。因此压缩后有

$$
weight[x]\leftarrow weight[x]+weight[p]\pmod 3.
$$

​约定 `merge(x, y, w)` 加入限制 $(P[x]-P[y])\bmod 3=w$。执行 `find` 后，记 $fx,fy$ 分别为 $x,y$ 的根，此时 `weight[x]` 和 `weight[y]` 已经分别表示 $x\rightarrow fx$、$y\rightarrow fy$ 的关系。若把 $fx$ 接到 $fy$，则

$$
weight[fx]=w-weight[x]+weight[y]\pmod 3.
$$

​若按集合大小需要反向连接，把 $fy$ 接到 $fx$，边的方向也要反转，因此

$$
weight[fy]=-weight[fx]=-w+weight[x]-weight[y]\pmod 3.
$$

​当 $fx=fy$ 时不能再连接根节点，而应检查已有关系是否满足 `weight[x] - weight[y] == w (mod 3)`；不满足说明新限制与已有信息矛盾。下面的 `merge` 以返回值表示限制是否一致，并使用按大小合并控制树高。

::: details 点击展开代码
```cpp
int normalize(int value) {
    value %= 3;
    return value < 0 ? value + 3 : value;
}

void init(int n) {
    for (int i = 1; i <= n; i++)
        fa[i] = i, sz[i] = 1, weight[i] = 0;
}

int find(int x) {
    if (fa[x] == x)
        return x;

    int parent = fa[x];
    fa[x] = find(parent);
    weight[x] = normalize(weight[x] + weight[parent]);
    return fa[x];
}

bool same(int x, int y) {
    return find(x) == find(y);
}

// 返回 false 表示新限制与已有关系矛盾。
bool merge(int x, int y, int w) {
    int fx = find(x);
    int fy = find(y);
    w = normalize(w);

    if (fx == fy)
        return normalize(weight[x] - weight[y]) == w;

    // 若连接 fx -> fy，这条边应具有的权值。
    int fx_to_fy = normalize(w - weight[x] + weight[y]);

    if (sz[fx] <= sz[fy]) {
        fa[fx] = fy;
        weight[fx] = fx_to_fy;
        sz[fy] += sz[fx];
    } else {
        fa[fy] = fx;
        weight[fy] = normalize(-fx_to_fy);
        sz[fx] += sz[fy];
    }
    return true;
}
```
:::

​在路径压缩和按大小合并下，$q$ 次合并或查询的总时间复杂度为 $O((n+q)\alpha(n))$，空间复杂度为 $O(n)$。

## 扩展域并查集

​也有说法叫“种类并查集”的。在带权并查集中，通过点权表示节点的“种类”，通过边权的累计维护点权。在扩展域并查集中，通过对于每个点不同身份都维护一个“分身”节点来实现身份之间的判断。

​同样以食物链为例：$A\rightarrow B,B\rightarrow C,C\rightarrow A$。对于一个节点 $x$，它会存在三种节点，$x$ 同类、$x$ 吃、吃 $x$。也就是把一个点拆成了三个点，为了方便，一般直接用 $x,x+n,x+2n$ 表示。

​判断 $x,y$ 的关系时，只要看 $x$ 是和 $y,y+n,y+2n$ 中的哪一个在同一个集合中即可（不用关心，$x+n,x+2n$ 因为若维护合并时是正确的，那么三种点都是正确的，选择其中之一即可）。

​合并 $x,y$ 时，根据合并的关系合并 $x,x+n,x+2n$ 和 $y,y+n,y+2n$ 即可。例如 $x$ 吃 $y$，那么就把 $(x,y+2n)$，$(x+n,y)$，$(x+2n,y+n)$ 合并。

​具体实现和朴素并查集一致，是合并和判断的节点有区别。

## 可持久化并查集

​支持历史版本的并查集。本质上就是把并查集的数组修改用单点修改、单点询问的可持久化线段树（可持久化数组）替代了。

​这里不使用路径压缩：一次 `find` 可能修改路径上的多个父指针，持久化每个修改都要产生新的线段树节点，而且反复访问旧版本时不能沿用通常的均摊分析。改用按大小合并后，并查集树高为 $O(\log n)$，`find` 只读取父指针，不改变历史版本。

​设并查集有 $n$ 个节点，共产生 $q$ 次版本操作。可持久化线段树单次读取或修改父亲、集合大小的时间均为 $O(\log n)$；`find` 最多经过 $O(\log n)$ 个父节点，因此单次 `find`、连通性查询或合并通常为 $O(\log^2 n)$。复制一个历史版本只需复制两棵线段树的根指针，为 $O(1)$。

​初始建树为 $O(n)$，全部操作的时间复杂度为 $O(n+q\log^2 n)$。若其中有 $u$ 次操作实际修改了并查集，则空间复杂度更精确地写作 $O(n+u\log n+q)$；由于 $u\le q$，可简写为 $O(n+q\log n)$。

​不过同样的问题，在支持离线的情况下，可以用可撤销并查集做到线性空间。具体而言，就是需要访问历史版本时，把当前版本编号指向历史版本编号，那么每个版本都只会指向一个比它小的编号，那么建出来的一定是一棵树，在这个树上递归执行合并操作，递归退出时撤销即可。


::: details 点击展开代码
```cpp
p_tree fa, sz; // 使用可持久化化线段树维护
int n;
void init(int n) {
    this->n = n;
    vector<int> a(n + 1), b(n + 1);
    for(int i = 1; i <= n; i++) a[i] = i, b[i] = 1;
    fa.build(fa.root[0], 1, n, a);
    sz.build(sz.root[0], 1, n, b);
}
int find(int k, int x) {
    int fa;
    while ((fa = this->fa.query(this->fa.root[k], 1, n, x)) != x){
        x = fa;
    }
    return fa;
}
bool same(int k, int x, int y) { return find(k, x) == find(k, y); }
void merge(int p, int q, int x, int y) {
    if (same(p, x, y)) {
        copy(q, p);
        return;
    }
    x = find(p, x), y = find(p, y);
    int sz_x = sz.query(sz.root[p], 1, n, x),
        sz_y = sz.query(sz.root[p], 1, n, y);
    if (sz_x > sz_y) {
        swap(x, y);
        swap(sz_x, sz_y);
    }
    fa.update(fa.root[p], fa.root[q], 1, n, x, y);
    sz.update(sz.root[p], sz.root[q], 1, n, y, sz_x + sz_y);
}
void copy(int now, int cur) {
    fa.root[now] = fa.root[cur];
    sz.root[now] = sz.root[cur];
}
```
:::

## 赋值并查集

维护把集合中所有 $x$ 修改成 $y$，查询初始 $x$ 当前是什么值。

设预处理值域为 $[1,V]$，初始序列长度为 $n$，修改与查询合计 $q$ 次。这里的 $V$ 必须覆盖初始值和所有操作中可能出现的值；若值域很大，可以先对这 $n+q$ 个值离散化，此时 $V=O(n+q)$。

初始化并查集数组并扫描初始序列需要 $O(V+n)$ 时间。按大小合并并使用路径压缩后，每次修改或查询的均摊时间为 $O(\alpha(V))$，总时间复杂度为 $O(V+n+q\alpha(V))$；并查集本身的空间复杂度为 $O(V)$，若还保留初始序列则为 $O(V+n)$。

:::details 点击展开代码
```cpp
struct merge_dsu
{
    int fa[N], sz[N], val[N], belong[N];
    bool exist[N];
    void init(int value_limit)
    {
        for (int i = 1; i <= value_limit; i++)
        {
            fa[i] = i;
            sz[i] = 1;
            val[i] = i;
        }
    }
    void init(vector<int> &a)
    {
        for (auto u : a)
        {
            exist[u] = 1;
            belong[u] = u;
        }
    }
    int find(int x)
    {
        return fa[x] == x ? x : fa[x] = find(fa[x]);
    }
    int query(int initial_value)
    {
        return val[find(initial_value)];
    }
    int merge(int x, int y, int z)
    {
        x = find(x), y = find(y);
        if (sz[x] > sz[y])
            swap(x, y);
        fa[x] = y;
        sz[y] += sz[x];
        val[y] = z;
        return y;
    }
    void modify(int x, int y)
    {
        if (x == y)
            return;
        if (!belong[x])
            return;
        int rx = find(belong[x]);
        if (!belong[y])
        {
            belong[y] = rx;
            belong[x] = 0;
            val[rx] = y;
        }
        else
        {
            int ry = find(belong[y]);
            int root = merge(rx, ry, y);
            belong[y] = root;
            belong[x] = 0;
        }
    }
};
```
:::

## 倍增并查集

倍增并查集用于专门解决区间等价问题。

形如存在若干个限制 $a_x=a_y,x\in[l_1,r_1],y\in[l_2,r_2],r_1-l_1=r_2-l_2$。

最后维护出所有等价类。

具体而言，令区间长度为 $L=r_1-l_1+1$，取 $k=\lfloor\log_2 L\rfloor$。将两个区间的限制拆成前缀块 $[l_1,l_1+2^k-1]$、$[l_2,l_2+2^k-1]$ 和后缀块 $[r_1-2^k+1,r_1]$、$[r_2-2^k+1,r_2]$，每条限制只需在第 $k$ 层执行至多两次合并。

对每个 $0\le k\le\lfloor\log_2 n\rfloor$，维护所有合法起点 $1\le x\le n-2^k+1$。第 $k$ 层的并查集节点 $(k,x)$ 表示从 $x$ 开始、长度为 $2^k$ 的区间。

处理完 $q$ 条区间等价限制后，从高层向低层传递等价关系，直到第 $0$ 层得到单点的等价类。所有层共有

$$
\sum_{k=0}^{\lfloor\log_2 n\rfloor}(n-2^k+1)=O(n\log n)
$$

个合法区间节点，向下传递共执行 $O(n\log n)$ 次并查集合并。

令 $M=O(n\log n)$ 为所有层的节点数。使用普通并查集时，总时间复杂度为

$$
O((n\log n+q)\alpha(M)).
$$

保留全部层需要 $O(n\log n)$ 空间。若将 $q$ 条限制按层离线分组，并从高层向低层处理，则并查集只需保留相邻两层，工作空间为 $O(n)$；计入尚未处理的限制后，总空间为 $O(n+q)$。

使用普通并查集维护即可。
