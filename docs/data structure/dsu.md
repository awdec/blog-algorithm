<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>并查集</center></h1>

​并查集是一片森林，一般的并查集通过路径压缩/按秩合并实现，将两者结合的均摊时间复杂度为 $O(n\alpha(n))$ 可近似认为 $O(n)$（远比 $O(n\log n)$ 小）。

## 启发式合并

​一般实现的并查集，通过维护每个节点的父节点实现快速锁定根节点。但是这并不能在任一时刻正确维护所有节点所在树的根节点，即：无法 $O(1)$ 的判断连通性。

​考虑“真正意义上”的启发式合并，初始每个节点视作一个单独的集合，对每个节点维护一个根节点，每次合并两个节点 $u,v$ 时，把所在集合 $size$ 更小的那个节点所在的集合暴力地合并到另一个集合中去，并维护每个节点的根节点。做到了任一时刻，都维护了每个节点的根节点，所以只要 $O(1)$ 即可判断两个节点是否连通。不过路径压缩会压缩路径，所以无论什么情况下，路径压缩的总时间都不会超过 $O(n\log n)$（和询问次数不强相关）。所以启发式合并核心是能够在任一时刻都正确地维护每个节点的根节点。

​路径压缩是唯一在询问时也要进行修改的方式。

​启发式合并，总时间复杂度：$O(n\log n)$，但是常数过大，实测 $2\times 10^5$ 不能通过 2s。

```cpp
void init(int n) {
    for (int i = 1; i <= n; i++)
        root[i] = i, p[i].clear(), p[i].push_back(i);
}
bool same(int x, int y) { return root[x] == root[y]; }
void merge(int x, int y) {
    if (same(x, y))
        return;
    x = root[x], y = root[y];
    if (p[x].size() > p[x].size()) {
        swap(x, y);
    }
    vector<int> emp;
    for (auto u : p[x]) {
        root[u] = y;
        p[y].push_back(u);
    }
    p[x].swap(emp);
}
```

## 可撤销并查集

​因为路径压缩不止在合并时，在判断连通性时，也会改变树的形态，并且改变树的的形态是时间复杂度的保证，所以路径压缩不可撤销。与之相比，按秩合并的合并操作是可撤销的。因为按秩合并只需要在合并时把一棵树的根接到另一棵树上即可，在找根节点时，暴力跳父节点。

​因为撤销操作也是有顺序的，即按照合并的顺序逆序撤销，所以把合并操作放在栈中，每次撤销栈顶操作即可。合并撤销不影响子树结果，所以记录下是哪个节点接到哪个节点上即可（$u$ 成为 $v$ 的儿子节点）。

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

## 带权并查集

​带权并查集指在节点和父节点之间存在一条边权，并且此边权可以合并。对于 $x,fa[x],fa[fa[x]]$，若使用路径压缩，那么将 $x$ 接到 $fa[fa[x]]$ 儿子后，$x$ 和 $fa[fa[x]]$ 之间的边权要能通过 $x$ 和 $fa[x]$ 之间的边权和 $fa[x],fa[fa[x]]$ 之间的边权合并得到。

​在合并 $x$ 和 $y$ 时，因为是合并 $root[x]$ 和 $root[y]$，所以要得到 $root[x]$ 和 $root[y]$ 之间的边权。$x$ 和 $root[x]$、$y$ 和 $root[y]$ 之间的边权在路径压缩过程中维护，$x$ 和 $y$ 之间的边权由合并操作给出。按此可以得到 $root[x]$ 和 $root[y]$ 之间的边权，因为 $(x,y)$ 的边权确定后，对于 $x$ 而言，$(x,root[y])$ 的边权已经确定了，由 $(x,y)$ 和 $(y,root[y])$ 合并得到，所以再消去 $(x,root[x])$ 的边权即可得到 $(root[x],root[y])$ 的边权。

​将并查集儿子节点和父节点之间的边视作儿子指向父亲的有向边，带权并查集边权是受边的方向影响的，对于 $x\rightarrow y$ 和 $y\rightarrow x$，若 $x\rightarrow y$ 是加上边权，则 $y\rightarrow x$ 是减去边权。具体影响是按秩合并时的边权，因为路径压缩时，合并 $x,y$ 既可以把 $root[x]$ 接到 $root[y]$ 的儿子，也可以把 $root[y]$ 接到 $root[x]$ 的儿子。但是按秩合并根据树的大小，合并方向是确定的。

​本质上而言，带权并查集是维护了每个节点的点权，而点权由边权累计得到。

​以食物链为例：$A\rightarrow B,B\rightarrow C,C\rightarrow A$。

```cpp
void init(int n) {
    for (int i = 1; i <= n; i++)
        fa[i] = i, r[i] = 0;
}
int find(int x) {
    if (fa[x] == x)
        return x;
    int temp = fa[x];
    fa[x] = find(fa[x]);
    r[x] = (r[x] + r[temp]) % 3; // 维护边权
    return fa[x];
} // 采用路径压缩
bool same(int x, int y) {
    x = find(x), y = find(y);
    return x == y;
}
void merge(int x, int y, int w) {
    int fx = find(x), fy = find(y);
    r[fx] = (w + r[y] - r[x] + 3) % 3;
    fa[fx] = fy;
}
```

## 扩展域并查集

​也有说法叫“种类并查集”的。在带权并查集中，通过点权表示节点的“种类”，通过边权的累计维护点权。在扩展域并查集中，通过对于每个点不同身份都维护一个“分身”节点来实现身份之间的判断。

​同样以食物链为例：$A\rightarrow B,B\rightarrow C,C\rightarrow A$。对于一个节点 $x$，它会存在三种节点，$x$ 同类、$x$ 吃、吃 $x$。也就是把一个点拆成了三个点，为了方便，一般直接用 $x,x+n,x+2n$ 表示。

​判断 $x,y$ 的关系时，只要看 $x$ 是和 $y,y+n,y+2n$ 中的哪一个在同一个集合中即可（不用关心，$x+n,x+2n$ 因为若维护合并时是正确的，那么三种点都是正确的，选择其中之一即可）。

​合并 $x,y$ 时，根据合并的关系合并 $x,x+n,x+2n$ 和 $y,y+n,y+2n$ 即可。例如 $x$ 吃 $y$，那么就把 $(x,y+2n)$，$(x+n,y)$，$(x+2n,y+n)$ 合并。

​具体实现和朴素并查集一致，是合并和判断的节点有区别。

## 可持久化并查集

​支持历史版本的并查集。本质上就是把并查集的数组修改用单点修改、单点询问的可持久化线段树（可持久化数组）替代了。

​注意一点，路径压缩不支持可持久化。因为路径压缩是均摊时间复杂度，单次合并最坏是 $O(n)$ 的，可持久化的每一次修改会新建版本，若对于一个旧版本多次访问，时间复杂度就是单次 $O(n)$ 的，不能接受。

​使用按秩合并即可（而且按秩合并还只用修改两次数组）。

​时间复杂度：$O(n\log n)$。空间复杂度：$O(n\log n)$。

​不过同样的问题，在支持离线的情况下，可以用可撤销并查集做到线性空间。具体而言，就是需要访问历史版本时，把当前版本编号指向历史版本编号，那么每个版本都只会指向一个比它小的编号，那么建出来的一定是一棵树，在这个树上递归执行合并操作，递归退出时撤销即可。

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