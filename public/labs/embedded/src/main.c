#include "stm32f4xx_hal.h"
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "pipeline_health.h"
#include <stdio.h>

/* STM32F407VG Discovery, HSI16MHz, PA1 ADC, PA2 USART2 TX. No actuators. */
static ADC_HandleTypeDef adc;
static DMA_HandleTypeDef dma;
static TIM_HandleTypeDef timer;
static UART_HandleTypeDef uart;
static IWDG_HandleTypeDef watchdog;
static uint16_t samples[32] __attribute__((aligned(4)));
typedef struct { uint32_t sequence; uint16_t values[16]; } SampleBlock;
static QueueHandle_t blocks;
static volatile uint32_t dropped;
static uint32_t sequence;

static void fail(void) { __disable_irq(); for (;;) {} }
void vApplicationMallocFailedHook(void) { fail(); }
void vApplicationStackOverflowHook(TaskHandle_t task, char *name) { (void)task; (void)name; fail(); }
void HardFault_Handler(void) { fail(); }
void DMA2_Stream0_IRQHandler(void) { HAL_DMA_IRQHandler(&dma); }
extern void xPortSysTickHandler(void);
void SysTick_Handler(void) {
    HAL_IncTick();
    if (xTaskGetSchedulerState() != taskSCHEDULER_NOT_STARTED) xPortSysTickHandler();
}
static void enqueue(unsigned offset) {
    SampleBlock block;
    block.sequence = sequence++;
    for (unsigned i = 0; i < 16; ++i) block.values[i] = samples[offset + i];
    BaseType_t wake = pdFALSE;
    if (xQueueSendFromISR(blocks, &block, &wake) != pdPASS) ++dropped;
    portYIELD_FROM_ISR(wake);
}
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *handle) { if (handle == &adc) enqueue(0); }
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *handle) { if (handle == &adc) enqueue(16); }
void HAL_ADC_ErrorCallback(ADC_HandleTypeDef *handle) { (void)handle; ++dropped; }

