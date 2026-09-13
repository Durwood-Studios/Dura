`timescale 1ns/1ps
module uvm_top;
 import uvm_pkg::*;
 import uart_uvm_pkg::*;
 bit clk=0; always #5 clk=~clk;
 uart_if vif(clk);
 uart #(.CLKS_PER_BIT(16)) dut(clk,vif.rst,vif.start,vif.data,vif.tx,vif.busy,
                              vif.tx,vif.received,vif.valid,vif.error);
 initial begin
  uvm_config_db#(virtual uart_if)::set(null,"uvm_test_top.*","vif",vif);
  run_test("uart_test");
 end
 initial begin #10000000; $fatal(1,"UVM watchdog timeout"); end
endmodule
