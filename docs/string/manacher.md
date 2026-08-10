<h1><center>Manacher</center></h1>

​可以用回文中心加回文半径的方式描述一个字符串的回文子串。

​定义 $len_{1,i}$ 表示以 $s_i$ 为中心的且回文串长度为奇数最长回文半径，$len_{0,i}$ 表示以 $s_i$ 为中心且回文串长度为偶数的最长回文半径。

​Manacher 算法的过程就是求出这两个数组的过程，为了简化问题，可以在原字符串的两个相邻字符之间插入一个相同的特殊字符（除首尾），然后只需要维护回文串长度为奇数的最长回文半径即可。下方代码使用 `$`、`#`、`^` 分别作为左哨兵、分隔符和右哨兵；这三个字符必须互不相同，并且都不能出现在输入字符串中。

​和 Z 函数类似，维护一个右端点最靠右的回文区间 $[l,r],mid=\lfloor\frac{l+r}{2}\rfloor$。

- 若 $i<r$，先令 $len_i=\min(len_{mid-(i-mid)},r-i)$。其中 $mid-(i-mid)$ 是 $i$ 关于 $mid$ 的镜像位置，取最小值是为了保证初始回文半径不越过当前右边界 $r$。
- 若 $i\ge r$，令 $len_i=1$。
- 然后暴力扩展 $len_i$，更新 $[l,r]$。

​时间复杂度分析同 Z 函数，$r$ 指针只变化了 $O(n)$ 次，时间复杂度：$O(n)$。

:::details 点击展开代码
```cpp
vector<vector<int>> manacher(string &s) {
    int n = s.size();

    vector<char> c(2 * n + 3);
    c[0] = '$', c[1] = '#';
    for (int i = 1; i <= n; i++) {
        c[1 + 2 * i - 1] = s[i - 1];
        c[1 + 2 * i] = '#';
    }
    c[2 * n + 2] = '^';

    int m = 2 * n + 2;
    int idx0 = 0, idx1 = 0;
    vector<int> A(m + 1);
    vector<int> len0(n + 1), len1(n + 1); // 这里为了保持长度一致，len0 实际上多了一个末尾的 0，len0 的有效元素应为 len0[1] 到 len0[n - 1]
    int r = 0, mid;
    for (int i = 1; i < m; i++) {
        if (i < r)
            A[i] = min(A[2 * mid - i], r - i);
        else
            A[i] = 1;
        while (c[i - A[i]] == c[i + A[i]])
            A[i]++;
        if (i + A[i] > r)
            r = i + A[i] - 1, mid = i;
        if (!(i & 1))
            len1[++idx0] = A[i] >> 1;
        if ((i & 1) && i > 1)
            len0[++idx1] = A[i] >> 1;
    }
    return {len0, len1};
}
```
:::
