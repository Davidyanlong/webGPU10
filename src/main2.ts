import $ from 'jquery';
import { CheckWebGPU } from './helper';
import { Shaders } from './shader';

const createTriangle = async (color='(1.0, 0.0, 0.0, 1.0)')=>{
    const checkgpu = CheckWebGPU();
    if(checkgpu.includes('not support WebGPU')){
        console.log(checkgpu)
        throw('not support WebGPU')
    }
    const canvas = document.querySelector('#canvas-webgpu') as HTMLCanvasElement;
    
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter
    const device = await adapter?.requestDevice() as GPUDevice
    
    const context = canvas.getContext('webgpu')as unknown  as GPUCanvasContext
    
    console.log(canvas.getContext('webgpu'))
    const swapChainFormat = 'bgra8unorm'
    
    const swapChain = context.configure({
        device,
        format:swapChainFormat
    })

    const shader = Shaders(color);

    const pipeline = device.createRenderPipeline({
        vertex:{
            module:device.createShaderModule({
               code:shader.vertex
            }),
            entryPoint:'main'
        },
        fragment:{
            module:device.createShaderModule({
                code: shader.fragment
            }),
            entryPoint:'main',
            targets:[{
                format:swapChainFormat
            }]
        },
        primitive: {
            topology: "triangle-list"
        }
    })
    const gpuColor:GPUColor=[0.5,0.8,0.8,1]
    const commandEncoder = device.createCommandEncoder();
    const textureView:GPUTextureView = context.getCurrentTexture().createView()
    
    const renderPassDescriptor: GPURenderPassDescriptor = {
        // @ts-ignore
        colorAttachments:[{
          view: textureView,
          loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        }],
      };
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline)
    renderPass.draw(3,1,0,0);
    renderPass.endPass();
    device.queue.submit([commandEncoder.finish()])
}

createTriangle();
$('#id-btn').on('click',()=>{
    const color = $('#id-color').val() as string
    createTriangle(color)
})