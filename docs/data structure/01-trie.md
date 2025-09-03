<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>01-Trie</center></h1>

01-Trie 与 Trie 结构相同，区别在于维护的字符集是 $\{0,1\}$。

01-Trie 空间复杂度为 $O(n\log n)$。

```cpp
struct Trie01 {
    int root, idx;
    int son[N << 5][2];
    void init() {
        for (int i = 0; i <= idx; i++)
            memset(son[i], 0, sizeof son[i]);
        root = idx = 0;
    }
    void insert(int &p, int v, int x) {
        if (!p)
            p = ++idx;
        if (x < 0) {
            return;
        }
        int now = (v >> x) & 1;
        insert(son[p][now], v, x - 1);
    }
    int query_xor_max(int p, int v, int x) {
        if (x < 0) {
            return 0;
        }
        int now = (v >> x) & 1;
        if (son[p][now ^ 1])
            return query_xor_max(son[p][now ^ 1], v, x - 1) | (1 << x);
        return query_xor_max(son[p][now], v, x - 1);
    }
};
```


### 可持久化 01-Trie

一般可持久化 Trie 仅用于 01-Trie，通过差分可维护区间二进制信息。

由于 Trie 的特殊性，进行可持久化不需要额外空间，空间复杂度仍为：$O(n\log n)$。

```cpp
struct PTrie01 {
    int root[N], idx;
    int sz[N << 5], son[N << 5][2];
    void init() {
        for (int i = 0; i <= idx; i++)
            memset(son[i], 0, sizeof son[i]);
        for (int i = 1; i <= idx; i++)
            root[i] = sz[i] = 0;
        idx = 0;
    }
    void insert(int p, int &q, int v, int x) {
        if (!q)
            q = ++idx;
        sz[q] = sz[p];
        sz[q]++;
        if (x < 0)
            return;
        int now = (v >> x) & 1;
        son[q][now ^ 1] = son[p][now ^ 1];
        insert(son[p][now], son[q][now], v, x - 1);
    }
    int query_xor_max(int p, int q, int v, int x) {
        if (x < 0) {
            return 0;
        }
        int now = (v >> x) & 1;
        if (sz[son[p][now ^ 1]] - sz[son[q][now ^ 1]] < 0)
            return query_xor_max(son[p][now ^ 1], son[q][now ^ 1], v, x - 1) |
                   (1 << x);
        return query_xor_max(son[p][now], son[q][now], v, x - 1);
    }
};
```