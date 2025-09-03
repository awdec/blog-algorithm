<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>莫队</center></h1>

## 普通莫队

​普通莫队是一个基于分块的离线解决静态区间询问问题的算法。

​设询问区间为 $[l_i,r_i]$。对原序列索引分块。将询问区间离线后以 $l_i$ 所在块的编号为第一关键字，$r_i$ 为第二关键字升序。

### 算法流程：

​对于每个询问 $[l_i,r_i]$ 的答案，由 $[l_1,r_1]$ 扩展而来，每次用 while 循环暴力移动 $l,r$ 指针。

​此时，升序后的 $[l_i,r_i]$，同一块内的 $l_i$ 对应的询问 $[l_i,r_i]$ 视作一个整体，共有 $\frac nt$ 个块。在一个块内的 $r$ 最多移动 $n$ 次（因为同一块内的 $r$ 升序，最多从 $1$ 移动到 $n$。在同一个块内 $l$ 每次扩展最多移动 $t$ 次。同时，从一个块的右端点询问的 $l$ 向下一个块的左端点的 $l$ 扩展时，$l$ 最多移动 $2t$，$r$ 最多移动 $n$。

### 时间复杂度分析：

​综上：处理完 $m$ 个询问，$l,r$ 指针的总移动次数为：$O(\frac{n^2}{t}+mt)$。

​当 $t=\frac{n}{\sqrt m}$ 时，时间复杂度最优为：$O(n\sqrt m)$。

​认为 $n,m$ 同阶，所以直接取 $\sqrt n$。

​上述只是考虑了指针移动次数。每次指针移动都要一次更新操作的时间复杂度。但是具体时间复杂度仍与修改的时间复杂度相关，上述时间复杂度为假设修改的时间复杂度为 $O(1)$ 时的最优。

### 优化：

​奇偶化排序：对奇数块内的询问的 $r$ 进行升序，对偶数块内的询问的 $r$ 进行降序。

​这是很自然的，因为按原本的排序方式，每次进入一个新块时，$r$ 都会从最大值降到最小值，再又升到最大值。这当然是不优的。

```c++
struct node {
    int l, r, id;
    bool operator<(const node &t) const {
        return (kind[l] ^ kind[t.l]) ? kind[l] < kind[t.l]
                                     : ((kind[l] & 1) ? r < t.r : r > t.r);
    }
};
void add(int x) {
    /*
    	将 a[x] 加入答案
    */
}
void del(int x) {
    /*
    	将 a[x] 删去
    */
}
void solve() {
    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B;
    sort(q + 1, q + 1 + m);
    int l = 1, r = 0;
    for (int i = 1; i <= m; i++) {
        while (q[i].l < l)
            add(--l);
        while (q[i].l > l)
            del(l++);
        while (q[i].r < r)
            del(r--);
        while (q[i].r > r)
            add(++r);
        /*
        	ans[q[i].id] = ...
        */
    }
}
```

## 带修莫队

### 	算法流程：

​带修莫队与普通莫队相比，多了一维时间轴表示每修改一次，时间增加 $1$。

​在修改时。

### 时间复杂度分析：

​认为序列大小 $n$，询问次数 $m$，修改次数 $t$ 同阶，块长取 $n^{\frac{3}{2}}$ 时，时间复杂度最优，为 $O(n^{\frac{5}{3}})$。

​但是具体时间复杂度仍与修改和查询答案的时间复杂度相关，上述时间复杂度为假设修改和查询答案的时间复杂度均为 $O(1)$ 时的最优。

```c++
struct node {
    int l, r, id, t;
    bool operator<(const node &x) const {
        if (kind[l] != kind[x.l])
            return kind[l] < kind[x.l];
        if (kind[r] != kind[x.r])
            return kind[r] < kind[x.r];
        return t < x.t;
    }
};
void add(int x) {
    /*
    	将 x 加入答案
    */
}
void del(int x) {
    /*
    	将 x 删去
    */
}
void solve() {
    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B;

    for (int i = 1; i <= m; i++) {
        {
            idx1++;
            q[idx1] = {l, r, idx1, idx2};
        }
        {
            c[++idx2] = {x, v};
        }
    }

    sort(q + 1, q + 1 + idx1);

    int l = 1, r = 0, t = 0;
    for (int i = 1; i <= idx1; i++) {
        while (q[i].l < l)
            add(a[--l]);
        while (q[i].l > l)
            del(a[l++]);
        while (q[i].r < r)
            del(a[r--]);
        while (q[i].r > r)
            add(a[++r]);
        while (t < q[i].t) {
            t++;
            int now = c[t].first;
            int cur = c[t].second;
            if (now >= l && now <= r) {
                del(a[now]);
                add(cur);
            }
            swap(a[now], c[t].second);
        }
        while (t > q[i].t) {
            int now = c[t].first;
            int cur = c[t].second;
            if (now >= l && now <= r) {
                del(a[now]);
                add(cur);
            }
            swap(a[now], c[t].second);
            t--;
        }
        /*
            ans[q[i].id] = ...;
        */
    }
}
```



## 回滚莫队

​回滚莫队用于 add 容易维护，del 不易维护的问题，可以将 del 操作转换成 add 操作。

### 算法流程：

​在普通莫队中，处理 $l_i$ 位于同一块内的询问时：

- 若 $r_i$ 也在 $l_i$ 的块内，询问区间长度 $\le t$，直接暴力处理。
- 若 $r_i$ 不在 $l_i$ 的块内，按 $r_i$ 升序 add，对于相同的 $r_i$ 的不同 $l_i$，因为 $l_i$ 在同一块内，所以直接重新从 $l_i$ 所在块的右边界 add 过去。

​这样实现时，不同块的 $l_i$ 的询问之间就独立了，进入下一个块时，要清空维护的信息。

### 时间复杂度分析：

​时间复杂度与普通莫队一致。

```c++
struct node {
    int l, r, id;
    bool operator<(const node &t) const {
        if (kind[l] != kind[t.l])
            return kind[l] < kind[t.l];
        return r < t.r;
    }
} q[N];
void add(int x) {
    /*
        将 a[x] 加入答案
    */
}
void del(int x) {
    /*
        将 a[x] 删去
    */
}
void solve() {

    for (int i = 1; i <= n; i++)
        kind[i] = (i - 1) / B;

    sort(q + 1, q + 1 + m);
    int i = 1, l, r;
    while (i <= m) {
        int j = i;
        while (j <= m && kind[q[i].l] == kind[q[j].l])
            j++;
        int right = min(n, (kind[q[i].l] + 1) * B);
        while (i < j && q[i].r <= right) {
            res = 0;
            for (int k = q[i].l; k <= q[i].r; k++)
                add(k);
            /*
			    ans[q[i].id] = ...;
			*/
            for (int k = q[i].l; k <= q[i].r; k++)
                del(k);
            i++;
        }
        res = 0, l = right + 1, r = right;
        while (i < j) {
            while (r < q[i].r)
                add(++r);
            long long last = res; // 记录旧的的答案
            while (l > q[i].l)
                add(--l);
            /*
			    ans[q[i].id] = ...;
			*/
            while (l < right + 1)
                del(l++);
            res = last; // 回滚
            i++;
        }
        /*
		    清空信息
		*/
    }
}
```



## 树上莫队

​树上莫队就是莫队上树，询问树上路径信息，因为莫队通过 add 和 del 维护信息，所以在括号序上跑莫队即可。括号序会通过一次 add 和一次 del 将树上两点的 LCA 的祖先信息去掉。

### 算法流程：

与其它莫队一致。

### 时间复杂度分析：

与其它莫队一致。

## 二次离线莫队