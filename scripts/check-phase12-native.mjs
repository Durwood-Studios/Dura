/** Compile and exercise the actual repaired C++ blocks; requires a C++20 compiler. */
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve("src/content/phases/12-quant-hft");
const cases = [
  [
    "conditional",
    "q-1-",
    "03-",
    "std::int64_t read_price",
    `int main(){std::int64_t value=42;assert(read_price(nullptr)==0);assert(read_price(&value)==42);}`,
  ],
  [
    "price",
    "q-2-",
    "05-",
    "std::optional<Price> parse_price",
    `int main(){assert(parse_price("183.5")==1835000);assert(parse_price("0")==0);assert(parse_price("922337203685477.5807")==std::numeric_limits<Price>::max());for(auto invalid:{"", "12x", "-1.2", "1.2x", "1.", "1.23456", "922337203685477.5808", "999999999999999999999"})assert(!parse_price(invalid));}`,
  ],
  [
    "fixed_arena",
    "q-1-",
    "04-",
    "class Arena",
    `int main(){Arena<512> a;assert(!a.allocate(1,0));assert(!a.allocate(1,3));assert(!a.allocate(600));assert(a.used()==0);auto p=a.allocate(3,128);assert(p);assert(reinterpret_cast<std::uintptr_t>(p)%128==0);a.reset();assert(a.used()==0);assert(a.allocate(512));assert(!a.allocate(1));}`,
  ],
  [
    "dynamic_arena",
    "q-3-",
    "08-",
    "class Arena",
    `int main(){Arena zero(0);assert(!zero.alloc(1));Arena a(1024);auto p=a.alloc(3,128);assert(p);assert(reinterpret_cast<std::uintptr_t>(p)%128==0);assert(!a.alloc(1,0));assert(!a.alloc(2048));a.reset();assert(a.used()==0);assert(a.alloc(1024));assert(!a.alloc(1));}`,
  ],
  [
    "pool",
    "q-3-",
    "08-",
    "class ObjectPool",
    `struct Item{static inline int live=0;int value;Item(int v):value(v){++live;}~Item(){--live;}};int main(){{ObjectPool<Item,2> pool;auto a=pool.alloc(7),b=pool.alloc(9);assert(a&&b&&!pool.alloc(11));assert(pool.get(*a)->value==7);assert(pool.free(*a));assert(!pool.free(*a));auto c=pool.alloc(12);assert(c);assert(!pool.free(*a));assert(pool.get(*c)->value==12);assert(!pool.free({99,0}));}assert(Item::live==0);}`,
  ],
  [
    "erased",
    "q-1-",
    "07-",
    "class InlineFunction",
    `int main(){InlineFunction<int(int)> empty;bool caught=false;try{empty(1);}catch(const std::bad_function_call&){caught=true;}assert(caught);InlineFunction<int(int)> f([](int x){return x+2;});assert(f(3)==5);InlineFunction<int(int)> g(std::move(f));assert(g(4)==6);}`,
  ],
];
const directory = mkdtempSync(path.join(tmpdir(), "dura-phase12-native-"));
try {
  for (const [name, modulePrefix, lessonPrefix, marker, assertions] of cases) {
    const moduleName = readdirSync(root).find((entry) => entry.startsWith(modulePrefix));
    if (!moduleName) throw new Error(`Missing module ${modulePrefix}`);
    const modulePath = path.join(root, moduleName);
    const lessonName = readdirSync(modulePath).find((entry) => entry.startsWith(lessonPrefix));
    if (!lessonName) throw new Error(`Missing lesson ${lessonPrefix}`);
    const content = readFileSync(path.join(modulePath, lessonName), "utf8");
    const code = [...content.matchAll(/```cpp\n([\s\S]*?)```/g)].find((match) =>
      match[1].includes(marker)
    )?.[1];
    if (!code) throw new Error(`Missing C++ block ${marker}`);
    const source = path.join(directory, `${name}.cpp`);
    const executable = path.join(directory, name);
    writeFileSync(
      source,
      `#include <cassert>\n#include <cstdint>\n#include <cstddef>\n${code}\n${assertions}\n`
    );
    const compiled = spawnSync(
      process.env.CXX || "c++",
      [
        "-std=c++20",
        "-Wall",
        "-Wextra",
        "-Werror",
        "-fsanitize=address,undefined",
        source,
        "-o",
        executable,
      ],
      { encoding: "utf8", timeout: 60000 }
    );
    if (compiled.error || compiled.status !== 0)
      throw new Error(`Compile ${name}: ${compiled.error?.message ?? compiled.stderr}`);
    const result = spawnSync(executable, [], { encoding: "utf8", timeout: 10000 });
    if (result.error || result.status !== 0)
      throw new Error(`Run ${name}: ${result.error?.message ?? result.stderr}`);
    console.log(`PASS ${name}`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
