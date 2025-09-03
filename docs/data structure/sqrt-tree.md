<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Sqrt Tree</center></h1>


​Sqrt Tree 可以 $O(n\log\log n)$ 预处理，$O(1)$ 区间询问，支持 $O(\sqrt n)$ 单点修改。

但是采用 `vector` 实现常数貌似有点太大了，码量也很大，仅供参考。娱乐性大于实用性。

## 询问：

​考虑序列分块，将原序列分成 $\sqrt n$ 块，每块长 $\sqrt n$，每一块内维护前后缀，若询问区间不在同一块内，将首尾散块前后缀拼接，中间整块整取，时间复杂度 $O(\sqrt n)$，若再预处理 $B[i][j]$ 表示第 $i$ 块到第 $j$ 的区间和，预处理时间复杂度 $O(n)$。询问时中间的整块就可以 $O(1)$ 的得到结果，时间复杂度 $O(1)$。若询问区间在同一块内，无法表示，暴力维护时间复杂度：$O(\sqrt n)$。

​不妨将询问区间在同一块内的情况继续递归下去，若每次询问区间不在同一块内，都是 $O(1)$ 可以解决的，反之就递归下去，直到区间长度为 $1$，$O(1)$ 直接解决。

​因为每次递归分块长度都是 $\sqrt n$（$n$ 是当前序列长度），所以次递归序列长度都缩小至原来的 $\sqrt n$，递归 $O(\log\log n)$ 次后即会到 $1$，所以此时询问复杂度已降至 $O(\log\log n)$。空间复杂度也为 $O(n\log\log n)$。

​考虑将这个递归的过程建成一棵树，每个节点都有 $\sqrt n$ 个子节点（除了最后一块可能不足 $\sqrt n$）。

​那么递归的过程就是自下而上找到第一层存在完全包含于询问区间的块，这个过程可以二分，此时时间复杂度降至 $O(\log\log\log n)$。

​通过调整块长还可继续优化，假设每一层快长都为 $2$ 的整数幂次（自下而上递减）。令当前层块长为 $2^k$，询问区间为 $[l,r]$。考虑同一块内性质：若序列编号从 $0$ 开始，那么每一块的起点的末尾 $k$ 位均为 $0$，块长为 $2^k$ 块的终点某位 $k$ 位将被 $1$ 填满，块内包含了所有末尾 $k$ 位的变化。所以若 $l,r$ 只有末尾 $k$ 位不同，即 $l\oplus r<2^k$，则 $l,r$ 在这一层同一块内，所以要获取 $2^{k'}\le l\oplus r$，$k'=\lfloor\log_{l\oplus r}\rfloor$。对于预先设定的每层块长，预处理 $l\oplus r$ 的可能值即可单次 $O(1)$ 获取 $l,r$ 不在同一块内的层，即可 $O(1)$ 进行询问。

​关于块长 $k$ 的选定，要保证树高，不能任意选取。事实上可以发现，若 $k$ 每次只减小 $1$，那么树高为 $O(\log n)$，此时 Sqrt Tree 就是猫树。具体而言，先将原序列扩展至 $2$ 的整数幂长度后，第一次分块，块长选取 $2$ 的 $2$ 的整数幂次次（即 $2^{2^k}$）而后即可按 $\sqrt n$ 分块。树高 $O(\log\log n)$。最后一层的块长可以到 $2^1$，也可以到 $2^0$，但是都要特判特判等于块长的情况。（询问区间长度等于 $2^1$ 或 $2^0$ 直接做就行）。

​实际维护的时候，不用显式建树，只要维护若干层的分块即可。

```cpp
struct sqr_tree {
    int k;
    vector<vector<vector<int>>> B;
    vector<vector<int>> pre, suf;
    int id(int x) { return (x - 1) / (1 << k) + 1; }
    int l(int x) { return (1 << k) * (x - 1) + 1; }
    int r(int x) { return (1 << k) * x; }
    void init(int k, int n, vector<int> &a, bool w) {
        this->k = k;
        int idx = id(n);
        for (int i = 1; i <= idx; i++) {
            vector<int> temp;
            int l = this->l(i), r = this->r(i);
            for (int j = l; j <= r; j++) {
                if (temp.empty())
                    temp.push_back(a[j]);
                else
                    temp.push_back(max(a[j], temp.back()));
            }
            pre.push_back(temp);
            temp.clear();
            for (int j = r; j >= l; j--) {
                if (temp.empty())
                    temp.push_back(a[j]);
                else
                    temp.push_back(max(a[j], temp.back()));
            }
            suf.push_back(temp);
        }
        if (!w) {
            vector<vector<int>> tmp;
            for (int i = 1; i <= idx; i++) {
                vector<int> temp;
                for (int j = i; j <= idx; j++) {
                    if (temp.empty())
                        temp.push_back(pre[j - 1].back());
                    else
                        temp.push_back(max(pre[j - 1].back(), temp.back()));
                }
                tmp.push_back(temp);
            }
            B.push_back(tmp);
        } else {
            for (i = 1; i <= n; i += (1 << (k + k))) {
                int now = id(i), cur = id(i + (1 << (k + k)) - 1);
                vector<vector<int>> tmp;
                for (int j = now; j <= cur; j++) {
                    vector<int> temp;
                    for (int l = j; l <= cur; l++) {
                        if (temp.empty())
                            temp.push_back(pre[l - 1].back());
                        else
                            temp.push_back(max(pre[l - 1].back(), temp.back()));
                    }
                    tmp.push_back(temp);
                }
                B.push_back(tmp);
            }
        }
    }
    bool in(int l, int r) { return (l ^ r) < (1 << k); }
    int query(int l, int r, int w) {
        int res = 0;
        if (!w) {
            int s = id(l) + 1, t = id(r) - 1;
            if (s <= t)
                res = B[0][s - 1][t - s];
            s--, t++;
            res = max(res, suf[s - 1][this->r(s) - l]);
            res = max(res, pre[t - 1][r - this->l(t)]);
            return res;
        } else {
            int index = (l - 1) / (1 << (k + k));
            int s = id(l), t = id(r);
            res = max(res, suf[s - 1][this->r(s) - l]);
            res = max(res, pre[t - 1][r - this->l(t)]);
            s++, t--;
            if (s <= t) {
                s = (s - 1) % (1 << k) + 1;
                t = (t - 1) % (1 << k) + 1;
                res = max(res, B[index][s - 1][t - s]);
            }
            return res;
        }
    }
} tree[10];
```


可以发现，Sqrt Tree 维护信息的本质是首尾前后缀和中间整块信息预处理，和猫树是类似的。不难意识到：Sqrt Tree 在功能性上优于猫树优于 ST 表。但是常数上显然 Sqrt Tree 大于猫树大于 ST 表，所以就实际表现而言，Sqrt Tree 并不见得有多大优势。

​甚至 Sqrt Tree 在不影响预处理和询问的前提下，支持 $O(\sqrt n)$ 的单点修改。保持 $O(1)$ 询问时，$O(\sqrt n\log\log n)$ 的区间赋值；$O(\log\log n)$ 询问时，$O(\sqrt n)$ 的区间赋值。

## 修改：

​感觉有点复杂，主要是没啥用。暂时略了，真遇到了再说。