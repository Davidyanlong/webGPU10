import $ from 'jquery';
import { CheckWebGPU } from './helper';
import { Shaders } from './shader';

let requestId:any = null

const createTriangle = async (color='(1.0, 0.0, 0.0, 1.0)')=>{
    const checkgpu = CheckWebGPU();
    if(checkgpu.includes('not support WebGPU')){
        console.log(checkgpu)
        throw('not support WebGPU')
    }
    const canvas = document.querySelector('#canvas-webgpu') as HTMLCanvasElement;
    
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter
    const device = await adapter?.requestDevice() as GPUDevice
    
    const context = canvas.getContext('webgpu')as unknown  as GPUCanvasContext
  
    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const presentationFormat = context.getPreferredFormat(adapter);

    context.configure({
        device,
        format: presentationFormat,
        size: presentationSize,
      });
      const shader = Shaders(color);
      const pipeline = device.createRenderPipeline({
        vertex: {
          module: device.createShaderModule({
            code: shader.vertex,
          }),
          entryPoint: 'main',
        },
        fragment: {
          module: device.createShaderModule({
            code: shader.fragment,
          }),
          entryPoint: 'main',
          targets: [
            {
              format: presentationFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });
      if(requestId!==null) cancelAnimationFrame(requestId)
      function frame() {
        // Sample is no longer the active page.
    
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
    
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
              storeOp: 'store',
            },
          ],
        };
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.draw(3, 1, 0, 0);
        passEncoder.endPass();
    
        device.queue.submit([commandEncoder.finish()]);
        requestId =  requestAnimationFrame(frame);
      }
    
      requestId = requestAnimationFrame(frame);
    
}


createTriangle();
$('#id-btn').on('click',()=>{
    const color = $('#id-color').val() as string
    createTriangle(color)
})