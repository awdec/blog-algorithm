<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>线段树</center></h1>

## zkw 线段树

​普通线段树是一棵二叉树，zkw 线段树是一棵满二叉树，同样采用堆式建树。因为其满二叉树的性质，使得它能容易地获取叶子节点编号，也可以通过位运算简单地获取区间。具有代码短，常数小的优点。

​以维护加法为例。

### 建树：

​先根据序列长度确定叶子数，因为区间询问的要求，所以维护的序列要从第二个叶子开始，即叶子数要大于序列长度。再根据堆式建树父节点等于子节点编号除以 $2$ 下取整，按层 `push_up` 即可。

```cpp
void build(int m, vector<int> &a) {
    for (n = 1; n <= m; n <<= 1);
    for(int i = n + 1; i <= n + m; i++) tr[i].sum = a[i - n];
    for(int i = n - 1; i >= 1; i--){
        tr[i].sum = tr[i << 1].sum + tr[i << 1 | 1].sum;
    }
}
```

### 单点修改：

​从叶子层不断跳父节点即可。

```cpp
void update(int x, int v) {
    for (int cur = n + x; cur; cur >>= 1) tr[cur].sum += v;
}
```

### 区间修改：

​先将左右端点分别变为 $l-1,r+1$，不断判断：当前左端点是否是其父节点的左儿子，若是则更新其兄弟节点（即其父节点的右儿子）；当前右端点是否是其父节点的右儿子，若是则更新其兄弟节点的（即其父节点的左儿子）。更新完后左右端点同时跳向父节点，当左右端点互为兄弟节点时终止循环。

​因为 zkw 线段树是自下而上更新的，所以不能使用懒标记（无法下传）。所以只能使用标记永久化。

```cpp
void update(int l, int r, int v) {
    for (l = n + l - 1, r = n + r + 1; (l | 1) != r; l >>= 1, r >>= 1) {
        tr[l ^ 1].tag += (l & 1 ^ 1) * v;
        tr[r ^ 1].tag += (r & 1) * v;
    }
}
```

### 单点询问：

​	从叶子层不断跳父节点并加上标记即可。

```cpp
int query(int x) {
    int res = tr[n + x].sum;
    for (int cur = n + x; cur; cur >>= 1) res += tr[cur].tag;
    return res;
}
```

### 区间询问：

​和区间修改相同，将修改标记改为累计标记和区间答案即可。

```cpp
int query(int l, int r) {
    int res = 0;
    for (l = n + l - 1, r = n + r + 1; (l | 1) != r; l >>= 1, r >>= 1) {
        res += (l & 1 ^ 1) * tr[l ^ 1].sum + (r & 1) * tr[r ^ 1].sum;
    }
    return res;
}
```

## 猫树

名字由来似乎是首次在国内 OI 届引入此数据结构的选手的网名。

​猫树是序列树和 zkw 线段树的结合。猫树用于解决静态的区间询问问题，时空复杂度和 ST 表一致，均为预处理 $O(n\log n)$，区间询问 $O(1)$。

​对于 zkw 线段树的两个叶子节点 $l,r$，设它们的 LCA 为 $p$，设 $p$ 表示的区间为 $[L,R],mid=\lfloor\frac{L+R}{2}\rfloor$，则 $[l,mid] \lor[mid+1,r]=[l,mid]$，且 $l\ge L,r\le R$。因为 $p$ 既是 $l$ 的祖先，又是 $r$ 的祖先，所以 $p$ 包含 $[l,r]$。但是 $p$ 的左儿子不是 $r$ 的祖先，$p$ 的右儿子不是 $l$ 的祖先。所以 $p$ 的左儿子不包含 $r$，$p$ 的右儿子不包含 $l$。

​若线段树上每个节点都维护了表示区间的一个前缀序列和一个后缀序列，那么把 $[l,mid]$ 和 $[mid+1,r]$ 拼起来即为答案。前缀序列和后缀序列在建树的时候 `push_up` 维护即可，每个节点都储存了区间长度的数据，所以时空复杂度均为 $O(n\log n)$。

​对于 LCA，因为 zkw 是满二叉树，所以 $l,r$ 的 LCA 容易发现就是它们节点编号的二进制表达下的 Lcp（类似 01-Trie）。使用位运算容易得到 `LCA = l >> (log[l ^ r] + 1)`。

