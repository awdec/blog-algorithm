
<h1><center>一些有用的库函数</center></h1>

## GCC、Clang 等编译器提供的非 cpp 标准函数

| 函数               | 功能                                              |
| ------------------ | ------------------------------------------------- |
| __builtin_popcount | 统计 unsigned int x 的二进制中 $1$ 的数量         |
| __builtin_ctz      | 统计 unsigned int x 的二进制中末尾 $0$ 的个数     |
| __builtin_clz      | 统计 unsigned int x 的二进制中开头 $0$ 的个数     |
| __builtin_parity   | 统计 unsigned int x 的二进制中 $1$ 的数量的奇偶性 |

__builtin_ctz/__builtin_clz 中传入 $0$ 是未定义行为。

以上函数时间复杂度均为 $O(1)$，效率较高。

以上函数均有在末尾加 l 表示参数 unsigned long 和在末尾加 ll 表示参数 unsigned long long 的变形。

需要正确传入参数，否则会触发未定义行为。

## C++20 引入了 `<bit>` 头文件

| 函数        | 功能   |
| ----------- | --------------------------------------------------------- |
| popcount    | 统计 $x$ 的二进制中 $1$ 的数量                            |
| countr_zero | 统计 $x$ 的二进制中末尾 $0$ 的个数                        |
| countl_zero | 统计 $x$ 的二进制中开头 $0$ 的个数                        |
| countr_one  | 统计 $x$ 的二进制中末尾 $1$ 的个数                        |
| countl_one  | 统计 $x$ 的二进制中开头 $1$ 的个数                        |
| bit_width   | 返回表示 $x$ 所需的位数，即满足 $2^n>x$ 的最小非负整数 $n$；$x=0$ 时返回 $0$ |
| bit_floor   | 返回不大于 $x$ 的最大 2 的幂；$x=0$ 时返回 $0$             |
| bit_ceil    | 返回不小于 $x$ 的最小 2 的幂；$x=0$ 时返回 $1$             |

`countr_zero` 和 `countl_zero` 可以传入 $0$，返回对应类型的总位数。例如 `bit_width(13u) == 4`、`bit_floor(13u) == 8`、`bit_ceil(13u) == 16`。

以上函数模板只接受无符号整数类型，不应把有符号整数直接传入。`bit_ceil(x)` 还要求结果能够由参数类型表示，否则行为未定义。

以上函数时间复杂度均为 $O(1)$，效率通常与对应的编译器内建函数相当。

## mt19937

:::details 点击展开代码
```cpp
mt19937 rng(time(nullptr));

int rnd(int l, int r) {
    uniform_int_distribution<int> dist(l, r);
    int num = dist(rng);
    return num;
}

vector<int> a;
shuffle(a.begin(), a.end(), rng);
```
:::


## nth-element

:::details 点击展开代码
```cpp
// 默认升序规则（less<>）
nth_element(first, nth, last);
// 自定义比较规则
nth_element(first, nth, last, cmp);
// 第 k 小，k 从 1 开始
nth_element(nums.begin(), nums.begin() + k - 1, nums.end());
// 自定义降序比较规则
nth_element(nums.begin(), nums.begin() + k - 1, nums.end(),
            [](int a, int b) { return a > b; }); // 第 k 大
```
:::

执行后，`nth` 指向的元素与完整排序后该位置的元素相同；`[first, nth)` 中的元素按比较规则不会排在 `nth` 之后，`(nth, last)` 中的元素不会排在它之前，但两侧各自都不保证有序。

`nth_element` 平均使用 $O(n)$ 次比较即可找到顺序统计量。默认升序规则下 `nums[k-1]` 是第 $k$ 小；使用上面的降序比较器时则是第 $k$ 大。
