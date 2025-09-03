<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Kmp</center></h1>

## 字符串匹配：

​设文本串为 $a$，模式串为 $b$。

​当匹配到 $a_i$ 和 $b_j$ 时，若 $a_i\ne b_j$，那么 $b$ 重新开始匹配，匹配到 $a_i$ 的即为 $b_{border_{j-1}+1}$。

​$a_i\neq b_j$ 时被称为失配，所以 border 也被称作失配指针（fail 指针）。

```cpp
void kmp(string &a, string &b) { // a 是文本串 b 是模式串，在 a 上找 b
    int j = 0, n = a.size() - 1, m = b.size() - 1;
    for (int i = 1; i <= n; i++) {
        while (j && a[i] != b[j + 1])
            j = border[j];
        if (a[i] == b[j + 1])
            j++;
        if (j == m) {
            // 匹配成功
            j = border[j];
        }
    }
}
```

​时间复杂度和求 Border 类似，$O(\max\{|a|,|b|\})$。

## 扩展 Kmp（Z 函数）：

​对于一个字符串 $s$，它的 Z 函数定义为 $z(i)$ 表示 $s$ 和 $suf_i$ 的最长公共前缀（LCP）。

​对于 $i$，称区间 $[i,i+z(i)-1]$ 是 $i$ 的匹配段，也可以叫 Z-box。

​算法的过程中，维护右端点最靠右的匹配段。记作 $[l,r]$。根据定义，$s[l,r]$ 和 $s$ 一样前缀相同。在计算 $z(i)$ 时保证 $l\le i$，初始时 $l=r=0$。

​在计算 $z(i)$ 的过程中：

- 如果 $i\le r$，那么根据 $[l,r]$ 的定义有 $s[i,r]=s[i-l,r-l]$，因此 $z(i)\ge \min(z(i-l),r-i+1)$
  - 若 $z(i-l)<r-i+1$，则 $z(i)=z(i-l)$。
  - 否则 $z(i-l)\ge r-i+1$，这时令 $z(i)=r-i+1$，然后暴力枚举下一位匹配。
- 如果 $i>r$，那么直接从 $s_i$ 开始暴力匹配。
- 求出 $z(i)$ 后，如果 $i+z(i)-1>r$，更新 $[l,r]$。

​时间复杂度分析：$r$ 指针只会增加 $O(n)$ 次，$z(i)$ 的暴力扩展次数和 $r$ 的变化次数相同，所以时间复杂度 $O(n)$。

```cpp
void init(string &s) { // 下标从 1 开始
    int n = s.size() - 1;
    for (int i = 2, l = 1, r = 1; i <= n; i++) {
        if (i <= r && z[1 + i - l] < r - i + 1) {
            z[i] = z[1 + i - l];
        } else {
            z[i] = max(0, r - i + 1);
            while (i + z[i] <= n && s[1 + z[i]] == s[i + z[i]])
                ++z[i];
        }
        if (i + z[i] - 1 > r)
            l = i, r = i + z[i] - 1;
    }
    z[1] = n;
}
```

​更一般地，利用 $b$ 的 Z 函数可用于求 $b$ 和 $a$ 的每一个后缀的 LCP。

```cpp
void exkmp(string &a, string &b) {
    int n = a.size() - 1, m = b.size() - 1;
    for (int i = 2, l = 1, r = 1; i <= n; i++) {
        if (i <= r && z[1 + i - l] < r - i + 1) {
            Z[i] = z[1 + i - l];
        } else {
            Z[i] = max(0, r - i + 1);
            while (1 + Z[i] <= m && i + Z[i] <= n && b[1 + Z[i]] == a[i + Z[i]])
                ++Z[i];
        }
        if (i + Z[i] - 1 > r)
            l = i, r = i + Z[i] - 1;
    }
    while (1 + Z[1] <= m && 1 + Z[1] <= n && b[1 + Z[1]] == a[1 + Z[1]])
        ++Z[1];
}
```

## Kmp 自动机 / Border 树（失配树）：

​对于一个字符串 $s$，它的 Border 树共有 $n+1$ 个点：$0,1,...,n$。点 $i$ 的父节点为 $border_i$。

- 前缀 $pre_i$ 的所有 Border：节点 $i$ 到根的链。
- 有长度为 $x$ 的 Border 的前缀：$x$ 的子树。
- 两个前缀 $p,q$ 的公共 Border：$LCA(p,q)$。

也可以认为是只有一个串的 AC 自动机。