```cpp
int higbit(int num) {
	if (num == 0) return 0;
	return sizeof(num) * CHAR_BIT - 1 - __builtin_clz(num);
}
struct node {
    vector<int> pre, suf;
};
struct cat_segment {
    node tr[N << 1];
    int L[N << 1], R[N << 1], id[N];
    void push_up(int t) {
        int res = 0;
        for (auto u : tr[t << 1].pre) {
            res = max(res, u);
            tr[t].pre.push_back(res);
        }
        for (auto u : tr[t << 1 | 1].pre) {
            res = max(res, u);
            tr[t].pre.push_back(res);
        }
        res = 0;
        for (auto u : tr[t << 1 | 1].suf) {
            res = max(res, u);
            tr[t].suf.push_back(res);
        }
        for (auto u : tr[t << 1].suf) {
            res = max(res, u);
            tr[t].suf.push_back(res);
        }
    }
    void build(int t, int l, int r, vector<int> &a) {
        int mid = l + r >> 1;
        L[t] = l, R[t] = r;
        if (l == r) {
            id[l] = t;
            tr[t].pre = {a[l]};
            tr[t].suf = {a[l]};
            return;
        }
        build(t << 1, l, mid, a);
        build(t << 1 | 1, mid + 1, r, a);
        push_up(t);
    }
    int Lca(int x, int y) { return x >> (higbit(x ^ y) + 1); }
    int query(int l, int r) {
        if (l == r)
            return tr[id[l]].pre[0];
        int t = Lca(id[l], id[r]);
        auto &suf = tr[t << 1].suf;
        auto &pre = tr[t << 1 | 1].pre;
        int mid = L[t] + R[t] >> 1;
        int res1 = suf[mid - l], res2 = pre[r - (mid + 1)];
        return max(res1, res2);
    }
} tree;
```

​因为要同时维护前后缀，所以常数是 ST 表的两倍，且猫树要先将原序列补全成 $2$ 的整数幂长度，所以常数比 ST 表大不少。

​但是猫树比 ST 表功能更加强大，猫树能够维护不可并信息，ST 表只能维护可并信息。ST 表查询时，会将区间 $[l,r]$ 转换成可能相交的区间，可以维护最值这种区间交集重复考虑不影响结果的信息。若要维护不可并信息，ST 表要将区间拆分成 $O(\log n)$ 段，那就不是 $O(1)$ 的查询了。


## 李超线段树

​李超线段树只用于维护在一个集合中动态插入线段，询问 $x=x_i$ 的最大 $y$。因为功能的局限性，很多时候直接当成一个黑盒模型即可。

​李超树本质是一棵动态开点的线段树，类似标记永久化，其节点维护一条“主导线段” 表示定义域在节点对应区间 $[l,r]$ 中，该“主导线段”在 $mid$ 处的 $y$ 是最大的。

### 询问：

​李超树仅支持单点询问，将一路递归经过的标记合并起来即可（即用覆盖了 $x$ 的区间上的“主导线段”更新答案）。

​考虑“主导线段”有什么性质，对于另一条线段 $a$，若 $a$ 不在 $mid$ 处的 $y$ 大于“主导线段”（也就是 $a$ 是非主导线段）那么 $a$ 一定会要么在 $[mid+1,r]$ 上完全劣于“主导线段”，要么在 $[l,mid]$ 上完全劣于主导线段。若询问的 $x$ 在 $a$ 完全劣于的区间，那么显然 $a$ 不会成为答案；反之 $a$ 也会递归另一边区间，然后同理。所以若线段不是某一区间的“主导线段”那么它一定不会成为答案。

​询问只涉及完全覆盖 $x$ 的区间，时间复杂度：$O(\log n)$。

```cpp
int query(int p, int l, int r, int x) {
    if (!p)
        return 0;
    int mid = l + r >> 1, res;
    if (l == r)
        return tr[p].id;
    if (x <= mid)
        res = query(ls(p), l, mid, x);
    else
        res = query(rs(p), mid + 1, r, x);
    if (!res)
        res = tr[p].id;
    if (line[tr[p].id].val(x) > line[res].val(x))
        res = tr[p].id;
    else if (line[tr[p].id].val(x) == line[res].val(x) && tr[p].id < res)
        res = tr[p].id;
    return res;
}
```



### 插入：

​先把插入的线段的定义域拆分成线段树上的 $O(\log n)$ 个完整区间，对于每个完整区间，按前文中“主导线段”的性质递归插入即可。

