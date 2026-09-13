`timescale 1ns/1ps
// Educational 8N1 UART. CLKS_PER_BIT >= 4. Single clock, synchronous reset.
module uart #(parameter integer CLKS_PER_BIT=16)(
 input logic clk, rst, tx_start, input logic [7:0] tx_data,
 output logic tx, tx_busy, input logic rx,
 output logic [7:0] rx_data, output logic rx_valid, framing_error
);
 localparam integer CW=$clog2(CLKS_PER_BIT+1);
 logic [CW-1:0] tc, rc;
 logic [3:0] ti;
 logic [9:0] frame;
 logic rx_meta, rx_sync;
 logic [1:0] state;
 logic [2:0] ri;
 logic [7:0] shift;
 always_ff @(posedge clk) begin
  if(rst) begin
   tx<=1; tx_busy<=0; tc<=0; ti<=0; frame<=10'h3ff;
   rx_meta<=1; rx_sync<=1; state<=0; rc<=0; ri<=0;
   shift<=0; rx_data<=0; rx_valid<=0; framing_error<=0;
  end else begin
   rx_meta<=rx; rx_sync<=rx_meta;
   rx_valid<=0; framing_error<=0;
   if(!tx_busy) begin
    tx<=1;
    if(tx_start) begin
     frame<={1'b1,tx_data,1'b0}; tx<=0; tx_busy<=1; tc<=0; ti<=0;
    end
   end else if(tc==CLKS_PER_BIT-1) begin
    tc<=0;
    if(ti==9) begin tx_busy<=0; tx<=1; end
    else begin ti<=ti+1'b1; tx<=frame[ti+1'b1]; end
   end else tc<=tc+1'b1;
   case(state)
    0: if(!rx_sync) begin state<=1; rc<=0; end
    1: if(rc==(CLKS_PER_BIT/2)-1) begin
     rc<=0;
     if(!rx_sync) begin state<=2; ri<=0; end else state<=0;
    end else rc<=rc+1'b1;
    2: if(rc==CLKS_PER_BIT-1) begin
     rc<=0; shift[ri]<=rx_sync;
     if(ri==7) state<=3; else ri<=ri+1'b1;
    end else rc<=rc+1'b1;
    3: if(rc==CLKS_PER_BIT-1) begin
     rc<=0; state<=0;
     if(rx_sync) begin rx_data<=shift; rx_valid<=1; end
     else framing_error<=1;
    end else rc<=rc+1'b1;
   endcase
  end
 end
endmodule
