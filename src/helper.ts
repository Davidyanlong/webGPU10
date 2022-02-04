import { mat4, vec3 } from "gl-matrix"

export const CreateTransforms=(modelMatrix:mat4, translation:vec3=[0, 0, 0],
    rotation:vec3=[0, 0, 0], scaling:vec3=[1, 1, 1])=>{
        const rotateXMat = mat4.create()
        const rotateYMat = mat4.create()
        const rotateZMat = mat4.create()
        const translationMat = mat4.create()
        const scaleMat = mat4.create()

        mat4.fromTranslation(translationMat, translation)
        mat4.fromXRotation(rotateXMat, rotation[0])
        mat4.fromYRotation(rotateYMat, rotation[1])
        mat4.fromZRotation(rotateZMat, rotation[2])
        mat4.fromScaling(scaleMat, scaling)

        mat4.multiply(modelMatrix,rotateXMat,scaleMat)
        mat4.multiply(modelMatrix,rotateYMat,modelMatrix)
        mat4.multiply(modelMatrix,rotateZMat,modelMatrix)
        mat4.multiply(modelMatrix,translationMat,modelMatrix)

}


export const CreateViewProjection=(respectRatio = 1.0, cameraPosition:vec3=[2, 2, 4], lookDirection:vec3=[0, 0, 0], 
    upDirection:vec3=[0, 1, 0])=>{
        const viewMatrix = mat4.create()
        const projectionMatrix = mat4.create()
        const viewProjectionMatrix = mat4.create()
        const PI2 = Math.PI * 2
        mat4.perspective(projectionMatrix, PI2/5, respectRatio,0.1, 100.0)
        mat4.lookAt(viewMatrix,cameraPosition,lookDirection,upDirection)
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix)

        const cameraOption = {
            eye:cameraPosition,
            center:lookDirection,
            zoomMax:100,
            zoomSpeed:2
        }

        return {
            viewMatrix,
            projectionMatrix,
            viewProjectionMatrix,
            cameraOption
        }

}

export const CreateGPUBufferUnit = (device:GPUDevice, data:Uint32Array,
    usageFlag:GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST)=>{
    const buffer = device.createBuffer({
        size:data.byteLength,
        usage:usageFlag,
        mappedAtCreation:true   // 设置为true 可以通过getMappedRange 获取GPU中的缓存
    })

    new Uint32Array(buffer.getMappedRange()).set(data)
    // 更改为unmap状态 GPU才可以使用
    buffer.unmap()
    return buffer
}

export const CreateGPUBuffer = (device:GPUDevice, data:Float32Array,
    usageFlag:GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST)=>{
    const buffer = device.createBuffer({
        size:data.byteLength,
        usage:usageFlag,
        mappedAtCreation:true   // 设置为true 可以通过getMappedRange 获取GPU中的缓存
    })

    new Float32Array(buffer.getMappedRange()).set(data)
    // 更改为unmap状态 GPU才可以使用
    buffer.unmap()
    return buffer
}

export const InitGPU = async ()=>{
    const checkGPU = CheckWebGPU()
    if(checkGPU.includes('not support WebGPU')){
        console.log(checkGPU)
        throw('not support WebGPU')
    }
    const canvas = document.querySelector('#canvas-webgpu') as HTMLCanvasElement;
    
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter
    let device = await adapter?.requestDevice() as GPUDevice

    device.lost.then((info) => {
        console.error(`WebGPU device was lost: ${info.message}`);
        // @ts-ignore
        device = null;

        // Many causes for lost devices are transient, so applications should try getting a
        // new device once a previous one has been lost unless the loss was caused by the
        // application intentionally destroying the device. Note that any WebGPU resources
        // created with the previous device (buffers, textures, etc) will need to be
        // re-created with the new one.
        if (info.reason != 'destroyed') {
            InitGPU();
        }
    });
    
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

    return {device, canvas, context, presentationFormat}
}

export const CheckWebGPU = () => {
    let result = 'Great, your current browser supports WebGPU!';
        if (!navigator.gpu) {
           result = `Your current browser does not support WebGPU! Make sure you are on a system 
                     with WebGPU enabled. Currently, SPIR-WebGPU is only supported in  
                     <a href="https://www.google.com/chrome/canary/">Chrome canary</a>
                     with the flag "enable-unsafe-webgpu" enabled. See the 
                     <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status"> 
                     Implementation Status</a> page for more details.                   
                    `;
        } 
    return result;
}