​插入涉及到 $O(\log n)$ 个完整区间，每个区间又需要 $O(\log n)$ 递归更新“主导线段”，所以插入的时间复杂度是 $O(\log^2n)$。但是若插入的是直线，直线会覆盖整个定义域，也就是对应到线段树上只有一个区间，所以直线的插入时间复杂度是 $O(\log n)$ 的。

```cpp
void update(int &p, int l, int r, int id) {
    int mid = l + r >> 1;
    if (!tr[p].id) {
        if (!p)
            p = ++idx;
        tr[p].id = id;
        return;
    }
    if (line[id].val(mid) > line[tr[p].id].val(mid)) {
        swap(tr[p].id, id);
    }
    if (line[id].k < line[tr[p].id].k) {
        update(ls(p), l, mid, id);
    } else if (line[id].k > line[tr[p].id].k) {
        update(rs(p), mid + 1, r, id);
    }
}
void insert(int &p, int l, int r, int id) {
    int mid = l + r >> 1;
    if (!p)
        p = ++idx;
    if (line[id].l <= l && r <= line[id].r) {
        update(p, l, r, id);
        return;
    }
    if (line[id].l <= mid)
        insert(ls(p), l, mid, id);
    if (line[id].r > mid)
        insert(rs(p), mid + 1, r, id);
}
```

​因为李超树是动态开点线段树实现的，所以当维护线段定义域为实数时，要离散化。否则递归层数过多会导致空间爆炸。


### 另一种“主导线段定义”：

​另一种“主导线段”的定义，只有当 $a$ 在区间 $[l,r]$ 上完全优于当前“主导线段”，$a$ 才能替代当前“主导线段”。此时，直接更新当前“主导线段”，不用再递归。常数比上文写法更优。也就是说，若 $a$ 和当前“主导线段”有交，那么既要递归左儿子，也要递归右儿子，直到 $a$ 完全更劣、或成为“主导线段”。

```cpp
void update(int &p, int l, int r, int id) {
    int mid = l + r >> 1;
    if (!tr[p].id) {
        if (!p)
            p = ++idx;
        tr[p].id = id;
        return;
    }
    ldb now_l = line[id].val(l), now_r = line[id].val(r),
        pre_l = line[tr[p].id].val(l), pre_r = line[tr[p].id].val(r);
    if (now_l <= pre_l && now_r <= pre_r)
        return;
    if (now_l > pre_l && now_r > pre_r) {
        tr[p].id = id;
        return;
    }
    if (l == r)
        return;
    update(ls(p), l, mid, id), update(rs(p), mid + 1, r, id);
}
void insert(int &p, int l, int r, int id) {
    int mid = l + r >> 1;
    if (!p)
        p = ++idx;
    if (line[id].l <= l && r <= line[id].r) {
        update(p, l, r, id);
        return;
    }
    if (line[id].l <= mid)
        insert(ls(p), l, mid, id);
    if (line[id].r > mid)
        insert(rs(p), mid + 1, r, id);
}
```

## 可持久化线段树

### 动态开点线段树：

​因为是可持久化线段树的前置知识（严格需要），略提一下。

​一般线段树建树时，将所有区间都在节点上表示了出来。但是事实上，对于一个节点 $p$ 的区间 $[l,r]$，如果整个操作流程中都未涉及，那么这个节点及其所在的子树是否存在，是不会影响结果的正确性的。动态开点线段树应运而生。

​即：只有在访问到某个区间时，才创建对应的节点编号。如果只是将朴素线段树，以单点加、区间和为例替换成动态开点线段树，只需在函数体中，把节点编号改为引用，并把节点的左右儿子显式地存储在节点的结构体中，而不是沿用堆式建树的隐式儿子表示。当当前递归区间的节点不存在时，将其赋予新的编号即可。询问时若遇到空节点则表示没有内容，返回空即可。

```cpp
void update(int &p, int l, int r, int x, int v) {
    int mid = l + r >> 1;
    if (!p)
        p = ++idx;
    if (x <= l && r <= y) {
        tr[p].sum += v;
        return;
    }
    if (x <= mid)
        update(ls(p), l, mid, x, v);
    else
        update(rs(p), mid + 1, r, x, v);
    push_up(t);
}
int query(int p, int l, int r, int x, int y) {
    int mid = l + r >> 1, res = 0;
    if (!p)
        return 0;
    if (x <= l && r <= y) {
        return tr[p].sum;
    }
    if (x <= mid)
        res += query(ls(p), l, mid, x, y);
    if (y > mid)
        res += query(rs(p), mid + 1, r, x, y);
    return res;
}
```

