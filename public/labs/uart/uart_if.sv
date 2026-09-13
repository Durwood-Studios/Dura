interface uart_if(input logic clk);
 logic rst=1, start=0;
 logic [7:0] data=0;
 logic tx,busy,valid,error;
 logic [7:0] received;
endinterface
