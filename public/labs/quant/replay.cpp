#include "book.hpp"
#include <algorithm>
#include <cassert>
#include <chrono>
#include <iostream>
#include <random>
#include <thread>

using namespace dura;
static void put(Bytes& b, std::size_t offset, std::size_t count, std::uint64_t value) {
    for (std::size_t i = 0; i < count; ++i) { b[offset + count - i - 1] = value & 255; value >>= 8; }
}
static Bytes wire(Event e) {
    Bytes b(e.type == 'A' ? 36 : e.type == 'D' ? 19 : e.type == 'X' ? 23 : 31, 0);
    b[0] = e.type; put(b, 1, 2, 1); put(b, 11, 8, e.id);
    if (e.type == 'A') {
        b[19] = e.side; put(b, 20, 4, e.quantity); put(b, 32, 4, e.price);
        const std::string symbol = "DURA    "; std::copy(symbol.begin(), symbol.end(), b.begin() + 24);
    } else if (e.type != 'D') put(b, 19, 4, e.quantity);
    return b;
}
template <typename F> static void rejects(F action) {
    bool failed = false; try { action(); } catch (const std::runtime_error&) { failed = true; }
    assert(failed);
}
static Top reference(const std::map<std::uint64_t, Order>& orders) {
    Top top;
    for (const auto& [id, o] : orders) {
        (void)id;
        if (o.side == 'B' && (!top.bid || o.price > *top.bid)) top.bid = o.price;
        if (o.side == 'S' && (!top.ask || o.price < *top.ask)) top.ask = o.price;
    }
    return top;
}
int main() {
    Book b;
    b.consume(1, wire({'A','B',1,100,1000000}));
    b.consume(2, wire({'A','S',2,80,1000100}));
    assert(b.top().bid == 1000000 && b.top().ask == 1000100);
    b.consume(3, wire({'E',' ',1,40,0}));
    assert(b.orders().at(1).quantity == 60);
    b.consume(4, wire({'X',' ',1,60,0}));
    assert(!b.top().bid);
    rejects([&] { b.consume(6, wire({'D',' ',2,0,0})); });
    rejects([&] { (void)b.top(); });
    b.recover(7, {{2, {'S',80,1000100}}});
    b.consume(7, wire({'D',' ',2,0,0}));
    assert(!b.top().ask);
    for (std::size_t length = 0; length < 36; ++length) {
        auto bytes = wire({'A','B',8,1,100}); bytes.resize(length);
        rejects([&] { (void)parse(bytes); });
    }
    for (const Event bad : {Event{'A','?',9,1,100}, Event{'A','B',9,0,100}, Event{'X',' ',999,1,0}}) {
        Book invalid; rejects([&] { invalid.apply(1, bad); }); rejects([&] { (void)invalid.top(); });
    }
    Book duplicate; duplicate.apply(1, {'A','B',1,5,100});
    rejects([&] { duplicate.apply(2, {'A','B',1,5,100}); });
    Book excessive; excessive.apply(1, {'A','B',1,5,100});
    rejects([&] { excessive.apply(2, {'E',' ',1,6,0}); });
    // Independent scan-based oracle; compare identity, quantities and top
    // after each of 20,000 reproducible randomized protocol events.
    Book fast; std::map<std::uint64_t, Order> slow;
    std::mt19937 rng(42); std::uint64_t next_id = 1;
    std::vector<Bytes> tape; tape.reserve(20000);
    for (std::uint64_t seq = 1; seq <= 20000; ++seq) {
        Event e{};
        if (slow.empty() || rng() % 3 == 0) {
            e = {'A', rng() % 2 ? 'B' : 'S', next_id++, static_cast<std::uint32_t>(1 + rng() % 1000), static_cast<std::uint32_t>(1000000 + rng() % 100)};
            slow.emplace(e.id, Order{e.side, e.quantity, e.price});
        } else {
            auto it = slow.begin(); std::advance(it, rng() % slow.size());
            e = {rng() % 2 ? 'E' : 'X', ' ', it->first, static_cast<std::uint32_t>(1 + rng() % it->second.quantity), 0};
            it->second.quantity -= e.quantity;
            if (!it->second.quantity) slow.erase(it);
        }
        tape.push_back(wire(e)); fast.consume(seq, tape.back());
        assert(fast.top() == reference(slow)); assert(fast.orders().size() == slow.size());
        for (const auto& [id, order] : slow) assert(fast.orders().at(id).quantity == order.quantity);
    }
    Spsc<std::uint64_t, 64> queue;
    std::thread producer([&] { for (std::uint64_t i = 1; i <= 100000; ++i) while (!queue.push(i)) std::this_thread::yield(); });
    for (std::uint64_t i = 1; i <= 100000; ++i) { std::uint64_t got = 0; while (!queue.pop(got)) std::this_thread::yield(); assert(got == i); }
    producer.join();
    // Replayed protocol bytes through the same production path. Includes
    // per-event clock overhead; no claimed exchange/network latency.
    Book measured; std::vector<std::int64_t> samples; samples.reserve(tape.size());
    for (std::size_t i = 0; i < tape.size(); ++i) {
        auto start = std::chrono::steady_clock::now(); measured.consume(i + 1, tape[i]);
        samples.push_back(std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::steady_clock::now() - start).count());
    }
    assert(measured.top() == fast.top()); std::sort(samples.begin(), samples.end());
    std::cout << "PASS: parser, identities, reductions, gaps, recovery, 20000 differential events, 100000 SPSC handoffs\n";
    std::cout << "Local parse+apply nanoseconds p50=" << samples[samples.size()/2] << " p99=" << samples[samples.size()*99/100] << " max=" << samples.back() << "\n";
}