​因为动态开点只涉及到需要的节点，所以可以支持维护序列长度很大的情况，每一次操作最多涉及线段树上 $O(\log n)$ 个节点。

​因为动态开点每次最劣会创建访问到的区间数量的节点数，所以动态开点的空间复杂度是 $O(m\log n)$ 的。不过如果是一般线段树中使用动态开点替换，那么不会每一次的节点都是未涉及过的，所以空间复杂度还会是和堆式建树一致为 $O(n)$。

### 标记永久化：

​因为是可持久化线段树的前置知识（不严格需要），略提一下。

​在做线段树区间修改的时候，因为线段树上被修改区间完全覆盖的节点区间过多，$O(n)$ 数量，所以不能对于所有涉及到的区间都进行修改。一个解决办法是只在修改区间在线段树上拆分出的 $O(\log n)$ 个区间上进行修改，后在询问经过被修改过的区间时，将所有修改累计起来即可。因为不用下传，所以常数比懒标记更小。同时，若是在动态开点线段树上进行，也可以涉及到更少的节点数，以节省更多的空间。

​标记永久化意味着不能下传，与懒标记相比，对于不能累计的标记，较难处理。

---


​可持久化数据结构意味可以维护历史版本，即第 $i$ 次操作的结果是建立在第 $i-1$ 次操作结果的基础上的。

​因为线段树是自上而下的数据结构，对于一个确定的子树，其维护的信息是确定的。所以若节点 $p$ 和节点 $q$ 的儿子维护信息相同，那么可以将它们的儿子节点设为同一个。所以，对于可持久化线段树，对于第 $i$ 次操作中，未被修改，也就是和第 $i-1$ 次操作信息一致的区间，用同一个节点表示即可。对于被修改的节点，可以创建一个旧版本的拷贝，再在这个新的节点上进行修改即可。

### 主席树：

可持久化权值（值域）线段树，一般被称作主席树。

```cpp
node tr[N << 5];
int idx, root[N];
void build(int &p, int l, int r, vector<int> &a) {
    int mid = l + r >> 1;
    if (!p)
        p = ++idx;
    if (l == r) {
        tr[p].v = a[l];
        return;
    }
    build(ls(p), l, mid, a);
    build(rs(p), mid + 1, r, a);
}
void update(int &p, int &q, int l, int r, int x, int v) {
    int mid = l + r >> 1;
    if (!q)
        q = ++idx;
    if (l == r) {
        tr[q].v = v;
        return;
    }
    if (x <= mid)
        rs(q) = rs(p), update(ls(p), ls(q), l, mid, x, v);
    else
        ls(q) = ls(p), update(rs(p), rs(q), mid + 1, r, x, v);
}
int query(int p, int l, int r, int x) {
    int mid = l + r >> 1;
    if (l == r)
        return tr[p].v;
    if (x <= mid)
        return query(ls(p), l, mid, x);
    return query(rs(p), mid + 1, r, x);
}
```

### 区间修改：

​若第 $i$ 次操作是在第 $i-1$ 次操作的基础上，进行区间修改，以区间加为例，那么在后续访问第 $i$ 次操作的版本时，若使用懒标记，且直接将节点上的懒标记 `push_down`，常数略大，容易爆空间。 使用标记永久化，会有更好的效果。

### Trick：

​若第 $i$ 个版本，不止进行一次操作。一个简单的解决办法就是，直接迭代操作次数个版本，然后记录下第 $i$ 个版本对应的最后一个版本是哪个。另一个解决办法先让 $root[i]=root[i-1]$，然后创建一个临时根，用这个临时根迭代 $root[i]$ 操作次数次即可（每一次迭代都用临时根替换 $root[i]$）。

## 吉司机线段树

​历史最值线段树，经典的“势能线段树”，暂略。

## 线段树合并

​线段树合并就是将两棵线段树上表示相同区间的信息合并起来，所以时间复杂度显然与节点数相关，所以线段树合并通常针对动态开点线段树，只合并需要用到的点。

​实现不难理解，对于合并 $tree_1,tree_2$，若当前 $tree_1,tree_2$ 其中一个左儿子不存在，另一个左儿子存在，那么直接将存在的那一个左儿子作为合并后的左儿子即可；若 $tree_1,tree_2$ 左儿子都存在，那么递归合并；若 $tree_1,tree_2$ 左儿子都不存在，不进行合并，结束递归。右儿子同理。容易发现，最终合并的节点都是叶子节点，然后通过 `push_up` 更新祖先节点即可。

