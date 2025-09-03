<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>SA</center></h1>

即：后缀数组。

​SA 和 SAM 相似，用于识别子串。

SA 将子串表示成某个后缀的前缀，SAN 则是将子串表示成某个前缀的后缀。

​后缀排序是指将所有后缀 $suf[i]$ 看作独立的串，放在一起按照字典序进行升序排序。 

​后缀排名：$rk[i]$ 表示后缀 $suf[i]$ 在后缀排序中的排名。

​后缀数组：$sa[i]$ 表示排名第 $i$ 小的后缀。

即：​$rk[sa[i]]=i$。

​对于后缀排序的实现，略。最优可以做到 $O(n)$，通常使用倍增 $O(n\log n)$。

但是空间复杂度：$O(n)$。

## height 数组：

​求出 SA 后，求 $suf[sa[i]]$ 和 $suf[sa[j]]$ 的 LCP，等价于求：

$$\min\{Lcp(suf[sa[i]],suf[sa[i]+1],\dots,suf[sa[j]-1],suf[sa[j]])\}$$

​令 $h[i]=Lcp(suf[sa[i-1]],suf[sa[i]])$，特别地 $h_1=0$。求 $suf[sa[i]]$ 和 $suf[sa[j]]$ 的 LCP 则等价于求：

$$\min\{h_{i+1},...,h_j\}$$

​至于 height 数组的求法，也略。是 $O(n)$ 的。

```cpp
struct SA {
    int sa[N], h[N], rk[N], oldrk[N << 1], id[N], key1[N], cnt[N];
    int n;
    char s[N];
    bool cmp(int x, int y, int w) {
        return oldrk[x] == oldrk[y] && oldrk[x + w] == oldrk[y + w];
    }
    void init(int n, string &c) {
        for (int i = 1; i <= this->n; i++)
            s[i] = sa[i] = h[i] = 0;
        this->n = n;
        for (int i = 1; i <= n; i++)
            s[i] = c[i - 1];
        for (int i = 1; i <= 26; i++)
            cnt[i] = 0;
    }
    void get_sa() {
        int i, m = 26, p, w;
        for (int i = 1; i <= n; i++)
            ++cnt[rk[i] = (s[i] - 'a' + 1)];
        for (int i = 1; i <= m; i++)
            cnt[i] += cnt[i - 1];
        for (int i = n; i >= 1; i--)
            sa[cnt[rk[i]]--] = i;
        for (w = 1;; w <<= 1, m = p) {
            p = 0;
            for (int i = n; i >= n - w + 1; i--)
                id[++p] = i;
            for (int i = 1; i <= n; i++)
                if (sa[i] > w)
                    id[++p] = sa[i] - w;
            for (int i = 1; i <= m; i++)
                cnt[i] = 0;
            for (int i = 1; i <= n; i++)
                ++cnt[key1[i] = rk[id[i]]];
            for (int i = 1; i <= m; i++)
                cnt[i] += cnt[i - 1];
            for (int i = n; i >= 1; i--)
                sa[cnt[key1[i]]--] = id[i];
            memcpy(oldrk + 1, rk + 1, n * sizeof(int));
            p = 0;
            for (int i = 1; i <= n; i++)
                rk[sa[i]] = cmp(sa[i], sa[i - 1], w) ? p : ++p;
            if (p == n)
                break;
        }
    }
    void get_h() {
        int k = 0;
        for (int i = 1; i <= n; i++) {
            if (!rk[i])
                continue;
            if (k)
                --k;
            while (s[i + k] == s[sa[rk[i] - 1] + k])
                ++k;
            h[rk[i]] = k;
        }
    }
} ;
```

