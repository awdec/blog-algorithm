<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>动态树</center></h1>


​动态树是用于解决“动态”树上问题的数据结构，即维护森林。常见的动态树有三种：Link-Cut-Tree，Euler Tour Tree，Top Tree。

​其中：

- Link-Cut-Tree 用于解决路径问题。
- Euler-Tour-Tree 用于解决子树问题。
- Top-Tree 用于解决路径、子树问题。

​由于 ETT 和 Top-Tree 的编码难度，一般仅使用 LCT。

## Link-Cut-Tree

​简单来说，LCT 就是用序列 Splay 维护树链，与树链剖分不同，因为 LCT 支持修改树形态，所以是任意链剖分，不是轻重链剖分。

​将一条链视作一个序列，将链上节点的深度作为 Splay 的 Key。

​一般而言，将每一条链的 Splay 视作一个节点后，形成的 LCT 视作结构树，Splay 视作节点树。

​LCT 在维护图上，和并查集类似，维护的是森林，不能维护无向图。

### access(x)：

​access 是 LCT 的核心操作，其直接目的是构造一条从 $x$ 到当前 LCT $root$ 的链，其中 $x$ 是链上深度最深的节点。

​对于当前 $x$ 所在的 Splay，将 $x$ 转到根后，右子树是链上深度比 $x$ 大的节点，按照 Access 的定义，应把右子树从 $x$ 上断开。而后，把 $x$ 在 LCT 上的父节点 $y$，在其所在的 Splay 中转到根，把 $x$ 替换 $y$ 的右儿子即可。以此迭代，直到 LCT 的根节点。

```cpp
int access(int x) {
    int y = 0, z = x;
    for (; x; y = x, x = tree.tr[x].fa) {
        tree.splay(x);
        tree.rs(x) = y;
        tree.push_up(x);
    }
    tree.splay(z);
    return y;
}
```

### isroot(x)：

​LCT 节点树的 Splay 与常规 Splay 略有区别，因为 LCT 有多棵 Splay，所以将节点转到 Splay 根时，是转到其所在节点树的根。但是节点树 Splay 内根节点要储存在结构树上的父节点。所以节点树 Splay 还需要一个判断是否是节点树根的函数。

```cpp
bool isroot(int p) {
    return ls(tr[p].fa) != p && rs(tr[p].fa) != p;
}
```

### make_root(x)：

​make_root 是将 $x$ 作为 LCT 的根。一个作用是，维护 $(x,y)$ 的路径信息时，先将 $x$ 作为根，后 `access(y)` 打通 $(x,y)$ 的路径，就形成了一条以 $x,y$ 为两端点的链。

​具体实现，只要 `access(x)`，此时 $x$ 是到 LCT $root$ 链上的另一个端点，对其所在 Splay 做全局翻转操作即可把 $x$ 变成 LCT root。

```cpp
void make_root(int x) {
    access(x);
    tree.rev(x);
}
```

​LCT 核心操作，只有上述 `access(x)` 和 `make_root(x)` 两个，还有一些扩展操作。

### find_root(x):

​LCT 是一片森林，find_root 是找到 $x$ 所在树的根。具体而言，`access(x)` 后，$root$ 是深度最小的节点，也就是 Splay 中左链的端点，一直在 Splay 上向左儿子走即可。

```cpp
int find_root(int x) {
    access(x);
    while (tree.ls(x)) tree.push_down(x), x = tree.ls(x);
    tree.splay(x);
    return x;
}
```

### split(x,y):

​split 就是前文中提到的，将 $(x,y)$ 路径构造到一条链上，$x,y$ 是链的两端点。

```cpp
void split(int x, int y) {
    make_root(x);
    access(y);
}
```

### link(x,y):

​将森林的两棵树连接起来，若保证 $(x,y)$ 之间没有边，将 $x,y$ 分别 make_root，后将其中之一作为另一节点的父节点即可。

```cpp
void link(int x, int y) {
    make_root(x);
    tree.tr[x].fa = y;
}
```

​若不保证 $(x,y)$ 之间没有边，需要先判断是否有边，或者对两者均作 make_root，用后 make_root 的节点作为另一节点的父节点，可以避免特判。但若是存在 $x,y$ 连通但 $(x,y)$ 无边，不能这么写。