​以区间和为例：

```cpp
int merge(int p, int q, int l, int r) {
    int mid = l + r >> 1;
    if (!p)
        return q;
    if (!q)
        return p;
    if (l == r) {
        tr[p].sum += tr[q].sum;
        return p;
    }
    ls(p) = merge(ls(p), ls(q), l, mid);
    rs(p) = merge(rs(p), rs(q), mid + 1, r);
    push_up(p);
    return p;
}
```

​线段树合并的总时间复杂度为 $O(n\log n)$。一个简单的说明：每次合并两棵线段树的时间复杂度是重合的节点数目（对于不重合的节点数量不会超过 $O(\log n)$）重合的点会删去其中一个，初始总共 $O(n\log n)$ 个节点，所以总时间复杂度不会超过所有节点的数量，即 $O(n\log n)$。

​线段树合并从应用角度而言，通常用于合并权值线段树，并且更多地应用在树上，用于合并子树信息。

## 线段树分裂

​线段树分裂是线段树合并的逆过程，但是有的信息是不可逆的（例如最值）。线段树分裂需要一个分裂参数，表示把大于这个参数的部分分裂到一棵线段树上，小于这个参数的部分保留在原线段树上。

​以权值线段树统计数字出现次数为例：保留前 $k$ 小的数字，将其余数字分裂到一棵新的线段树上。 

```cpp
void split(int p, int &q, int k) {
    if (!p)
        return;
    if (!q)
        q = ++idx;
    if (k > tr[ls(p)].sum)
        split(rs(p), rs(q), k - tr[ls(p)].sum);
    else
        swap(rs(p), rs(q));
    if (k < tr[ls(p)].sum)
        split(ls(p), ls(q), k);
    tr[q].sum = tr[p].sum - k;
    tr[p].sum = k;
    return;
}
```

​线段树分裂的时间复杂度容易发现是单次 $O(\log n)$ 的，因为只会向一侧递归。

## 线段树优化建图

​线段树优化建图用于将一个点和一个区间内的所有点连边的问题，例如将 $u$ 和 $i\in [l,r]$ 的所有 $i$ 连边，或将 $i\in [l,r]$ 的所有 $i$ 和 $u$ 连边，后求最短路。 若直接建边，边数是 $O(n^2)$ 的。

​根据任意一个区间 $[l,r]$ 在线段树上一定可以拆分成 $O(\log n)$ 个区间的性质。那么若用一个点代替一个区间，那么对于任意一个区间 $[l,r]$，都可以拆分成 $O(\log n)$ 个节点。

​若 $u$ 连向了 $[l,r]$，而最后需要求的还是单点的最短路。因为 $[l,r]$ 表示 $i\in [l,r]$ 的所有 $i$，所以 $[l,r]$ 代表的节点要连向 $i\in [l,r]$ 的所有 $i$，但是仍然不能直接连，所以所有节点在线段树上向儿子节点连权值为 $0$ 的边。

​若 $[l,r]$ 连向了 $u$，那么相当于 $i\in[l,r]$ 的所有 $i$ 连向了 $u$，和上文同理，线段树上所有点要向父节点连权值为 $0$ 的边。

​但是容易发现，这不能在同一棵线段树上进行。所以建两棵线段树，一棵向儿子节点连边，一棵向父亲节点连边。再在两棵线段树的叶子节点（也就是单个点）之间连权值为 $0$ 的边即可。

​以最短路为例：$u\xrightarrow{w} [l,r],\ u\xrightarrow{w}v,\ [l,r]\xrightarrow{w} u$，求 $s$ 为起点的最短路。

