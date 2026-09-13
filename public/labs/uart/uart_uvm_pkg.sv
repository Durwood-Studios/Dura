package uart_uvm_pkg;
 import uvm_pkg::*;
 `include "uvm_macros.svh"
 class uart_item extends uvm_sequence_item;
  rand bit [7:0] data;
  `uvm_object_utils_begin(uart_item)
   `uvm_field_int(data,UVM_ALL_ON)
  `uvm_object_utils_end
  function new(string name="uart_item"); super.new(name); endfunction
 endclass

 class all_bytes extends uvm_sequence #(uart_item);
  `uvm_object_utils(all_bytes)
  function new(string name="all_bytes"); super.new(name); endfunction
  task body();
   for(int i=0;i<256;i++) begin
    uart_item item=uart_item::type_id::create("item");
    start_item(item); item.data=i; finish_item(item);
   end
  endtask
 endclass

 class uart_driver extends uvm_driver #(uart_item);
  `uvm_component_utils(uart_driver)
  virtual uart_if vif;
  uvm_analysis_port #(uart_item) expected;
  function new(string name,uvm_component parent);
   super.new(name,parent); expected=new("expected",this);
  endfunction
  function void build_phase(uvm_phase phase);
   super.build_phase(phase);
   if(!uvm_config_db#(virtual uart_if)::get(this,"","vif",vif)) `uvm_fatal("VIF","Missing interface")
  endfunction
  task run_phase(uvm_phase phase);
   vif.rst=1; vif.start=0;
   repeat(4) @(negedge vif.clk);
   vif.rst=0; repeat(4) @(negedge vif.clk);
   forever begin
    uart_item item;
    seq_item_port.get_next_item(item);
    while(vif.busy) @(negedge vif.clk);
    expected.write(item);
    vif.data=item.data; vif.start=1;
    @(negedge vif.clk); vif.start=0;
    while(vif.busy) @(negedge vif.clk);
    repeat(16) @(negedge vif.clk);
    seq_item_port.item_done();
   end
  endtask
 endclass

 class uart_monitor extends uvm_component;
  `uvm_component_utils(uart_monitor)
  virtual uart_if vif;
  uvm_analysis_port #(uart_item) observed;
  function new(string name,uvm_component parent);
   super.new(name,parent); observed=new("observed",this);
  endfunction
  function void build_phase(uvm_phase phase);
   super.build_phase(phase);
   if(!uvm_config_db#(virtual uart_if)::get(this,"","vif",vif)) `uvm_fatal("VIF","Missing interface")
  endfunction
  task run_phase(uvm_phase phase);
   forever begin
    @(negedge vif.clk);
    if(!vif.rst && vif.error) `uvm_error("FRAMING","Unexpected framing error")
    if(!vif.rst && vif.valid) begin
     uart_item item=uart_item::type_id::create("observed_item");
     item.data=vif.received; observed.write(item);
    end
   end
  endtask
 endclass

 class uart_scoreboard extends uvm_component;
  `uvm_component_utils(uart_scoreboard)
  uvm_tlm_analysis_fifo #(uart_item) expected, observed;
  int checked=0;
  bit [255:0] seen='0;
  covergroup byte_coverage with function sample(bit[7:0] value);
   byte_value: coverpoint value {bins values[]={[0:255]};}
  endgroup
  function new(string name,uvm_component parent);
   super.new(name,parent);
   expected=new("expected",this); observed=new("observed",this); byte_coverage=new();
  endfunction
  task run_phase(uvm_phase phase);
   forever begin
    uart_item exp,got;
    expected.get(exp); observed.get(got);
    if(exp.data!==got.data) `uvm_error("DATA",$sformatf("Expected %h got %h",exp.data,got.data))
    checked++; seen[got.data]=1; byte_coverage.sample(got.data);
   end
  endtask
  function void check_phase(uvm_phase phase);
   if(checked!=256 || seen!=='1 || expected.used()!=0 || observed.used()!=0)
    `uvm_error("COVERAGE",$sformatf("Checked %0d; missing bytes or unmatched transactions",checked))
  endfunction
 endclass

 class uart_test extends uvm_test;
  `uvm_component_utils(uart_test)
  uvm_sequencer #(uart_item) sequencer;
  uart_driver driver; uart_monitor monitor; uart_scoreboard scoreboard;
  function new(string name,uvm_component parent); super.new(name,parent); endfunction
  function void build_phase(uvm_phase phase);
   super.build_phase(phase);
   sequencer=new("sequencer",this);
   driver=uart_driver::type_id::create("driver",this);
   monitor=uart_monitor::type_id::create("monitor",this);
   scoreboard=uart_scoreboard::type_id::create("scoreboard",this);
  endfunction
  function void connect_phase(uvm_phase phase);
   driver.seq_item_port.connect(sequencer.seq_item_export);
   driver.expected.connect(scoreboard.expected.analysis_export);
   monitor.observed.connect(scoreboard.observed.analysis_export);
  endfunction
  task run_phase(uvm_phase phase);
   all_bytes sequence_all=all_bytes::type_id::create("sequence_all");
   phase.raise_objection(this);
   sequence_all.start(sequencer);
   phase.drop_objection(this);
  endtask
 endclass
endpackage
