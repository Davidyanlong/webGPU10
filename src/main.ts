import $ from 'jquery'
import { InitGPU,CreateGPUBuffer,
  CreateAnimation,
  CreateTransforms,CreateViewProjection, CreateGPUBufferUnit } from './helper';
import { Shaders } from './shader';
import { 
  cubeData1
} from './vertex_data'
import { mat4, vec3 } from 'gl-matrix'

const createCamera = require('3d-view-controls')


const Create3DObject = async (isAnimation = true)=>{
       const {device, context, presentationFormat,canvas} = await InitGPU()

       const vertexData = cubeData1()
      const numberOfVertices = vertexData.indexData.length
      const vertexBuffer = CreateGPUBuffer(device, vertexData.vertexData)
      const indexBuffer = CreateGPUBufferUnit(device,vertexData.indexData)
      const shader = Shaders();
      const pipeline = device.createRenderPipeline({
        vertex: {
          module: device.createShaderModule({
            code: shader.vertex,
          }),
          entryPoint: 'main',
          buffers:[
            {
              arrayStride: 24,
              attributes:[{
                shaderLocation:0,
                format:"float32x3",
                offset:0
              },
              {
                shaderLocation:1,
                format:"float32x3",
                offset: 12
              }]
            },
          ]
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
          cullMode:"back"   // 优化性能
        },
        depthStencil:{
          format:"depth24plus",
          depthWriteEnabled:true,
          depthCompare:"less"
        }
      });
    
        // Sample is no longer the active page.
        
        const modelMatrix = mat4.create()
        let vMatrix = mat4.create()

        const mvpMatrix = mat4.create()
        const vp = CreateViewProjection(canvas.clientWidth/ canvas.clientHeight)
        const vpMatrix = vp.viewProjectionMatrix

        let rotation =vec3.fromValues(0,0,0)
        var camera = createCamera(canvas,vp.cameraOption)

        const uniformBuffer = device.createBuffer({
          size:64,
          usage:GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        const uniformBindGroup = device.createBindGroup({
          layout:pipeline.getBindGroupLayout(0),
          entries:[
            {
              binding:0,
              resource:{
                buffer:uniformBuffer,
                offset:0,
                size:64
              }
            }
          ]
        })
       
        let textureView = context.getCurrentTexture().createView();
        const depthTexture = device.createTexture({
          size:[canvas.clientWidth * window.devicePixelRatio, canvas.clientHeight * window.devicePixelRatio, 1],
          format:"depth24plus",
          usage:GPUTextureUsage.RENDER_ATTACHMENT
        })

    
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
              storeOp: 'store',  // 储存模式
            },
          ],
          depthStencilAttachment:{
            view:depthTexture.createView(),
            depthLoadValue:1.0,
            depthStoreOp:'store',
            stencilLoadValue:0,
            stencilStoreOp:'store'
          }
        };

        function draw(){
          if(!isAnimation){
            if(camera.tick()){
              const pMatrix =vp.projectionMatrix
              vMatrix = camera.matrix
              mat4.multiply(vpMatrix,pMatrix,vMatrix)
            }
          }
          CreateTransforms(modelMatrix,vec3.fromValues(0,0,0),rotation)
          mat4.multiply(mvpMatrix,vpMatrix,modelMatrix)
          device.queue.writeBuffer(uniformBuffer,0,mvpMatrix as ArrayBuffer)
          textureView = context.getCurrentTexture().createView();
          //@ts-ignore
          renderPassDescriptor.colorAttachments[0].view = textureView
          const commandEncoder = device.createCommandEncoder();
          const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
          passEncoder.setPipeline(pipeline)
          passEncoder.setVertexBuffer(0, vertexBuffer)
          passEncoder.setIndexBuffer(indexBuffer,'uint32')

          passEncoder.setBindGroup(0,uniformBindGroup)
          passEncoder.drawIndexed(numberOfVertices)
          passEncoder.endPass();
      
          device.queue.submit([commandEncoder.finish()]);
        }

      CreateAnimation(draw,rotation,isAnimation)    
     
}


Create3DObject()

$('#id-radio input:radio').on('click',function(){
  let val = $('input:checked').val()
  if(val==='animation'){
    Create3DObject(true)
  }else{
    Create3DObject(false)
  }
})



