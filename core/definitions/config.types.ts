export interface Config {
  type_mapping: TypeMapping[]
  var_mapping: VarMapping[]
}

interface TypeMapping {
  hddl_type: string
  ocl_type: string
}

interface VarMapping {
  task_id: string
  map: {
    gm_var: string
    hddl_var: string
  }[]
}