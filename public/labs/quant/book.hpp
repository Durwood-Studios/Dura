#pragma once
#include <algorithm>
#include <array>
#include <atomic>
#include <cstdint>
#include <map>
#include <optional>
#include <span>
#include <stdexcept>
#include <unordered_map>
#include <vector>

namespace dura {
using Bytes = std::vector<std::uint8_t>;
inline std::uint64_t read_be(std::span<const std::uint8_t> bytes, std::size_t offset, std::size_t count) {
    if (count > 8 || offset > bytes.size() || count > bytes.size() - offset)
        throw std::runtime_error("truncated integer");
    std::uint64_t value = 0;
    for (std::size_t i = 0; i < count; ++i) value = (value << 8) | bytes[offset + i];
    return value;
}
struct Event { char type, side; std::uint64_t id; std::uint32_t quantity, price; };
// Explicit single-instrument ITCH5 subset. Unknown types fail, never silently
// skip a message that might change the book. Sequencing belongs to transport.
inline Event parse(std::span<const std::uint8_t> bytes) {
    if (bytes.empty()) throw std::runtime_error("empty message");
    const char type = static_cast<char>(bytes[0]);
    const std::size_t size = type == 'A' ? 36 : type == 'D' ? 19 : type == 'X' ? 23 : type == 'E' ? 31 : 0;
    if (!size || bytes.size() != size) throw std::runtime_error("unsupported type or wrong length");
    if (read_be(bytes, 1, 2) != 1) throw std::runtime_error("fixture accepts locate1 only");
    Event event{type, ' ', read_be(bytes, 11, 8), 0, 0};
    if (type == 'A') {
        event.side = static_cast<char>(bytes[19]);
        event.quantity = static_cast<std::uint32_t>(read_be(bytes, 20, 4));
        event.price = static_cast<std::uint32_t>(read_be(bytes, 32, 4));
        const std::array<std::uint8_t, 8> symbol{'D','U','R','A',' ',' ',' ',' '};
        if (!std::equal(symbol.begin(), symbol.end(), bytes.begin() + 24)) throw std::runtime_error("wrong symbol");
    } else if (type != 'D') event.quantity = static_cast<std::uint32_t>(read_be(bytes, 19, 4));
    return event;
}
struct Order { char side; std::uint32_t quantity, price; };
struct Top { std::optional<std::uint32_t> bid, ask; bool operator==(const Top&) const = default; };
class Book {
    std::unordered_map<std::uint64_t, Order> orders_;
    std::map<std::uint32_t, std::uint64_t> bids_, asks_;
    std::uint64_t expected_ = 1;
    bool valid_ = true;
public:
    void apply(std::uint64_t sequence, const Event& e) {
        if (!valid_) throw std::runtime_error("book unavailable until snapshot recovery");
        if (sequence != expected_) { valid_ = false; throw std::runtime_error("sequence gap/replay"); }
        try {
            if (e.type == 'A') {
                if (!e.id || !e.quantity || !e.price || e.price > 2000000000U || (e.side != 'B' && e.side != 'S') || orders_.contains(e.id))
                    throw std::runtime_error("invalid or duplicate add");
                orders_.emplace(e.id, Order{e.side, e.quantity, e.price});
                (e.side == 'B' ? bids_ : asks_)[e.price] += e.quantity;
            } else {
                const auto it = orders_.find(e.id);
                if (it == orders_.end() || (e.type != 'X' && e.type != 'E' && e.type != 'D'))
                    throw std::runtime_error("unknown order or event");
                auto& order = it->second;
                const auto quantity = e.type == 'D' ? order.quantity : e.quantity;
                if (!quantity || quantity > order.quantity) throw std::runtime_error("invalid reduction");
                auto& levels = order.side == 'B' ? bids_ : asks_;
                auto level = levels.find(order.price);
                level->second -= quantity;
                if (!level->second) levels.erase(level);
                order.quantity -= quantity;
                if (!order.quantity) orders_.erase(it);
            }
            ++expected_;
        } catch (...) { valid_ = false; throw; }
    }
    void consume(std::uint64_t sequence, std::span<const std::uint8_t> bytes) {
        try { apply(sequence, parse(bytes)); } catch (...) { valid_ = false; throw; }
    }
    void recover(std::uint64_t next_sequence, const std::vector<std::pair<std::uint64_t, Order>>& snapshot) {
        if (!next_sequence) throw std::runtime_error("invalid snapshot cursor");
        Book staged;
        for (const auto& [id, order] : snapshot)
            staged.apply(staged.expected_, Event{'A', order.side, id, order.quantity, order.price});
        staged.expected_ = next_sequence;
        *this = std::move(staged);
    }
    Top top() const {
        if (!valid_) throw std::runtime_error("book unavailable");
        return {bids_.empty() ? std::nullopt : std::optional(bids_.rbegin()->first),
                asks_.empty() ? std::nullopt : std::optional(asks_.begin()->first)};
    }
    const auto& orders() const { return orders_; }
};

// Exactly one producer and one consumer. N-1 usable slots; full means back
// pressure, never overwrite. Do not use for multiple writers/readers.
template <typename T, std::size_t N> class Spsc {
    static_assert(N >= 2);
    std::array<T, N> buffer_{};
    alignas(64) std::atomic<std::size_t> write_{0};
    alignas(64) std::atomic<std::size_t> read_{0};
public:
    bool push(const T& value) {
        const auto current = write_.load(std::memory_order_relaxed), next = (current + 1) % N;
        if (next == read_.load(std::memory_order_acquire)) return false;
        buffer_[current] = value;
        write_.store(next, std::memory_order_release);
        return true;
    }
    bool pop(T& value) {
        const auto current = read_.load(std::memory_order_relaxed);
        if (current == write_.load(std::memory_order_acquire)) return false;
        value = buffer_[current];
        read_.store((current + 1) % N, std::memory_order_release);
        return true;
    }
};
}
