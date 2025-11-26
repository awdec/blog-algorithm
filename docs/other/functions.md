<style>
 body {
  font-family: "楷体"
}
</style>


<h1><center>一些有趣的库函数</center></h1>

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
| bit_width   | 对于 $x$ 计算最小的 $n$ 满足 $2^n>x$，$x=0$ 时返回 $0$    |
| bit_floor   | 对于 $x$ 计算最大的 $n$ 满足 $2^n\le x$，$x=0$ 时返回 $0$ |
| bit_ceil    | 对于 $x$ 计算最小的 $n$ 满足 $2^n\ge x$                   |

countr_zero 可以传入 $0$，返回对应类型的总位数。

以上函数参数均为无符号整数，自动识别是 unsigned int 还是 unsigned long long。

以上函数时间复杂度均为 $O(1)$，效率与 __buil 相当。