#include "include/pipeline_health.h"
#include <assert.h>
#include <stdio.h>
int main(void) {
    PipelineHealth state = {0};
    assert(pipeline_accept(&state, 0, 0, true, false, true));
    assert(pipeline_accept(&state, 1, 16, true, false, true));
    assert(!pipeline_accept(&state, 3, 32, true, false, true));
    assert(!pipeline_accept(&state, 2, 33, true, false, true));
    for (unsigned fault = 0; fault < 4; ++fault) {
        PipelineHealth s = {0};
        assert(pipeline_accept(&s, 0, 100, true, false, true));
        assert(!pipeline_accept(&s, 1, fault == 3 ? 201 : 116, fault != 0, fault == 1, fault != 2));
    }
    PipelineHealth wrap = {UINT32_MAX, UINT32_MAX - 10U, true, false};
    assert(pipeline_accept(&wrap, 0, 5, true, false, true));
    puts("PASS: normal blocks, lost sequence, latched faults, invalid sample, overflow, UART failure, deadline, tick/sequence wrap");
}
