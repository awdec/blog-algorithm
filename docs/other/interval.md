<h1><center>区间问题</center></h1>

除“区间求并”一节另有说明外，本文均讨论闭区间 $[l,r]$，并假设 $l\le r$。闭区间包含端点，因此两个区间在端点相接也算相交：判断新区间与已选区间不相交时使用 $l>r$，判断某个已结束的分组能否复用时使用 $r<l$。若改用半开区间 $[l,r)$，相应边界应改为允许取等。

### 选最少的点覆盖所有区间

:::details 点击展开代码
```cpp
int calc(vector<pii> a) {
    sort(a.begin(), a.end(), [&](pii x, pii y) -> bool {
        return x.second == y.second ? x.first < y.first : x.second < y.second;
    });
    int res = 0, r = 0;
    bool has = false;
    for (auto u : a) {
        if (!has || u.first > r) {
            res++;
            r = u.second;
            has = true;
        }
    }
    return res;
}
```
:::

### 选最多的区间互不相交

同【选最少的点覆盖所有区间】。

### 区间分成组内区间无交的最少组数

:::details 点击展开代码
```cpp
int calc(vector<pii> a) {
    sort(a.begin(), a.end());
    priority_queue<int, vector<int>, greater<int>> q;
    for (auto [l, r] : a) {
        if (q.size() && q.top() < l)
            q.pop();
        q.push(r);
    }
    return q.size();
}
```
:::

### 选最少的区间覆盖整段区间

这里覆盖的是从 $s$ 向右延伸至 $t$ 的连续线段，并约定 $s\ge t$ 时目标已经完成，答案为 $0$。每次应在所有满足 $l\le cur$ 的候选区间中选择右端点最大的一个；若最远右端点不能超过 $cur$，说明无法继续覆盖。

:::details 点击展开代码
```cpp
int calc(int s, int t, vector<pii> a) {
    if (s >= t)
        return 0;
    sort(a.begin(), a.end());
    int res = 0, cur = s, i = 0;
    while (cur < t) {
        int r = cur;
        while (i < a.size() && a[i].first <= cur) {
            r = max(r, a[i].second);
            i++;
        }
        if (r <= cur)
            return -1;
        cur = r;
        res++;
    }
    return res;
}
```
:::

### 区间求并

本节单独约定输入为闭整数区间，返回其并集中整数点的数量，因此每个合并后区间 $[l,r]$ 的贡献是 $r-l+1$。下面选择把 $[l,r]$ 与 $[r+1,r']$ 这样的相邻整数区间也合并；这不会改变整数点总数，但能得到更紧凑的合并结果。若求实数轴上的总长度，则贡献应改为 $r-l$，且只有新区间左端点不大于当前右端点时才合并。

:::details 点击展开代码
```cpp
long long calc(vector<pii> a) {
    if (a.empty())
        return 0;
    sort(a.begin(), a.end());
    long long res = 0, l = a[0].first, r = a[0].second;
    for (int i = 1; i < a.size(); i++) {
        auto u = a[i];
        if (u.first <= r + 1) {
            r = max(r, 1ll * u.second);
        } else {
            res += r - l + 1;
            l = u.first;
            r = u.second;
        }
    }
    res += r - l + 1;
    return res;
}
```
:::
