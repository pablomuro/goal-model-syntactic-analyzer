export interface GoalModel {
  actors: Actor[]
  orphans: []
  dependencies: []
  links: Link[]
  display: any
  tool: string
  istar: string
  saveDate: string
  diagram: any

}
export interface Actor {
  id: string,
  text: string,
  type: 'istar.Actor',
  x: number,
  y: number,
  customProperties: {
    Description: ''
  },
  nodes: GoalNode[]
}
export interface GoalNode {
  id: string
  text: string
  type: 'istar.Goal' | 'istar.Task',
  x: number
  y: number,
  customProperties: NodeCustomProperties
}
export interface GoalNodeTree extends GoalNode {
  parent: GoalNodeTree | null
  children: GoalNodeTree[]
}
export interface NodeCustomProperties {
  [key: string]: string | undefined
  Description?: string
  GoalType?: 'Query' | 'Achieve' | 'Perform'
  Controls?: string
  QueriedProperty?: string
  Monitors?: string
  AchieveCondition?: string
  UniversalAchieveCondition?: string
  Context?: string
  Trigger?: string
  Condition?: string
  Location?: string
  Params?: string
  RobotNumber?: string
  Group?: string
}
export interface Link {
  id: string
  type: 'istar.AndRefinementLink' | 'istar.OrRefinementLink'
  source: string
  target: string
}

interface LinkType {

}