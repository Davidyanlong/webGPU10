import $ from 'jquery';
import { CheckWebGPU } from './helper';
import { Shaders } from './shader';

let requestId:any = null

const createPrimitive = async (primitiveType:string = 'point-list')=>{
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

      let indexFormat
      if(primitiveType==='line-strip'){
        indexFormat = 'uint32'
      }

      const shader = Shaders();
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
          topology: primitiveType as GPUPrimitiveTopology,
          ...(indexFormat?{stripIndexFormat:indexFormat as GPUIndexFormat}:{})
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
              storeOp: 'store',  // 储存模式
            },
          ],
        };
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.draw(6);
        passEncoder.endPass();
    
        device.queue.submit([commandEncoder.finish()]);
        requestId =  requestAnimationFrame(frame);
      }
    
      requestId = requestAnimationFrame(frame);
    
}


createPrimitive();

$('#id-primitive').on('change',(e)=>{
  const primitiveType = $(e.target).val() as string
  createPrimitive(primitiveType)
})
