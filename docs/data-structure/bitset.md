<h1><center>bitset</center></h1>

手写 bitset

:::details 点击展开代码
```cpp
#include <bits/stdc++.h>
using namespace std;

struct FastBitset
{
    using ull = unsigned long long;
    static constexpr int W = 64;

    int n; // bit 数量
    int m; // ull 块数量
    vector<ull> a;

    FastBitset(int _n = 0, bool val = false)
    {
        init(_n, val);
    }

    void init(int _n, bool val = false)
    {
        n = _n;
        m = (n + W - 1) >> 6;
        a.assign(m, val ? ~0ULL : 0ULL);
        trim();
    }

    ull last_mask() const
    {
        int r = n & 63;
        if (r == 0)
            return ~0ULL;
        return (1ULL << r) - 1;
    }

    void trim()
    {
        if (m && (n & 63))
        {
            a.back() &= last_mask();
        }
    }

    // 单点操作
    void set(int p)
    {
        a[p >> 6] |= 1ULL << (p & 63);
    }

    void reset(int p)
    {
        a[p >> 6] &= ~(1ULL << (p & 63));
    }

    void flip(int p)
    {
        a[p >> 6] ^= 1ULL << (p & 63);
    }

    bool test(int p) const
    {
        return (a[p >> 6] >> (p & 63)) & 1ULL;
    }

    bool operator[](int p) const
    {
        return test(p);
    }

    // 整体操作
    void set_all()
    {
        fill(a.begin(), a.end(), ~0ULL);
        trim();
    }

    void reset_all()
    {
        fill(a.begin(), a.end(), 0ULL);
    }

    void flip_all()
    {
        for (auto &x : a)
            x = ~x;
        trim();
    }

    int count() const
    {
        int res = 0;
        for (ull x : a)
            res += __builtin_popcountll(x);
        return res;
    }

    bool any() const
    {
        for (ull x : a)
        {
            if (x)
                return true;
        }
        return false;
    }

    bool none() const
    {
        return !any();
    }

    // 找从 pos 开始第一个 1，找不到返回 -1
    int find_first1(int pos = 0) const
    {
        if (pos >= n)
            return -1;

        int id = pos >> 6;
        int off = pos & 63;

        ull x = a[id] & (~0ULL << off);
        while (true)
        {
            if (x)
            {
                int p = (id << 6) + __builtin_ctzll(x);
                return p < n ? p : -1;
            }
            ++id;
            if (id >= m)
                break;
            x = a[id];
        }
        return -1;
    }

    // 找从 pos 开始第一个 0，找不到返回 -1
    int find_first0(int pos = 0) const
    {
        if (pos >= n)
            return -1;

        int id = pos >> 6;
        int off = pos & 63;

        ull x = (~a[id]) & (~0ULL << off);
        if (id == m - 1)
            x &= last_mask();

        while (true)
        {
            if (x)
            {
                int p = (id << 6) + __builtin_ctzll(x);
                return p < n ? p : -1;
            }
            ++id;
            if (id >= m)
                break;
            x = ~a[id];
            if (id == m - 1)
                x &= last_mask();
        }
        return -1;
    }

    // 位运算，要求长度相同
    FastBitset &operator&=(const FastBitset &b)
    {
        assert(n == b.n);
        for (int i = 0; i < m; i++)
            a[i] &= b.a[i];
        return *this;
    }

    FastBitset &operator|=(const FastBitset &b)
    {
        assert(n == b.n);
        for (int i = 0; i < m; i++)
            a[i] |= b.a[i];
        return *this;
    }

    FastBitset &operator^=(const FastBitset &b)
    {
        assert(n == b.n);
        for (int i = 0; i < m; i++)
            a[i] ^= b.a[i];
        return *this;
    }

    friend FastBitset operator&(FastBitset x, const FastBitset &y)
    {
        x &= y;
        return x;
    }

    friend FastBitset operator|(FastBitset x, const FastBitset &y)
    {
        x |= y;
        return x;
    }

    friend FastBitset operator^(FastBitset x, const FastBitset &y)
    {
        x ^= y;
        return x;
    }

    FastBitset operator~() const
    {
        FastBitset res = *this;
        res.flip_all();
        return res;
    }

    // 令当前 bitset = src << k
    void assign_shift_left(const FastBitset &src, int k)
    {
        assert(n == src.n);

        if (k <= 0)
        {
            if (this != &src)
                a = src.a;
            return;
        }

        if (k >= n)
        {
            reset_all();
            return;
        }

        int ws = k >> 6;
        int bs = k & 63;

        // 同源情况：this == &src，需要按原地左移处理，从高块往低块更新
        if (this == &src)
        {
            if (ws)
            {
                for (int i = m - 1; i >= 0; i--)
                {
                    a[i] = (i >= ws ? a[i - ws] : 0ULL);
                }
            }

            if (bs)
            {
                for (int i = m - 1; i >= 1; i--)
                {
                    a[i] = (a[i] << bs) | (a[i - 1] >> (64 - bs));
                }
                a[0] <<= bs;
            }

            trim();
            return;
        }

        // 非同源情况：直接从 src 计算到当前对象
        for (int i = m - 1; i >= 0; i--)
        {
            ull val = 0;

            int from = i - ws;

            if (from >= 0)
            {
                val |= src.a[from] << bs;

                if (bs && from - 1 >= 0)
                {
                    val |= src.a[from - 1] >> (64 - bs);
                }
            }

            a[i] = val;
        }

        trim();
    }

    // 令当前 bitset = src >> k
    void assign_shift_right(const FastBitset &src, int k)
    {
        assert(n == src.n);

        if (k <= 0)
        {
            if (this != &src)
                a = src.a;
            return;
        }

        if (k >= n)
        {
            reset_all();
            return;
        }

        int ws = k >> 6;
        int bs = k & 63;

        // 同源情况：this == &src，需要按原地右移处理，从低块往高块更新
        if (this == &src)
        {
            if (ws)
            {
                for (int i = 0; i < m; i++)
                {
                    a[i] = (i + ws < m ? a[i + ws] : 0ULL);
                }
            }

            if (bs)
            {
                for (int i = 0; i + 1 < m; i++)
                {
                    a[i] = (a[i] >> bs) | (a[i + 1] << (64 - bs));
                }
                a[m - 1] >>= bs;
            }

            trim();
            return;
        }

        // 非同源情况：直接从 src 计算到当前对象
        for (int i = 0; i < m; i++)
        {
            ull val = 0;

            int from = i + ws;

            if (from < m)
            {
                val |= src.a[from] >> bs;

                if (bs && from + 1 < m)
                {
                    val |= src.a[from + 1] << (64 - bs);
                }
            }

            a[i] = val;
        }

        trim();
    }

    FastBitset &operator<<=(int k)
    {
        assign_shift_left(*this, k);
        return *this;
    }

    FastBitset &operator>>=(int k)
    {
        assign_shift_right(*this, k);
        return *this;
    }

    friend FastBitset operator<<(FastBitset x, int k)
    {
        x <<= k;
        return x;
    }

    friend FastBitset operator>>(FastBitset x, int k)
    {
        x >>= k;
        return x;
    }

    bool operator==(const FastBitset &b) const
    {
        return n == b.n && a == b.a;
    }

    bool operator!=(const FastBitset &b) const
    {
        return !(*this == b);
    }

    void assign_and(const FastBitset &x, const FastBitset &y)
    {
        assert(n == x.n && n == y.n);
        for (int i = 0; i < m; i++)
            a[i] = x.a[i] & y.a[i];
    }

    void assign_or(const FastBitset &x, const FastBitset &y)
    {
        assert(n == x.n && n == y.n);
        for (int i = 0; i < m; i++)
            a[i] = x.a[i] | y.a[i];
    }

    void assign_xor(const FastBitset &x, const FastBitset &y)
    {
        assert(n == x.n && n == y.n);
        for (int i = 0; i < m; i++)
            a[i] = x.a[i] ^ y.a[i];
    }
    int count(const FastBitset &b) const
    {
        int res = 0;
        for (int i = 0; i < m; i++)
            res += __builtin_popcountll(a[i] & b.a[i]);
        return res;
    }
    FastBitset slice(int l, int r) const {
        int len = r - l + 1;
        FastBitset res(len);

        int base = l >> 6;     // 原 bitset 中的起始块
        int off = l & 63;      // 起点在块内的偏移

        for (int i = 0; i < res.m; i++) {
            int j = base + i;

            if (off == 0) {
                res.a[i] = a[j];
            } else {
                res.a[i] = a[j] >> off;

                if (j + 1 < m) {
                    res.a[i] |= a[j + 1] << (64 - off);
                }
            }
        }

        res.trim();
        return res;
    }
};
```
:::