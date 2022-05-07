import { ShaderMaterial } from "three";

export default class ShaderBaseMaterial extends ShaderMaterial {
    constructor(parameters) {
        super();
        console.log(parameters);
        
    }
}