<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Border</center></h1>

​Border 指：字符串的公共前后缀。

​根据情境的不同，Border 可以指字符串、字符串的长度，也可以指最长的字符串、最长的字符串长度，​Border 可以是其本身，也可以不含其本身。具体含义需要结合场景分析。

## 周期和循环节：

​对于字符串 $s$，若存在一个正整数 $p$ 满足 $\forall i\in (p,|s|],\ s_i=s_{i-p}$，则称 $p$ 是 $s$ 的一个周期。

​若 $p\mid |s|$，则称 $p$ 是 $s$ 的一个循环节。

## Border vs 周期：

​$p$ 是 $s$ 的周期 $\Leftrightarrow|s|-p$ 是 $s$ 的 Border。

​所以求 Border 和求周期等价，求最小周期即为求最大 Border。

## $s$ 所有前缀的 Border 的求法：

​Border 具有传递性：$s$ 的 Border 的 Border 还是 $s$ 的 Border。

​所以 $pre_i$ 的 Border 为 $pre_{i-1}$ 的某一个 Border 加一。

```cpp
void init(string &a) { // 出于方便，考虑 border 的字符串一般下标从 1 开始
    int j = 0, n = a.size() - 1;
    for (int i = 2; i <= n; i++) {
        while (j && a[i] != a[j + 1])
            j = border[j];
        if (a[i] == a[j + 1])
            j++;
        border[i] = j;
    }
}
```

​$i,j$ 指针的增量均为 $O(n)$，所以时间复杂度为：$O(n)$。