static void peripherals(void) {
    __HAL_RCC_GPIOA_CLK_ENABLE(); __HAL_RCC_GPIOD_CLK_ENABLE();
    __HAL_RCC_DMA2_CLK_ENABLE(); __HAL_RCC_ADC1_CLK_ENABLE();
    __HAL_RCC_TIM2_CLK_ENABLE(); __HAL_RCC_USART2_CLK_ENABLE();
    GPIO_InitTypeDef gpio = {0};
    gpio.Pin = GPIO_PIN_1; gpio.Mode = GPIO_MODE_ANALOG; gpio.Pull = GPIO_NOPULL;
    HAL_GPIO_Init(GPIOA, &gpio);
    gpio.Pin = GPIO_PIN_2; gpio.Mode = GPIO_MODE_AF_PP; gpio.Alternate = GPIO_AF7_USART2;
    gpio.Speed = GPIO_SPEED_FREQ_HIGH; HAL_GPIO_Init(GPIOA, &gpio);
    gpio.Pin = GPIO_PIN_12; gpio.Mode = GPIO_MODE_OUTPUT_PP; HAL_GPIO_Init(GPIOD, &gpio);
    uart.Instance = USART2; uart.Init.BaudRate = 115200; uart.Init.WordLength = UART_WORDLENGTH_8B;
    uart.Init.StopBits = UART_STOPBITS_1; uart.Init.Parity = UART_PARITY_NONE;
    uart.Init.Mode = UART_MODE_TX; uart.Init.HwFlowCtl = UART_HWCONTROL_NONE; uart.Init.OverSampling = UART_OVERSAMPLING_16;
    if (HAL_UART_Init(&uart) != HAL_OK) fail();
    dma.Instance = DMA2_Stream0; dma.Init.Channel = DMA_CHANNEL_0;
    dma.Init.Direction = DMA_PERIPH_TO_MEMORY; dma.Init.PeriphInc = DMA_PINC_DISABLE;
    dma.Init.MemInc = DMA_MINC_ENABLE; dma.Init.PeriphDataAlignment = DMA_PDATAALIGN_HALFWORD;
    dma.Init.MemDataAlignment = DMA_MDATAALIGN_HALFWORD; dma.Init.Mode = DMA_CIRCULAR;
    dma.Init.Priority = DMA_PRIORITY_HIGH; dma.Init.FIFOMode = DMA_FIFOMODE_DISABLE;
    if (HAL_DMA_Init(&dma) != HAL_OK) fail();
    __HAL_LINKDMA(&adc, DMA_Handle, dma);
    /* Priority5 is inside the FreeRTOS FromISR API contract. */
    HAL_NVIC_SetPriority(DMA2_Stream0_IRQn, 5, 0); HAL_NVIC_EnableIRQ(DMA2_Stream0_IRQn);
    adc.Instance = ADC1; adc.Init.ClockPrescaler = ADC_CLOCK_SYNC_PCLK_DIV4;
    adc.Init.Resolution = ADC_RESOLUTION_12B; adc.Init.ScanConvMode = DISABLE;
    adc.Init.ContinuousConvMode = DISABLE; adc.Init.DiscontinuousConvMode = DISABLE;
    adc.Init.ExternalTrigConvEdge = ADC_EXTERNALTRIGCONVEDGE_RISING;
    adc.Init.ExternalTrigConv = ADC_EXTERNALTRIGCONV_T2_TRGO; adc.Init.DataAlign = ADC_DATAALIGN_RIGHT;
    adc.Init.NbrOfConversion = 1; adc.Init.DMAContinuousRequests = ENABLE; adc.Init.EOCSelection = ADC_EOC_SINGLE_CONV;
    if (HAL_ADC_Init(&adc) != HAL_OK) fail();
    ADC_ChannelConfTypeDef channel = {0}; channel.Channel = ADC_CHANNEL_1;
    channel.Rank = 1; channel.SamplingTime = ADC_SAMPLETIME_84CYCLES;
    if (HAL_ADC_ConfigChannel(&adc, &channel) != HAL_OK) fail();
    timer.Instance = TIM2; timer.Init.Prescaler = SystemCoreClock / 1000000U - 1U;
    timer.Init.CounterMode = TIM_COUNTERMODE_UP; timer.Init.Period = 999;
    timer.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
    if (HAL_TIM_Base_Init(&timer) != HAL_OK) fail();
    TIM_MasterConfigTypeDef master = {0}; master.MasterOutputTrigger = TIM_TRGO_UPDATE;
    master.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
    if (HAL_TIMEx_MasterConfigSynchronization(&timer, &master) != HAL_OK) fail();
}
static void pipeline(void *unused) {
    (void)unused;
    PipelineHealth health = {0};
    watchdog.Instance = IWDG; watchdog.Init.Prescaler = IWDG_PRESCALER_32; watchdog.Init.Reload = 1000;
    if (HAL_IWDG_Init(&watchdog) != HAL_OK) fail();
    if (HAL_ADC_Start_DMA(&adc, (uint32_t *)samples, 32) != HAL_OK || HAL_TIM_Base_Start(&timer) != HAL_OK) fail();
    for (;;) {
        SampleBlock block;
        if (xQueueReceive(blocks, &block, pdMS_TO_TICKS(100)) != pdPASS) fail();
        uint32_t sum = 0; bool valid = true;
        for (unsigned i = 0; i < 16; ++i) { sum += block.values[i]; valid = valid && block.values[i] <= 4095U; }
        char line[64];
        int length = snprintf(line, sizeof line, "seq=%lu avg=%lu drop=%lu\r\n", (unsigned long)block.sequence, (unsigned long)(sum / 16U), (unsigned long)dropped);
        bool sent = length > 0 && (unsigned)length < sizeof line && HAL_UART_Transmit(&uart, (uint8_t *)line, (uint16_t)length, 20) == HAL_OK;
        if (!pipeline_accept(&health, block.sequence, HAL_GetTick(), valid, dropped != 0, sent)) fail();
        HAL_GPIO_TogglePin(GPIOD, GPIO_PIN_12);
        /* Refresh only after the whole pipeline advanced successfully. */
        if (HAL_IWDG_Refresh(&watchdog) != HAL_OK) fail();
    }
}
int main(void) {
    HAL_Init(); SystemCoreClockUpdate();
    /* Keep reset HSI: no crystal or PLL assumptions hidden in setup. */
    if (SystemCoreClock != 16000000U) fail();
    peripherals();
    blocks = xQueueCreate(4, sizeof(SampleBlock));
    if (!blocks || xTaskCreate(pipeline, "pipeline", 512, NULL, 2, NULL) != pdPASS) fail();
    vTaskStartScheduler();
    fail();
}
