#ifndef DURA_PIPELINE_HEALTH_H
#define DURA_PIPELINE_HEALTH_H
#include <stdbool.h>
#include <stdint.h>
typedef struct { uint32_t sequence, last_ms; bool started, fault; } PipelineHealth;
/* Faults latch until reset. Unsigned elapsed time tolerates counter wrap. */
static inline bool pipeline_accept(PipelineHealth *state, uint32_t sequence, uint32_t now_ms,
                                   bool samples_valid, bool overrun, bool transmitted) {
    if (state->fault || !samples_valid || overrun || !transmitted ||
        (state->started && (sequence != state->sequence + 1U || (uint32_t)(now_ms - state->last_ms) > 100U))) {
        state->fault = true;
        return false;
    }
    state->started = true;
    state->sequence = sequence;
    state->last_ms = now_ms;
    return true;
}
#endif
