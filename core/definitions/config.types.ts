export interface Config {
  configuration: any
  type_mapping: TypeMapping[]
  var_mapping: VarMapping[]
  location_types: string[]
}

export interface TypeMapping {
  hddl_type: string
  ocl_type: string
}

export interface VarMapping {
  task_id: string
  map: {
    gm_var: string
    hddl_var: string
  }[]
}