```cpp
struct segment {
    int idx;
    int id1[N], id2[N];
    void build1(int t, int l, int r) {
        idx = max(idx, t);
        int mid = l + r >> 1;
        if (l == r) {
            id1[l] = t;
            return;
        }
        add(t, t << 1, 0);
        add(t, t << 1 | 1, 0);
        build1(t << 1, l, mid);
        build1(t << 1 | 1, mid + 1, r);
    }
    void build2(int t, int l, int r) {
        int mid = l + r >> 1;
        if (l == r) {
            id2[l] = t + idx;
            return;
        }
        add((t << 1) + idx, t + idx, 0);
        add((t << 1 | 1) + idx, t + idx, 0);
        build2(t << 1, l, mid);
        build2(t << 1 | 1, mid + 1, r);
    }
    void link1(int t, int l, int r, int x, int y, int u, int w) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            add(id2[u], t, w);
            return;
        }
        if (x <= mid)
            link1(t << 1, l, mid, x, y, u, w);
        if (y > mid)
            link1(t << 1 | 1, mid + 1, r, x, y, u, w);
    }
    void link2(int t, int l, int r, int x, int y, int u, int w) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            add(t + idx, id1[u], w);
            return;
        }
        if (x <= mid)
            link2(t << 1, l, mid, x, y, u, w);
        if (y > mid)
            link2(t << 1 | 1, mid + 1, r, x, y, u, w);
    }
} tree;
signed main() {
    int n, q, s;
    cin >> n >> q >> s;
    tree.build1(1, 1, n);
    tree.build2(1, 1, n);
    int i;
    For(i, 1, n) add(tree.id1[i], tree.id2[i], 0),
        add(tree.id2[i], tree.id1[i], 0);
    while (q--) {
        int op;
        cin >> op;
        if (op == 1) {
            int u, v, w;
            cin >> u >> v >> w;
            add(tree.id1[u], tree.id1[v], w);
            add(tree.id2[u], tree.id2[v], w);
            add(tree.id1[u], tree.id2[v], w);
            add(tree.id2[u], tree.id2[v], w);
        }
        if (op == 2) {
            int u, l, r, w;
            cin >> u >> l >> r >> w;
            tree.link1(1, 1, n, l, r, u, w);
        }
        if (op == 3) {
            int u, l, r, w;
            cin >> u >> l >> r >> w;
            tree.link2(1, 1, n, l, r, u, w);
        }
    }
    return 0;
}
```

​线段树优化建图本质上只是一个建图的工具，结合到具体题目，还是需要一定的图论知识。

## 线段树分治

​线段树分治一定程度上类似线段树优化建图，本质还是利用线段树的性质：一个区间 $[l,r]$ 可以在线段树上被完整地拆分成 $O(\log n)$ 个节点。线段树分治往往应用于操作按时间点出现消失，即某一个操作只会在某一段连续时间内存在。

​对于这一段时间，可以拆分成 $O(\log n)$ 段线段树上的连续区间。对于整个操作时间轴，视作线段树的根节点。递归左子树表示处理 $[l,mid]$ 时间内的所有操作。

​把一段时间 $[l,r]$ 的操作放在 $O(\log n)$ 个节点上，当递归进入这个节点时，执行操作，当递归退出这个节点时，撤销操作（所以这里要求操作可以撤销，经典的不能撤销的操作：最值）。递归到叶子节点时，表示当前时间点之前的所有操作均已执行，进行询问处理即可。

​一个线段树分治的一个经典应用是和可撤销并查集的结合使用，用来维护点的连通性。

```cpp
struct sege {
    int n;
    vector<int> tr[N << 2];
    void update(int t, int l, int r, int x, int y, int id) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            tr[t].pb(id);
            return;
        }
        if (x <= mid)
            update(t << 1, l, mid, x, y, id);
        if (y > mid)
            update(t << 1 | 1, mid + 1, r, x, y, id);
    }
    void solve(int t, int l, int r) {
        int his = dsu.History();
        for (auto u : tr[t]) {
            dsu.merge(edge[u].x, edge[u].y, l, r);
        }
        if (l < r) {
            int mid = l + r >> 1;
            solve(t << 1, l, mid);
            solve(t << 1 | 1, mid + 1, r);
        }
        while (dsu.History() != his)
            dsu.roll(); // 可撤销并查集部分
    }
} tree;
```

## 线段树上二分

对于一个单调的区间询问，例如正权区间内第一个前缀和大于 $x$ 的位置。如果是一个 $[1,n]$ 上的全局询问，不难得到直接在线段树左右递归即可，时间复杂度 $O(\log n)$。一个经典应用是可持久化权值线段树（主席树）上求 k-th。

如果询问不是全局的，同样地，将询问区间拆分成线段树上的 $O(\log n)$ 个区间，答案一定落在某一个区间内。一个很 naive 的做法是，直接把这 $O(\log n)$ 个节点离线下来，然后扫一遍找到答案所在区间，然后对该节点进行一个和全局询问类似的子树递归即可。

时间复杂度：$O(\log n)$。