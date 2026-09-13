`timescale 1ns/1ps
module tb;
 localparam CPB=16;
 reg clk=0; always #5 clk=~clk;
 reg rst=1, start=0, inject=0, serial=1;
 reg [7:0] data=0;
 wire tx,busy,valid,error;
 wire [7:0] received;
 wire rx=inject ? serial : tx;
 uart #(.CLKS_PER_BIT(CPB)) dut(clk,rst,start,data,tx,busy,rx,received,valid,error);
 integer seen[0:255]; integer errors=0, count=0, expected=0;
 reg checking=0;
 always @(negedge clk) begin
  if(valid) begin
   if(!checking || received!==expected[7:0]) $fatal(1,"Unexpected receive %h expected %h",received,expected);
   seen[received]=seen[received]+1; count=count+1;
  end
  if(error) errors=errors+1;
 end
 task cycles(input integer n); repeat(n) @(negedge clk); endtask
 task send(input integer value);
  begin
   while(busy) cycles(1);
   expected=value; checking=1; data=value; start=1; cycles(1); start=0;
   while(busy) cycles(1);
   cycles(CPB);
  end
 endtask
 task bit_in(input bit value); serial=value; cycles(CPB); endtask
 integer i;
 initial begin
  for(i=0;i<256;i=i+1) seen[i]=0;
  cycles(4); rst=0; cycles(4);
  for(i=0;i<256;i=i+1) send(i);
  if(count!=256) $fatal(1,"Missing bytes: %0d",count);
  for(i=0;i<256;i=i+1) if(seen[i]!=1) $fatal(1,"Coverage hole %0d",i);
  // Mid-frame reset must abort transmission and reception.
  checking=0; data=8'ha5; start=1; cycles(1); start=0; cycles(CPB*3);
  rst=1; cycles(3); if(tx!==1 || busy!==0 || valid!==0) $fatal(1,"Reset failed");
  rst=0; cycles(CPB*12); if(count!=256) $fatal(1,"Reset produced stale byte");
  // Force low stop bit on an injected frame; no valid byte is permitted.
  inject=1; serial=1; cycles(CPB*2); bit_in(0);
  for(i=0;i<8;i=i+1) bit_in((8'h55>>i)&1);
  bit_in(0); serial=1; cycles(CPB*3);
  if(errors!=1) $fatal(1,"Expected one framing error, got %0d",errors);
  inject=0; send(8'hc3);
  if(count!=257) $fatal(1,"Receiver failed recovery");
  $display("PASS: 256/256 byte bins; mid-frame reset; bad stop; recovery; 257 accepted frames");
  $finish;
 end
 initial begin #10000000; $fatal(1,"Watchdog timeout"); end
endmodule
