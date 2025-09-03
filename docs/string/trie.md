<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Trie</center></h1>

​字典树，用于维护一个字符串集合，查询字符串。

​字典树上一条边表示一个字符，把一个字符串按顺序按边插入树上。

​Trie 上一个节点表示一个前缀，所以也可以称作前缀树。

​特别地，若字符集只含 01，为 01-Trie，一般用于解决 01 串的字典序或计数问题。

```cpp
struct Trie {
    int root, son[N][26], idx;
    bool cnt[N];
    void init() {
        for (int i = 0; i <= idx; i++)
            memset(son[i], 0, sizeof son[i]);
        for (int i = 0; i <= idx; i++)
            cnt[i] = 0;
        root = idx = 0;
    }
    void insert(int &p, string &s, int x) {
        if (!p)
            p = ++idx;
        if (x == s.size()) {
            cnt[p] = 1;
            return;
        }
        insert(son[p][s[x] - 'a'], s, x + 1);
    }
    int query(int p, string &s, int x) {
        if (x == s.size())
            return p;
        return query(son[p][s[x] - 'a'], s, x + 1);
    }
};
```