```cpp
void link(int x, int y) {
	make_root(x);
	make_root(y);
	tree.tr[x].fa = y;
}
```

### cut(x,y):

​将连接 $(x,y)$ 的边断开，若保证 $(x,y)$ 之间存在边，那么先 `make_root(x)`，再 `access(y)`，因为 $x,y$ 直接相连，所以直接将 $y$ 从 $x$ 的右儿子断开即可。

```cpp
void cut(int x, int y){
    make_root(x);
    access(y);
    tree.ls(y) = tree.tr[x].fa = 0;
}
```

​若不保证 $(x,y)$ 之间存在边，可以先在操作前判断 $x,y$ 的结构树的根是否相同再操作。也可以在 cut 内判断，如下：

```cpp
void cut(int x, int y) {
    make_root(x);
    if (find_root(y) == x && tree.tr[y].fa == x && !tree.ls(y)) {
        tree.rs(x) = tree.tr[y].fa = 0;
    }
}
```

​注意以上两者的区别。Splay 每次操作一个节点后，都要将其转到根，会影响节点树上的父子关系。

### LCT 中的 Splay:

如下：

```cpp
struct node {
    int s[2];
    int v, fa;
    int sum, rev;
};
struct Splay {
    node tr[N];
    vector<int> q;
    void init(int n, vector<int> &a) { // 每个节点作为孤立点初始化
        for (int i = 1; i <= n; i++) {
            tree.tr[i].sum = tree.tr[i].v = tree.tr[i].sz = 1;
        }
    }
    void rev(int p) {
        swap(ls(p), rs(p));
        tr[p].rev ^= 1;
    }
    void push_up(int p) { // 以具体 push_up 维护信息为准
        tr[p].sum = (tr[ls(p)].sum ^ tr[rs(p)].sum ^ tr[p].v);
    }
    void push_down(int p) {
        if (tr[p].rev) {
            rev(ls(p)), rev(rs(p));
            tr[p].rev = 0;
        }
    }
    bool isroot(int p) { return ls(tr[p].fa) != p && rs(tr[p].fa) != p; }
    void rorate(int x) {
        int y = tr[x].fa, z = tr[y].fa;
        bool w = (rs(y) == x);
        if (!isroot(y))
            tr[z].s[rs(z) == y] = x;
        tr[x].fa = z;
        tr[y].s[w] = tr[x].s[w ^ 1], tr[tr[x].s[w ^ 1]].fa = y;
        tr[x].s[w ^ 1] = y, tr[y].fa = x;
        push_up(y), push_up(x);
    }
    void splay(int x) {
        int r = x;
        q.clear();
        q.push_back(r);
        while (!isroot(r)) {
            q.push_back(tr[r].fa);
            r = tr[r].fa;
        }
        int len = q.size();
        len--;
        while (len >= 0)
            push_down(q[len--]);
        while (!isroot(x)) {
            int y = tr[x].fa, z = tr[y].fa;
            if (!isroot(y)) {
                if ((rs(y) == x) ^ (rs(z) == y))
                    rorate(x);
                else
                    rorate(y);
            }
            rorate(x);
        }
    }
};
```

### LCT 的替代品：

​在允许离线的情况下，LCT 有许多替代品。

#### 树链剖分：

​因为动态树维护的是森林，所以在操作结束后，若建立一个虚根把所有树接到这个虚根上，那么会形成一棵树。

​若操作过程中只涉及加边，而不涉及删边（也就是对于最后的树而言，树的形态是确定的），那么对于询问中的路径问题，可以转化成离线后的树上路径问题，使用树链剖分（或根据实际询问内容，选择合适的方式维护即可）维护即可。

​但是时间复杂度是 $O(n\log^2n)$ 的，不过树剖小常数 $O(\log^2n)$ 多数情况下不比 LCT 的 $O(\log n)$ 劣。

#### 线段树分治+可撤销并查集：

​若询问内容和连通性有关，或是并查集能够维护的子树信息。那么可以将操作过程中，对某一条边的 link,cut 视作在操作序列时间轴上的一段存在后消失的边。使用线段树分治+可撤销并查集维护即可。

​但是时间复杂度是 $O(n\log^2n)$ 的，并且这里的常数并不小。

## 全局平衡二叉树

​感觉主要用于处理动态 DP 问题，数据结构上不是很有不可替代性，暂略。