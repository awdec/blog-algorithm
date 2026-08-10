<h1><center>珂朵莉树</center></h1>

名字来自于 CF896C 的题图。

本质是用数据结构维护区间连续段。

出于实际使用情况考虑，省略链表维护的介绍。

以下实现中，`mp[x]` 表示从位置 $x$ 开始的区间值。`mp` 的第一个键是左端点 $L$，最后一个键是 $R+1$ 处的右哨兵；右哨兵不属于实际区间，不能被删除。所有区间操作都必须满足 $L\le l\le r\le R$。

## init

:::details 点击展开代码
```cpp
void init(int l, int r) {
    assert(l <= r && r < INT_MAX);
    mp.clear();
    mp[l] = mp[r + 1] = - 1;
}
```
:::

## split

:::details 点击展开代码
```cpp
auto split(int x) {
    assert(!mp.empty());
    assert(mp.begin()->first <= x && x <= mp.rbegin()->first);

    auto it = mp.lower_bound(x);
    if (it != mp.end() && it->first == x) {
        return it;
    }
    return mp.emplace_hint(it, x, prev(it)->second);
}
```
:::

## assign

区间推平，一般是区间赋值。

:::details 点击展开代码
```cpp
void assign(int l, int r, int v) {
    assert(!mp.empty());
    assert(mp.begin()->first <= l && l <= r && r < mp.rbegin()->first);

    int sentinel = mp.rbegin()->first;
    auto itr = split(r + 1);
    auto itl = split(l);
    mp.erase(itl, itr);
    auto it = mp.emplace_hint(itr, l, v);

    if (it != mp.begin() && prev(it)->second == it->second) {
        auto pre = prev(it);
        mp.erase(it);
        it = pre;
    }

    auto nxt = next(it);
    if (nxt != mp.end() && nxt->first != sentinel && nxt->second == it->second) {
        mp.erase(nxt);
    }
}
```
:::

## perform

遍历区间 $[l,r]$，在遍历过程中进行具体操作。

:::details 点击展开代码
```cpp
void perform(int l, int r, int v) {
    assert(!mp.empty());
    assert(mp.begin()->first <= l && l <= r && r < mp.rbegin()->first);

    auto itr = split(r + 1);
    auto it = split(l);
    while (it != itr) {
        // 具体操作
        it = next(it);
    }
}
```
:::



## 时间复杂度分析

### 区间推平时

若每次操作后，都会进行一次区间推平操作，即将区间合并成一个相同的连续段。

每个区间只会被遍历一次，每次最多增加一个区间，最多增加到 $n$ 个区间。遍历次数和区间数量的变化成线性相关，那么均摊时间复杂度为：$O(m\log n)$。

### 数据随机时

CF896C 证明了这种情况的时间复杂度为 $O(m\log\log n)$。
